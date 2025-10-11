import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MIR Flashcard API',
      version,
      description: 'API para el manejo de flashcards del MIR',
      contact: {
        name: 'Soporte',
        email: 'soporte@mirflashcard.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://api.mirflashcard.com/api',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único del usuario',
              example: '5f8d0f4d7f8f8c2b2c2b2b2b'
            },
            name: {
              type: 'string',
              description: 'Nombre del usuario',
              example: 'Juan Pérez'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario',
              example: 'juan@example.com'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'Rol del usuario',
              example: 'user'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del usuario'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización del usuario'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Mensaje de error',
              example: 'Error al procesar la solicitud'
            },
            error: {
              type: 'object',
              properties: {
                statusCode: {
                  type: 'number',
                  example: 400
                },
                message: {
                  type: 'string',
                  example: 'Error de validación'
                },
                errors: {
                  type: 'object',
                  additionalProperties: {
                    type: 'string'
                  },
                  example: {
                    email: 'El correo electrónico es requerido',
                    password: 'La contraseña debe tener al menos 6 caracteres'
                  }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/controllers/*.ts'], // Ruta a tus controladores
};

const specs = swaggerJsdoc(options);

export default specs;
