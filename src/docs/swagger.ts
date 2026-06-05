import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Multi-Tenant Resource Booking API',
      version: '1.0.0',
      description: 'API documentation for the Multi-Tenant Resource Booking system',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      '/api/auth/register': {
        post: {
          summary: 'Register an ORG_ADMIN',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' }, organizationName: { type: 'string' } } } } }
          },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/api/auth/employee': {
        post: {
          summary: 'Register an EMPLOYEE',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' }, organizationId: { type: 'string' } } } } }
          },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Login to get JWT',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } }
          },
          responses: { 200: { description: 'OK' } }
        }
      },
      '/api/organizations': {
        get: {
          summary: 'Get organization details',
          tags: ['Organizations'],
          responses: { 200: { description: 'OK' } }
        },
        put: {
          summary: 'Update organization',
          tags: ['Organizations'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { timezone: { type: 'string' } } } } }
          },
          responses: { 200: { description: 'OK' } }
        }
      },
      '/api/resources': {
        get: {
          summary: 'List resources',
          tags: ['Resources'],
          responses: { 200: { description: 'OK' } }
        },
        post: {
          summary: 'Create a resource',
          tags: ['Resources'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, bufferTimeBefore: { type: 'number' }, bufferTimeAfter: { type: 'number' } } } } }
          },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/api/bookings': {
        post: {
          summary: 'Create a booking',
          tags: ['Bookings'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { resourceId: { type: 'string' }, startTime: { type: 'string', format: 'date-time' }, endTime: { type: 'string', format: 'date-time' } } } } }
          },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/api/bookings/availability/{resourceId}': {
        get: {
          summary: 'Get availability',
          tags: ['Bookings'],
          parameters: [
            { name: 'resourceId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'date', in: 'query', required: true, schema: { type: 'string', format: 'date' } }
          ],
          responses: { 200: { description: 'OK' } }
        }
      }
    }
  },
  apis: ['./src/modules/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
