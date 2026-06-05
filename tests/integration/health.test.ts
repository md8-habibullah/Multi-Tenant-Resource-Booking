import request from 'supertest';
import app from '../../src/app';

describe('Health Check & App Boot', () => {
  it('should return 200 OK on /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      message: 'Yahoo! Server is running'
    });
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route-that-does-not-exist');
    expect(res.status).toBe(404);
  });
});
