import request from 'supertest';
import app from '../src/app.js';

/**
 * 权限系统测试
 * 覆盖：GET /api/auth/permissions、管理员权限路由保护
 */

describe('Permissions API', () => {

  // ─── GET /api/auth/permissions（未登录）───────────────────────────
  describe('GET /api/auth/permissions (unauthenticated)', () => {
    it('should return 200 with empty permissions array when not logged in', async () => {
      const res = await request(app).get('/api/auth/permissions');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('permissions');
      expect(Array.isArray(res.body.permissions)).toBe(true);
      expect(res.body.permissions).toHaveLength(0);
    });
  });

  // ─── GET /api/auth/permissions（携带无效 token）──────────────────
  describe('GET /api/auth/permissions (invalid token)', () => {
    it('should return 200 with empty permissions when token is invalid', async () => {
      const res = await request(app)
        .get('/api/auth/permissions')
        .set('Authorization', 'Bearer invalid_token_xyz');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.permissions)).toBe(true);
    }, 15000);
  });

  // ─── 管理员路由保护（无 token）────────────────────────────────────
  describe('Admin permission routes - authentication guard', () => {
    it('GET /api/admin/permissions should return 401 without token', async () => {
      const res = await request(app).get('/api/admin/permissions');
      expect(res.statusCode).toBe(401);
    });

    it('GET /api/admin/permissions/roles should return 401 without token', async () => {
      const res = await request(app).get('/api/admin/permissions/roles');
      expect(res.statusCode).toBe(401);
    });

    it('POST /api/admin/permissions should return 401 without token', async () => {
      const res = await request(app)
        .post('/api/admin/permissions')
        .send({ code: 'test', name: 'Test', category: 'other', resource: 'test', action: 'view' });
      expect(res.statusCode).toBe(401);
    });

    it('POST /api/admin/permissions/roles should return 401 without token', async () => {
      const res = await request(app)
        .post('/api/admin/permissions/roles')
        .send({ code: 'testrole', name: 'Test Role' });
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── 管理员路由保护（携带无效 token）────────────────────────────
  describe('Admin permission routes - invalid token guard', () => {
    const invalidAuthHeader = { Authorization: 'Bearer totally_fake_token' };

    it('GET /api/admin/permissions should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/admin/permissions')
        .set(invalidAuthHeader);
      expect(res.statusCode).toBe(401);
    }, 15000);

    it('GET /api/admin/permissions/roles should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/admin/permissions/roles')
        .set(invalidAuthHeader);
      expect(res.statusCode).toBe(401);
    }, 15000);

    it('GET /api/admin/users should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set(invalidAuthHeader);
      expect(res.statusCode).toBe(401);
    }, 15000);

    it('GET /api/admin/users/stats should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/admin/users/stats')
        .set(invalidAuthHeader);
      expect(res.statusCode).toBe(401);
    }, 15000);
  });

  // ─── 路由结构验证 ────────────────────────────────────────────────
  describe('Route structure validation', () => {
    it('GET /api/admin/permissions/category/:category should return 401 without token', async () => {
      const res = await request(app).get('/api/admin/permissions/category/system');
      expect(res.statusCode).toBe(401);
    });

    it('GET /api/admin/permissions/roles/:roleCode should return 401 without token', async () => {
      const res = await request(app).get('/api/admin/permissions/roles/admin');
      expect(res.statusCode).toBe(401);
    });

    it('DELETE /api/admin/permissions/roles/:roleCode should return 401 without token', async () => {
      const res = await request(app).delete('/api/admin/permissions/roles/some-role');
      expect(res.statusCode).toBe(401);
    });

    it('POST /api/admin/permissions/users/:userId/roles should return 401 without token', async () => {
      const res = await request(app)
        .post('/api/admin/permissions/users/123/roles')
        .send({ roleCode: 'admin' });
      expect(res.statusCode).toBe(401);
    });

    it('GET /api/admin/permissions/users/:userId should return 401 without token', async () => {
      const res = await request(app).get('/api/admin/permissions/users/123');
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── Auth 路由结构验证 ────────────────────────────────────────────
  describe('Auth routes structure', () => {
    it('GET /api/auth/me should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('POST /api/auth/logout should return 401 without token', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.statusCode).toBe(401);
    });

    it('POST /api/auth/change-password should return 401 without token', async () => {
      const res = await request(app).post('/api/auth/change-password');
      expect(res.statusCode).toBe(401);
    });
  });
});
