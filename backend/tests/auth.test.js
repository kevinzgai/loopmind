import request from 'supertest';
import app from '../src/app.js';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should return 400 if fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' });
      
      expect(response.statusCode).toBe(400);
      expect(response.body.error.code).toBe('MISSING_FIELDS');
    });

    it('should return 400 if passwords mismatch', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password456'
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body.error.code).toBe('PASSWORD_MISMATCH');
    });
  });
});
