const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const pool = require('./config/database');

const app = express();

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origen (Postman, mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // En desarrollo, permitir cualquier localhost con cualquier puerto
    if (process.env.NODE_ENV !== 'production') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    
    // En producción, usar la lista de orígenes permitidos
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:5173', 'http://localhost:5174'];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test de conexión a BD
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      message: 'Servidor funcionando correctamente',
      database: 'Conectado',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Error de conexión a la base de datos',
      error: error.message
    });
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API de Rotisería - Sabores de mi Tierra',
    version: '1.0.0',
    status: 'En desarrollo'
  });
});

// Documentación Swagger (opcional, solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  try {
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpec = require('./config/swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('📚 Documentación Swagger disponible en http://localhost:3000/api-docs');
  } catch (error) {
    console.warn('⚠️  Swagger no disponible:', error.message);
  }
}

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/planes-vianda', require('./routes/planesVianda'));
app.use('/api/retiros-vianda', require('./routes/retirosVianda'));
app.use('/api/pedidos-cocina', require('./routes/pedidosCocina'));
app.use('/api/pagos-vianda', require('./routes/pagosVianda'));
app.use('/api/promociones', require('./routes/promociones'));
app.use('/api/reportes', require('./routes/reportes'));

// Manejo de errores
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Ambiente: ${config.nodeEnv}`);
});

module.exports = app;

