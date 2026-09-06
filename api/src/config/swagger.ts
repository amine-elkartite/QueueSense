import swaggerJsdoc from 'swagger-jsdoc';
export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'QueueSense API', version: '1.0.0', description: 'Know the wait before you go. Real-time queue intelligence API.' },
    servers: [{ url: 'http://localhost:4000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        apiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' }
      },
      schemas: {
        Error: { type: 'object', properties: { success: { type:'boolean', example:false }, error:{ type:'object', properties:{ code:{type:'string'}, message:{type:'string'} } } } },
        QueueUpdate: { type:'object', required:['peopleWaiting','peopleBeingServed','averageServiceTime'], properties:{ peopleWaiting:{type:'integer',minimum:0}, peopleBeingServed:{type:'integer',minimum:0}, averageServiceTime:{type:'integer',minimum:1} } }
      }
    }
  },
  apis: ['./src/routes/*.ts']
});
