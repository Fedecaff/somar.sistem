const { Pool } = require('pg');
require('dotenv').config();

// Configuración de conexión
let poolConfig;

// Priorizar connection string si está disponible (útil para servicios cloud)
if (process.env.DB_URL) {
  poolConfig = {
    connectionString: process.env.DB_URL
  };
} else {
  // Configuración individual (para desarrollo local o cloud)
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'rotiseria_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    // SSL solo para conexiones remotas (Supabase, etc.)
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 20
  };
}

const pool = new Pool(poolConfig);

// Test de conexión
pool.on('connect', () => {
  console.log('✅ Conectado a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión a la base de datos:', err);
});

module.exports = pool;

