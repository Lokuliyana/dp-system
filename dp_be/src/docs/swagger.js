const swaggerJSDoc = require('swagger-jsdoc')
const env = require('../config/env')

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'AnandaDp Backend API',
      version: '1.0.0',
      description: 'Auto-generated OpenAPI docs for AnandaDp backend',
    },
    servers: [
      {
        url: `${env.apiBaseUrl}${env.apiPrefix}`,
        description: 'API Server',
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
        ObjectId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
        ApiResponseOk: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {},
          },
        },
        ApiResponseCreated: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {},
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            statusCode: { type: 'number' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js',
  ],
}

module.exports = swaggerJSDoc(options)
