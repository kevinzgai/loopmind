import express from 'express';
import auditService from '../services/audit/auditService.js';
import { authenticateToken as authMiddleware } from '../middleware/auth.middleware.js';
import { success, error } from '../utils/response.js';

const router = express.Router();
router.use(authMiddleware);

// 查询审计日志
router.get('/', async (req, res) => {
  try {
    const result = await auditService.getLogs({
      userId: req.query.userId,
      workspaceId: req.query.workspaceId,
      action: req.query.action,
      resource: req.query.resource,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
    });
    return success(res, result, '获取审计日志成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

// 获取统计数据
router.get('/stats', async (req, res) => {
  try {
    const stats = await auditService.getStats(parseInt(req.query.days) || 7);
    return success(res, stats, '获取审计统计成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

// 清理旧日志（仅管理员）
router.delete('/clean', async (req, res) => {
  try {
    const count = await auditService.cleanOldLogs(parseInt(req.query.days) || 90);
    return success(res, { deletedCount: count }, `已清理 ${count} 条旧日志`);
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

export default router;
