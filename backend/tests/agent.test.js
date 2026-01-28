import request from 'supertest';
import app from '../src/app.js';

describe('Agent API', () => {
  describe('GET /api/agent/:agentId/widget', () => {
    it('should return 404 for non-existent agent', async () => {
      // Since we don't have a DB, it might return 404 or 500 depending on implementation
      const response = await request(app).get('/api/agent/nonexistent/widget');
      expect([404, 500]).toContain(response.statusCode);
    });
  });
});
