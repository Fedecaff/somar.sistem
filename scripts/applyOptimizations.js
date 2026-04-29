require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/database');

async function applyOptimizations() {
  try {
    console.log('🔧 Aplicando optimizaciones de índices...\n');

    // Leer el archivo de optimizaciones
    const optimizationsPath = path.join(__dirname, '../database/optimizaciones.sql');
    const sql = fs.readFileSync(optimizationsPath, 'utf8');

    // Separar las consultas (cada CREATE INDEX)
    // Eliminar comentarios de línea completa
    const lines = sql.split('\n')
      .map(line => {
        // Eliminar comentarios al final de línea
        const commentIndex = line.indexOf('--');
        if (commentIndex !== -1) {
          return line.substring(0, commentIndex).trim();
        }
        return line.trim();
      })
      .filter(line => line.length > 0 && !line.startsWith('--'));

    // Reconstruir consultas completas
    const queries = [];
    let currentQuery = '';
    
    for (const line of lines) {
      currentQuery += (currentQuery ? ' ' : '') + line;
      if (line.endsWith(';')) {
        const query = currentQuery.replace(/;$/, '').trim();
        if (query.toLowerCase().includes('create index')) {
          queries.push(query);
        }
        currentQuery = '';
      }
    }

    let successCount = 0;
    let errorCount = 0;

    // Ejecutar cada índice
    for (const query of queries) {
      try {
        await pool.query(query);
        // Extraer el nombre del índice de la consulta
        const indexMatch = query.match(/idx_\w+/i);
        const indexName = indexMatch ? indexMatch[0] : 'índice';
        console.log(`✅ ${indexName} creado exitosamente`);
        successCount++;
      } catch (error) {
        // Si el índice ya existe, no es un error crítico
        if (error.message.includes('already exists')) {
          const indexMatch = query.match(/idx_\w+/i);
          const indexName = indexMatch ? indexMatch[0] : 'índice';
          console.log(`ℹ️  ${indexName} ya existe (omitido)`);
        } else {
          console.error(`❌ Error al crear índice:`, error.message);
          errorCount++;
        }
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`   ✅ Índices creados/verificados: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   ❌ Errores: ${errorCount}`);
    }

    // Verificar índices creados
    console.log('\n🔍 Verificando índices creados...\n');
    const verifyQuery = `
      SELECT 
        indexname,
        tablename,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
        AND indexname IN (
          'idx_ventas_fecha_tipo',
          'idx_ventas_fecha_medio_pago',
          'idx_planes_vianda_fechas',
          'idx_retiros_plan_fecha',
          'idx_productos_activos_categoria',
          'idx_promociones_vigentes'
        )
      ORDER BY indexname;
    `;

    const result = await pool.query(verifyQuery);
    
    if (result.rows.length > 0) {
      console.log('Índices encontrados:');
      result.rows.forEach(row => {
        console.log(`   📌 ${row.indexname} (tabla: ${row.tablename})`);
      });
    } else {
      console.log('⚠️  No se encontraron los índices esperados');
    }

    console.log('\n✅ Optimizaciones aplicadas correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al aplicar optimizaciones:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyOptimizations();

