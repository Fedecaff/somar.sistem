require('dotenv').config();
const pool = require('../src/config/database');
const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
let authToken = null;

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatTime(ms) {
  if (ms < 100) return `${ms.toFixed(2)}ms`;
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function getColorForTime(ms) {
  if (ms < 100) return 'green';
  if (ms < 500) return 'yellow';
  return 'red';
}

// Función para hacer login y obtener token
async function login() {
  try {
    log('\n🔐 Autenticando...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    authToken = response.data.data.token;
    log('✅ Autenticación exitosa\n', 'green');
    return true;
  } catch (error) {
    log(`❌ Error en autenticación: ${error.message}`, 'red');
    return false;
  }
}

// Función para medir tiempo de endpoint
async function measureEndpoint(name, method, url, data = null, headers = {}) {
  const startTime = Date.now();
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        ...headers
      },
      ...(data && { data })
    };

    await axios(config);
    const duration = Date.now() - startTime;
    return { success: true, duration, error: null };
  } catch (error) {
    const duration = Date.now() - startTime;
    return { 
      success: false, 
      duration, 
      error: error.response?.data?.message || error.message 
    };
  }
}

// Función para medir consulta SQL
async function measureQuery(name, query, params = []) {
  const startTime = Date.now();
  try {
    await pool.query(query, params);
    const duration = Date.now() - startTime;
    return { success: true, duration, error: null };
  } catch (error) {
    const duration = Date.now() - startTime;
    return { success: false, duration, error: error.message };
  }
}

