import request from 'supertest';
import app from '../src/app.js';

/**
 * 智能体分类管理 API 测试
 * 覆盖：GET/POST/PUT/DELETE /api/admin/config/agent-categories
 */

describe('Agent Categories API', () => {

  const invalidAuth = { Authorization: 'Bearer totally_fake_token_abc123' };

  // ─── 未认证保护 ───────────────────────────────────────────────────
  describe('Authentication guard', () => {
    it('GET /api/admin/config/agent-categories should return 401 without token', async () => {
      const res = await request(app).get('/api/admin/config/agent-categories');
      expect(res.statusCode).toBe(401);
    });

    it('POST /api/admin/config/agent-categories should return 401 without token', async () => {
      const res = await request(app)
        .post('/api/admin/config/agent-categories')
        .send({ value: 'test', label: '测试' });
      expect(res.statusCode).toBe(401);
    });

    it('PUT /api/admin/config/agent-categories/:value should return 401 without token', async () => {
      const res = await request(app)
        .put('/api/admin/config/agent-categories/%E7%BC%96%E7%A8%8B')
        .send({ label: '新名称' });
      expect(res.statusCode).toBe(401);
    });

    it('DELETE /api/admin/config/agent-categories/:value should return 401 without token', async () => {
      const res = await request(app)
        .delete('/api/admin/config/agent-categories/%E7%BC%96%E7%A8%8B');
      expect(res.statusCode).toBe(401);
    });

    it('PUT /api/admin/config/agent-categories (bulk) should return 401 without token', async () => {
      const res = await request(app)
        .put('/api/admin/config/agent-categories')
        .send({ categories: [] });
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── 无效 Token 保护 ──────────────────────────────────────────────
  describe('Invalid token guard', () => {
    it('GET should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/admin/config/agent-categories')
        .set(invalidAuth);
      expect(res.statusCode).toBe(401);
    });

    it('POST should return 401 with invalid token', async () => {
      const res = await request(app)
        .post('/api/admin/config/agent-categories')
        .set(invalidAuth)
        .send({ value: 'test', label: '测试' });
      expect(res.statusCode).toBe(401);
    });

    it('PUT /:value should return 401 with invalid token', async () => {
      const res = await request(app)
        .put('/api/admin/config/agent-categories/test')
        .set(invalidAuth)
        .send({ label: 'New' });
      expect(res.statusCode).toBe(401);
    });

    it('DELETE /:value should return 401 with invalid token', async () => {
      const res = await request(app)
        .delete('/api/admin/config/agent-categories/test')
        .set(invalidAuth);
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── 路由结构验证 ────────────────────────────────────────────────
  describe('Route structure', () => {
    it('GET /api/admin/config/agent-categories route is registered (not 404)', async () => {
      // 无 token 应该得到 401，而不是 404（证明路由已注册）
      const res = await request(app).get('/api/admin/config/agent-categories');
      expect(res.statusCode).not.toBe(404);
    });

    it('POST /api/admin/config/agent-categories route is registered', async () => {
      const res = await request(app)
        .post('/api/admin/config/agent-categories')
        .send({});
      expect(res.statusCode).not.toBe(404);
    });

    it('PUT /api/admin/config/agent-categories route is registered', async () => {
      const res = await request(app)
        .put('/api/admin/config/agent-categories')
        .send({});
      expect(res.statusCode).not.toBe(404);
    });

    it('PUT /api/admin/config/agent-categories/:value route is registered', async () => {
      const res = await request(app)
        .put('/api/admin/config/agent-categories/test')
        .send({});
      expect(res.statusCode).not.toBe(404);
    });

    it('DELETE /api/admin/config/agent-categories/:value route is registered', async () => {
      const res = await request(app)
        .delete('/api/admin/config/agent-categories/test');
      expect(res.statusCode).not.toBe(404);
    });
  });
});
