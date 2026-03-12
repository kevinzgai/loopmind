import express from 'express';
import workspaceService from '../services/workspace/workspaceService.js';
import { authenticateToken as authMiddleware } from '../middleware/auth.middleware.js';
import { success, error } from '../utils/response.js';

const router = express.Router();
router.use(authMiddleware);

// 创建工作空间
router.post('/', async (req, res) => {
  try {
    const workspace = await workspaceService.createWorkspace(req.user.id, req.body);
    return success(res, workspace, '工作空间创建成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

// 获取用户的工作空间列表
router.get('/', async (req, res) => {
  try {
    const workspaces = await workspaceService.getUserWorkspaces(req.user.id);
    return success(res, workspaces, '获取工作空间列表成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

// 获取单个工作空间
router.get('/:workspaceId', async (req, res) => {
  try {
    const workspace = await workspaceService.getWorkspace(req.params.workspaceId);
    return success(res, workspace, '获取工作空间成功');
  } catch (err) {
    return error(res, err.message, -1, 404);
  }
});

// 更新工作空间
router.put('/:workspaceId', async (req, res) => {
  try {
    const workspace = await workspaceService.updateWorkspace(req.params.workspaceId, req.body);
    return success(res, workspace, '工作空间更新成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

// 删除工作空间
router.delete('/:workspaceId', async (req, res) => {
  try {
    await workspaceService.deleteWorkspace(req.params.workspaceId);
    return success(res, null, '工作空间删除成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

// 邀请成员
router.post('/:workspaceId/members', async (req, res) => {
  try {
    const { userId, role } = req.body;
    const workspace = await workspaceService.inviteMember(
      req.params.workspaceId,
      req.user.id,
      userId,
      role
    );
    return success(res, workspace, '成员邀请成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

// 移除成员
router.delete('/:workspaceId/members/:userId', async (req, res) => {
  try {
    const workspace = await workspaceService.removeMember(
      req.params.workspaceId,
      req.params.userId
    );
    return success(res, workspace, '成员移除成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

// 更新成员角色
router.put('/:workspaceId/members/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    const workspace = await workspaceService.updateMemberRole(
      req.params.workspaceId,
      req.params.userId,
      role
    );
    return success(res, workspace, '成员角色更新成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

// 生成邀请码
router.post('/:workspaceId/invite-code', async (req, res) => {
  try {
    const { expiryHours = 24 } = req.body;
    const result = await workspaceService.generateInviteCode(
      req.params.workspaceId,
      expiryHours
    );
    return success(res, result, '邀请码生成成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

// 通过邀请码加入
router.post('/join', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return error(res, '邀请码不能为空', -1, 400);
    const workspace = await workspaceService.joinByInviteCode(req.user.id, code);
    return success(res, workspace, '加入工作空间成功');
  } catch (err) {
    return error(res, err.message, -1, 500);
  }
});

export default router;
