import request from 'supertest';
import app from '../src/app.js';

describe('Health API Verification', () => {
  it('should return 200 OK and status ok for health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return 404 for an unknown API route', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toMatch(/Cannot find route/);
  });
});
