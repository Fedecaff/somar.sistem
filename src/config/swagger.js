const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Rotisería - Sabores de mi Tierra',
      version: '1.0.0',
      description: 'API REST para sistema de gestión de rotisería con ventas, viandas, promociones y reportes',
      contact: {
        name: 'Soporte API',
        email: 'soporte@rotiseria.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'ERROR_CODE'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operación exitosa'
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js')
  ]
};

let swaggerSpec;
try {
  swaggerSpec = swaggerJsdoc(options);
} catch (error) {
  console.warn('⚠️  Error al generar documentación Swagger:', error.message);
  // Generar spec básico si hay error
  swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'API Rotisería - Sabores de mi Tierra',
      version: '1.0.0'
    },
    paths: {}
  };
}

module.exports = swaggerSpec;

