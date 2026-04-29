/**
 * Script para crear usuario administrador inicial
 * Ejecutar: node scripts/createAdmin.js
 */

require('dotenv').config();
const UsuarioService = require('../src/services/usuarioService');

async function createAdmin() {
  try {
    const adminData = {
      username: 'admin',
      password: 'admin123', // Cambiar después del primer login
      rol: 'admin',
      nombre_completo: 'Administrador'
    };

    console.log('🔧 Creando usuario administrador...');
    const admin = await UsuarioService.create(adminData);
    
    console.log('✅ Usuario administrador creado exitosamente:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Rol: ${admin.rol}`);
    console.log(`   Nombre: ${admin.nombre_completo}`);
    console.log('\n⚠️  IMPORTANTE: Cambiar la contraseña después del primer login!');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('ya está en uso')) {
      console.log('ℹ️  El usuario administrador ya existe');
      process.exit(0);
    } else {
      console.error('❌ Error al crear usuario administrador:', error.message);
      process.exit(1);
    }
  }
}

createAdmin();

