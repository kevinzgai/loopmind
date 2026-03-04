import express from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getUserStats
} from '../services/auth/authServiceDB.js';
import { authenticateToken, authorizeAdmin, checkPermission } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @api {get} /admin/users 获取用户列表
 * @apiName GetUsers
 * @apiGroup AdminUsers
 * @apiDescription 获取所有用户列表（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 * 
 * @apiQuery {Number} [page=1] 页码
 * @apiQuery {Number} [limit=20] 每页数量
 * @apiQuery {String} [search] 搜索关键词
 * 
 * @apiSuccess {Array} users 用户列表
 * @apiSuccess {Number} total 总数
 * @apiSuccess {Number} page 当前页
 * @apiSuccess {Number} limit 每页数量
 * @apiSuccess {Number} totalPages 总页数
 */
router.get('/', authenticateToken, checkPermission('system:user:view'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await getAllUsers({ 
      page: parseInt(page), 
      limit: parseInt(limit), 
      search 
    });
    res.json(result);
  } catch (error) {
    console.error('❌ 获取用户列表失败:', error.message);
    res.status(500).json({ error: { message: error.message || '服务器错误' } });
  }
});

/**
 * @api {get} /admin/users/stats 获取用户统计
 * @apiName GetUserStats
 * @apiGroup AdminUsers
 * @apiDescription 获取用户统计信息（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 */
router.get('/stats', authenticateToken, checkPermission('system:user:view'), async (req, res) => {
  try {
    const stats = await getUserStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ 获取用户统计失败:', error.message);
    res.status(500).json({ error: { message: error.message || '服务器错误' } });
  }
});

/**
 * @api {post} /admin/users 创建用户
 * @apiName CreateUser
 * @apiGroup AdminUsers
 * @apiDescription 创建新用户（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 * 
 * @apiBody {String} username 用户名
 * @apiBody {String} email 邮箱
 * @apiBody {String} password 密码
 * @apiBody {String} [role=user] 角色 (user/admin)
 */
router.post('/', authenticateToken, checkPermission('system:user:create'), async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ 
      message: '用户创建成功', 
      user 
    });
  } catch (error) {
    console.error('❌ 创建用户失败:', error.message);
    res.status(400).json({ error: { message: error.message || '创建失败' } });
  }
});

/**
 * @api {put} /admin/users/:userId 更新用户
 * @apiName UpdateUser
 * @apiGroup AdminUsers
 * @apiDescription 更新用户信息（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 * 
 * @apiParam {String} userId 用户ID
 * @apiBody {String} [username] 用户名
 * @apiBody {String} [email] 邮箱
 * @apiBody {String} [role] 角色
 * @apiBody {Boolean} [isActive] 是否激活
 */
router.put('/:userId', authenticateToken, checkPermission('system:user:edit'), async (req, res) => {
  try {
    const user = await updateUser(req.params.userId, req.body);
    res.json({ 
      message: '用户更新成功', 
      user 
    });
  } catch (error) {
    console.error('❌ 更新用户失败:', error.message);
    res.status(400).json({ error: { message: error.message || '更新失败' } });
  }
});

/**
 * @api {delete} /admin/users/:userId 删除用户
 * @apiName DeleteUser
 * @apiGroup AdminUsers
 * @apiDescription 删除用户（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 * 
 * @apiParam {String} userId 用户ID
 */
router.delete('/:userId', authenticateToken, checkPermission('system:user:delete'), async (req, res) => {
  try {
    const result = await deleteUser(req.params.userId);
    res.json(result);
  } catch (error) {
    console.error('❌ 删除用户失败:', error.message);
    res.status(400).json({ error: { message: error.message || '删除失败' } });
  }
});

/**
 * @api {post} /admin/users/:userId/reset-password 重置用户密码
 * @apiName ResetUserPassword
 * @apiGroup AdminUsers
 * @apiDescription 重置用户密码（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 * 
 * @apiParam {String} userId 用户ID
 * @apiBody {String} password 新密码
 */
router.post('/:userId/reset-password', authenticateToken, checkPermission('system:user:reset-password'), async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: { message: '请提供新密码' } });
    }
    const result = await resetUserPassword(req.params.userId, password);
    res.json(result);
  } catch (error) {
    console.error('❌ 重置密码失败:', error.message);
    res.status(400).json({ error: { message: error.message || '重置失败' } });
  }
});

export default router;