// Función para analizar plan de ejecución
async function analyzeQueryPlan(query, params = []) {
  try {
    const explainQuery = `EXPLAIN ANALYZE ${query}`;
    const result = await pool.query(explainQuery, params);
    return result.rows.map(r => r['QUERY PLAN']).join('\n');
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

async function runPerformanceTests() {
  log('🚀 Iniciando pruebas de rendimiento\n', 'blue');
  log('=' .repeat(60), 'gray');

  // Autenticación
  if (!await login()) {
    process.exit(1);
  }

  const results = {
    endpoints: [],
    queries: []
  };

  // ============================================
  // PRUEBAS DE ENDPOINTS
  // ============================================
  log('\n📡 Probando Endpoints API\n', 'blue');

  const endpointTests = [
    { name: 'GET /api/productos', method: 'GET', url: '/api/productos' },
    { name: 'GET /api/categorias', method: 'GET', url: '/api/categorias' },
    { name: 'GET /api/clientes', method: 'GET', url: '/api/clientes' },
    { name: 'GET /api/reportes/ventas/diarias', method: 'GET', url: '/api/reportes/ventas/diarias?fecha=2025-12-27' },
    { name: 'GET /api/reportes/vianda/planes-activos', method: 'GET', url: '/api/reportes/vianda/planes-activos' },
    { name: 'GET /api/promociones', method: 'GET', url: '/api/promociones' },
  ];

  for (const test of endpointTests) {
    const result = await measureEndpoint(test.name, test.method, test.url);
    results.endpoints.push({ ...test, ...result });
    
    const color = getColorForTime(result.duration);
    const status = result.success ? '✅' : '❌';
    log(`${status} ${test.name}: ${formatTime(result.duration)}`, color);
    if (result.error) {
      log(`   Error: ${result.error}`, 'red');
    }
  }

  // ============================================
  // PRUEBAS DE CONSULTAS SQL
  // ============================================
  log('\n🗄️  Probando Consultas SQL\n', 'blue');

  const queryTests = [
    {
      name: 'Listar productos activos',
      query: 'SELECT * FROM productos WHERE activo = true ORDER BY nombre'
    },
    {
      name: 'Reporte ventas diarias',
      query: `
        SELECT 
          COUNT(*) as total_ventas,
          COALESCE(SUM(total), 0) as total_monto
        FROM ventas
        WHERE fecha_venta >= $1::date 
          AND fecha_venta < ($1::date + INTERVAL '1 day')
      `,
      params: ['2025-12-27']
    },
    {
      name: 'Planes activos',
      query: `
        SELECT * FROM planes_vianda 
        WHERE estado = 'activo' 
          AND fecha_fin >= CURRENT_DATE
      `
    },
    {
      name: 'Productos por categoría',
      query: `
        SELECT * FROM productos 
        WHERE categoria_id = $1 AND activo = true
      `,
      params: [1]
    },
    {
      name: 'Promociones vigentes',
      query: `
        SELECT * FROM promociones 
        WHERE activa = true 
          AND fecha_inicio <= CURRENT_DATE 
          AND fecha_fin >= CURRENT_DATE
      `
    }
  ];

  for (const test of queryTests) {
    const result = await measureQuery(test.name, test.query, test.params || []);
    results.queries.push({ ...test, ...result });
    
    const color = getColorForTime(result.duration);
    const status = result.success ? '✅' : '❌';
    log(`${status} ${test.name}: ${formatTime(result.duration)}`, color);
    if (result.error) {
      log(`   Error: ${result.error}`, 'red');
    }
  }

  // ============================================
  // ANÁLISIS DE PLANES DE EJECUCIÓN
  // ============================================
  log('\n🔍 Analizando planes de ejecución (índices)\n', 'blue');

  const planTests = [
    {
      name: 'Ventas por fecha y tipo',
      query: `
        SELECT * FROM ventas 
        WHERE fecha_venta >= $1::date 
          AND tipo_venta = $2
      `,
      params: ['2025-12-27', 'mostrador']
    },
    {
      name: 'Productos activos por categoría',
      query: `
        SELECT * FROM productos 
        WHERE categoria_id = $1 AND activo = true
      `,
      params: [1]
    }
  ];

  for (const test of planTests) {
    log(`\n📋 ${test.name}:`, 'yellow');
    const plan = await analyzeQueryPlan(test.query, test.params);
    log(plan, 'gray');
  }

  // ============================================
  // RESUMEN
  // ============================================
  log('\n' + '='.repeat(60), 'gray');
  log('\n📊 RESUMEN DE RESULTADOS\n', 'blue');

  // Estadísticas de endpoints
  const endpointTimes = results.endpoints.map(r => r.duration);
  const avgEndpoint = endpointTimes.reduce((a, b) => a + b, 0) / endpointTimes.length;
  const maxEndpoint = Math.max(...endpointTimes);
  const minEndpoint = Math.min(...endpointTimes);

  log('Endpoints API:', 'yellow');
  log(`   Promedio: ${formatTime(avgEndpoint)}`, getColorForTime(avgEndpoint));
  log(`   Más rápido: ${formatTime(minEndpoint)}`, 'green');
  log(`   Más lento: ${formatTime(maxEndpoint)}`, getColorForTime(maxEndpoint));

  // Estadísticas de consultas
  const queryTimes = results.queries.map(r => r.duration);
  const avgQuery = queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length;
  const maxQuery = Math.max(...queryTimes);
  const minQuery = Math.min(...queryTimes);

  log('\nConsultas SQL:', 'yellow');
  log(`   Promedio: ${formatTime(avgQuery)}`, getColorForTime(avgQuery));
  log(`   Más rápida: ${formatTime(minQuery)}`, 'green');
  log(`   Más lenta: ${formatTime(maxQuery)}`, getColorForTime(maxQuery));

  // Recomendaciones
  log('\n💡 RECOMENDACIONES\n', 'blue');
  
  if (maxEndpoint > 500) {
    log('⚠️  Algunos endpoints son lentos (>500ms). Considerar:', 'yellow');
    log('   - Implementar caché para datos frecuentes', 'gray');
    log('   - Optimizar consultas SQL', 'gray');
  } else {
    log('✅ Los endpoints tienen buen rendimiento', 'green');
  }

  if (maxQuery > 100) {
    log('⚠️  Algunas consultas SQL son lentas (>100ms). Verificar:', 'yellow');
    log('   - Uso de índices (ver planes de ejecución arriba)', 'gray');
    log('   - Estructura de consultas', 'gray');
  } else {
    log('✅ Las consultas SQL tienen buen rendimiento', 'green');
  }

  log('\n✅ Pruebas completadas\n', 'green');
  
  await pool.end();
  process.exit(0);
}

// Ejecutar pruebas
runPerformanceTests().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

