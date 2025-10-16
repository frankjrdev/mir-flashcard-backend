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
        // Esquema de Usuario
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
        // Esquema de Flashcard
        Flashcard: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único de la flashcard',
              example: '5f8d0f4d7f8f8c2b2c2b2b2b'
            },
            question: {
              type: 'string',
              description: 'Pregunta de la flashcard',
              example: '¿Cuál es la capital de Francia?'
            },
            answer: {
              type: 'string',
              description: 'Respuesta de la flashcard',
              example: 'París'
            },
            subject: {
              type: 'string',
              description: 'ID de la materia a la que pertenece la flashcard',
              example: '5f8d0f4d7f8f8c2b2c2b2b2b'
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard'],
              description: 'Dificultad de la flashcard',
              example: 'medium'
            },
            nextReviewDate: {
              type: 'string',
              format: 'date-time',
              description: 'Próxima fecha de revisión programada'
            },
            lastReviewed: {
              type: 'string',
              format: 'date-time',
              description: 'Última fecha de revisión',
              nullable: true
            },
            reviewCount: {
              type: 'integer',
              description: 'Número de veces que se ha revisado la flashcard',
              example: 3
            },
            createdBy: {
              type: 'string',
              description: 'ID del usuario que creó la flashcard',
              example: '5f8d0f4d7f8f8c2b2c2b2b2b'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación de la flashcard'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización de la flashcard'
            }
          }
        },
        // Esquema de Error
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
      },
      // Respuestas comunes
      responses: {
        Unauthorized: {
          description: 'No autorizado - Se requiere autenticación',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'No autorizado',
                error: {
                  statusCode: 401,
                  message: 'Por favor inicia sesión para acceder a este recurso'
                }
              }
            }
          }
        },
        Forbidden: {
          description: 'Prohibido - No tienes permisos para realizar esta acción',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Acceso denegado',
                error: {
                  statusCode: 403,
                  message: 'No tienes permiso para realizar esta acción'
                }
              }
            }
          }
        },
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'No encontrado',
                error: {
                  statusCode: 404,
                  message: 'El recurso solicitado no fue encontrado'
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
