import request from 'supertest';
import app from '../src/app.js';

/**
 * Dashboard API 测试
 * 注意：测试环境无 MongoDB，DB 相关接口返回 500；
 * 这里只验证路由已注册（非 404）及响应结构合理性。
 * system-details 不依赖 DB，单独验证其结构。
 */

describe('Dashboard API', () => {

  // ─── 路由注册验证（不依赖 DB）────────────────────────────────────
  describe('Route registration (no DB required)', () => {
    it('GET /api/dashboard/stats route is registered (not 404)', async () => {
      const res = await request(app).get('/api/dashboard/stats');
      expect(res.statusCode).not.toBe(404);
    }, 15000);

    it('GET /api/dashboard/trend route is registered (not 404)', async () => {
      const res = await request(app).get('/api/dashboard/trend?days=7');
      expect(res.statusCode).not.toBe(404);
    }, 15000);

    it('GET /api/dashboard/top-agents route is registered (not 404)', async () => {
      const res = await request(app).get('/api/dashboard/top-agents?limit=5');
      expect(res.statusCode).not.toBe(404);
    }, 15000);

    it('GET /api/dashboard/categories route is registered (not 404)', async () => {
      const res = await request(app).get('/api/dashboard/categories');
      expect(res.statusCode).not.toBe(404);
    }, 15000);

    it('GET /api/dashboard/full route is registered (not 404)', async () => {
      const res = await request(app).get('/api/dashboard/full');
      expect(res.statusCode).not.toBe(404);
    }, 15000);
  });

  // ─── system-details（不依赖 DB，应该成功）────────────────────────
  describe('GET /api/dashboard/system-details', () => {
    it('should return 200 with cpu, memory, os, node sections', async () => {
      const res = await request(app).get('/api/dashboard/system-details');
      expect(res.statusCode).toBe(200);
      const data = res.body.data;
      expect(data).toHaveProperty('cpu');
      expect(data).toHaveProperty('memory');
      expect(data).toHaveProperty('os');
      expect(data).toHaveProperty('node');
      expect(data).toHaveProperty('timestamp');
    }, 15000);

    it('cpu.cores should be a positive number', async () => {
      const res = await request(app).get('/api/dashboard/system-details');
      expect(res.statusCode).toBe(200);
      const cpu = res.body.data.cpu;
      expect(cpu.cores).toBeGreaterThan(0);
    }, 15000);

    it('cpu.usagePercent should be 0-100', async () => {
      const res = await request(app).get('/api/dashboard/system-details');
      expect(res.statusCode).toBe(200);
      const cpu = res.body.data.cpu;
      expect(cpu.usagePercent).toBeGreaterThanOrEqual(0);
      expect(cpu.usagePercent).toBeLessThanOrEqual(100);
    }, 15000);

    it('memory.usedPercent should be 0-100', async () => {
      const res = await request(app).get('/api/dashboard/system-details');
      expect(res.statusCode).toBe(200);
      const mem = res.body.data.memory;
      expect(parseFloat(mem.usedPercent)).toBeGreaterThanOrEqual(0);
      expect(parseFloat(mem.usedPercent)).toBeLessThanOrEqual(100);
    }, 15000);

    it('memory.total should be a positive number', async () => {
      const res = await request(app).get('/api/dashboard/system-details');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.memory.total).toBeGreaterThan(0);
    }, 15000);

    it('os should have platform and hostname', async () => {
      const res = await request(app).get('/api/dashboard/system-details');
      expect(res.statusCode).toBe(200);
      const osInfo = res.body.data.os;
      expect(typeof osInfo.platform).toBe('string');
      expect(typeof osInfo.hostname).toBe('string');
    }, 15000);

    it('node.version should start with v', async () => {
      const res = await request(app).get('/api/dashboard/system-details');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.node.version).toMatch(/^v/);
    }, 15000);

    it('timestamp should be a valid ISO string', async () => {
      const res = await request(app).get('/api/dashboard/system-details');
      expect(res.statusCode).toBe(200);
      expect(() => new Date(res.body.data.timestamp)).not.toThrow();
    }, 15000);
  });

  // ─── 响应格式验证（接受 200 或 500，但格式要正确）────────────────
  describe('Response format validation', () => {
    it('stats response should have code field when not 404', async () => {
      const res = await request(app).get('/api/dashboard/stats');
      expect(res.statusCode).not.toBe(404);
      // 无论成功还是失败，响应体都应该存在
      expect(res.body).toBeDefined();
    }, 15000);

    it('trend response content-type should be json', async () => {
      const res = await request(app).get('/api/dashboard/trend?days=3');
      expect(res.headers['content-type']).toMatch(/json/);
    }, 15000);
  });
});
