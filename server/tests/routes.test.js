import request from 'supertest';
import app, { server } from '../index.js';
import db from '../database.js';

describe('CivicCompanion API Routes', () => {
  afterAll(async () => {
    // Shutdown server and databases cleanly
    await new Promise((resolve) => server.close(resolve));
  });

  test('GET /health returns 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('healthy');
  });

  test('GET /api/schemes returns list of seeded schemes', async () => {
    const res = await request(app).get('/api/schemes');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
  });

  test('POST /api/schemes/recommend returns appropriate match state', async () => {
    const context = {
      age: 25,
      income: 40000,
      ownsHome: false,
      residency: true
    };
    const res = await request(app)
      .post('/api/schemes/recommend')
      .send(context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('recommendations');
    expect(res.body.inputContext.age).toEqual(25);
  });

  test('GET /api/complaints retrieves public issues', async () => {
    const res = await request(app).get('/api/complaints');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/complaints validates wrong schema fields', async () => {
    const badTicket = {
      title: 'Hi',
      category: 'Utilities',
      description: 'Too short'
    };
    const res = await request(app)
      .post('/api/complaints')
      .send(badTicket);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });
});
