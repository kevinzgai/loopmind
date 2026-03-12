import express from 'express';
import agentVersionService from '../services/agentVersionService.js';
import { authenticateToken as authMiddleware } from '../../../middleware/auth.middleware.js';
import { success, error } from '../../../utils/response.js';

const router = express.Router({ mergeParams: true });
router.use(authMiddleware);

// 创建版本快照
router.post('/', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { changelog } = req.body;
    const snapshot = await agentVersionService.createSnapshot(agentId, req.user.id, changelog);
    return success(res, snapshot, '版本快照创建成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

// 获取版本历史
router.get('/', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const result = await agentVersionService.getVersionHistory(
      agentId, parseInt(page), parseInt(limit)
    );
    return success(res, result, '获取版本历史成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

// 对比两个版本
router.get('/compare', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { versionA, versionB } = req.query;
    if (!versionA || !versionB) return error(res, '请提供两个版本号', -1, 400);
    const diff = await agentVersionService.compareVersions(
      agentId, parseInt(versionA), parseInt(versionB)
    );
    return success(res, diff, '版本对比成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

// 获取特定版本
router.get('/:versionNumber', async (req, res) => {
  try {
    const { agentId, versionNumber } = req.params;
    const version = await agentVersionService.getVersion(agentId, parseInt(versionNumber));
    return success(res, version, '获取版本成功');
  } catch (err) {
    return error(res, err.message, -1, 404);
  }
});

// 回滚到指定版本
router.post('/:versionNumber/rollback', async (req, res) => {
  try {
    const { agentId, versionNumber } = req.params;
    const result = await agentVersionService.rollback(
      agentId, parseInt(versionNumber), req.user.id
    );
    return success(res, result, '版本回滚成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

// 删除版本
router.delete('/:versionNumber', async (req, res) => {
  try {
    const { agentId, versionNumber } = req.params;
    const result = await agentVersionService.deleteVersion(agentId, parseInt(versionNumber));
    return success(res, result, '版本删除成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

export default router;
