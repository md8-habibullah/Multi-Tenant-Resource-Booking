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
          summary: 'Provision a new organization and administrator account',
          description: 'Initializes a new tenant environment by creating an organization record alongside its master administrator (ORG_ADMIN).',
          tags: ['Auth'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema:
                {
                  type: 'object', properties:
                  {
                    email: { type: 'string' },
                    password: { type: 'string' },
                    organizationName: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Tenant successfully provisioned' } }
        }
      },
      '/api/auth/employee': {
        post: {
          summary: 'Onboard a new employee to an existing organization',
          description: 'Creates a standard employee user account scoped to a specific organization. Employees can book resources but lack administrative privileges.',
          tags: ['Auth'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json':
              {
                schema:
                {
                  type: 'object',
                  properties:
                  {
                    email: { type: 'string' },
                    password: { type: 'string' },
                    organizationId: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Employee successfully onboarded' } }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Authenticate and retrieve access token',
          description: 'Validates user credentials and issues a JWT Bearer token used to authorize subsequent API requests.',
          tags: ['Auth'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json':
              {
                schema:
                {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Authentication successful' } }
        }
      },
      '/api/auth/logout': {
        post: {
          summary: 'Terminate the current session',
          description: 'Clears the HTTP-only JWT cookie to securely log the user out.',
          tags: ['Auth'],
          security: [],
          responses: {
            200: {
              description: 'Logged out successfully'
            }
          }
        }
      },
      '/api/members': {
        get: {
          summary: 'List organization members',
          description: 'Returns a list of all users belonging to the currently authenticated user’s organization.',
          tags: ['Organizations'],
          responses: {
            200: { description: 'Members retrieved successfully' }
          }
        }
      },
      '/api/organizations/me': {
        get: {
          summary: 'Retrieve my organization details',
          description: 'Fetches the operational configuration of the authenticated user’s organization.',
          tags: ['Organizations'],
          responses: {
            200: { description: 'Organization retrieved successfully' }
          }
        }
      },
      '/api/organizations': {
        get: {
          summary: 'Retrieve organization configuration',
          description: 'Fetches the operational configuration of the authenticated user’s organization, including timezone and working hours.',
          tags: ['Organizations'],
          responses: { 200: { description: 'Configuration retrieved successfully' } }
        },
        put: {
          summary: 'Update operational configuration',
          description: 'Modifies the tenant-wide operational settings, such as working hours boundaries and localized timezones. Restricted to ORG_ADMIN.',
          tags: ['Organizations'],
          requestBody: {
            required: true,
            content: {
              'application/json':
              {
                schema:
                {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    timezone: { type: 'string' },
                    workingHours: {
                      type: 'object',
                      properties: {
                        start: { type: 'string' },
                        end: { type: 'string' },
                        daysOfWeek: {
                          type: 'array',
                          items: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Configuration updated successfully' } }
        }
      },
      '/api/resources': {
        get: {
          summary: 'List available resources',
          description: 'Retrieves all active, non-deleted resources associated with the current tenant.',
          tags: ['Resources'],
          responses: {
            200: {
              description: 'Resources retrieved successfully'
            }
          }
        },
        post: {
          summary: 'Create a new bookable resource',
          description: 'Provisions a new resource (e.g., conference room, equipment) specifying mandatory buffer periods applied before and after any booking.',
          tags: ['Resources'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    bufferTimeBefore: { type: 'number' },
                    bufferTimeAfter: { type: 'number' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Resource successfully provisioned' } }
        }
      },
      '/api/bookings': {
        post: {
          summary: 'Schedule a resource',
          description: 'Attempts to book a specific resource. The engine algorithmically verifies that the requested time slot falls strictly within the organization’s working hours and does not mathematically overlap with existing bookings or their surrounding buffer constraints.',
          tags: ['Bookings'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { resourceId: { type: 'string' }, startTime: { type: 'string', format: 'date-time' }, endTime: { type: 'string', format: 'date-time' } } } } }
          },
          responses: { 201: { description: 'Booking successfully scheduled' } }
        }
      },
      '/api/bookings/my': {
        get: {
          summary: 'List my bookings',
          description: 'Retrieves all bookings made by the currently authenticated user within their organization.',
          tags: ['Bookings'],
          responses: {
            200: { description: 'Bookings retrieved successfully' }
          }
        }
      },
      '/api/bookings/{id}': {
        delete: {
          summary: 'Cancel a booking',
          description: 'Cancels a specific booking. Users can only cancel their own bookings, while ORG_ADMINs can cancel any booking within their organization.',
          tags: ['Bookings'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Booking cancelled successfully' },
            404: { description: 'Booking not found or access denied' }
          }
        }
      },
      '/api/bookings/availability/{resourceId}': {
        get: {
          summary: 'Calculate available time slots',
          description: 'Dynamically computes open scheduling blocks for a given date. The availability engine slices the organization’s working shift, subtracts existing bookings, and factors in buffer algebra to output only truly available time spans.',
          tags: ['Bookings'],
          parameters: [
            { name: 'resourceId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'date', in: 'query', required: true, schema: { type: 'string', format: 'date' } }
          ],
          responses: { 200: { description: 'Availability matrix computed successfully' } }
        }
      }
    }
  },
  apis: ['./src/modules/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
