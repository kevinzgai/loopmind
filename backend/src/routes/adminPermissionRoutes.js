import express from 'express';
import { authenticateToken, authorizeAdmin, checkPermission } from '../middleware/auth.middleware.js';
import {
  getAllRoles,
  getRoleByCode,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  getPermissionsByCategory,
  createPermission,
  assignRoleToUser,
  revokeRoleFromUser,
  addPermissionToUser,
  removePermissionFromUser,
  getUserPermissions,
  getUsersByRole
} from '../services/auth/permissionService.js';

const router = express.Router();

/**
 * @api {get} /admin/permissions 获取所有权限
 * @apiName GetAllPermissions
 * @apiGroup Permissions
 * @apiDescription 获取所有权限列表（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiSuccess {Array} permissions 权限列表
 */
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const permissions = await getAllPermissions();
    res.json({ permissions });
  } catch (error) {
    console.error('❌ 获取权限列表失败:', error.message);
    res.status(500).json({ error: { message: error.message || '服务器错误' } });
  }
});

/**
 * @api {get} /admin/permissions/category/:category 获取分类权限
 * @apiName GetPermissionsByCategory
 * @apiGroup Permissions
 * @apiDescription 获取指定分类的权限列表（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} category 分类名称
 *
 * @apiSuccess {Array} permissions 权限列表
 */
router.get('/category/:category', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const permissions = await getPermissionsByCategory(req.params.category);
    res.json({ permissions });
  } catch (error) {
    console.error('❌ 获取分类权限失败:', error.message);
    res.status(500).json({ error: { message: error.message || '服务器错误' } });
  }
});

/**
 * @api {post} /admin/permissions 创建权限
 * @apiName CreatePermission
 * @apiGroup Permissions
 * @apiDescription 创建新权限（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiBody {String} code 权限代码
 * @apiBody {String} name 权限名称
 * @apiBody {String} category 权限分类
 * @apiBody {String} description 权限描述
 * @apiBody {String} resource 资源类型
 * @apiBody {String} action 操作类型
 *
 * @apiSuccess {Object} permission 创建的权限对象
 */
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const permission = await createPermission(req.body);
    res.status(201).json({
      message: '权限创建成功',
      permission
    });
  } catch (error) {
    console.error('❌ 创建权限失败:', error.message);
    res.status(400).json({ error: { message: error.message || '创建失败' } });
  }
});

/**
 * @api {get} /admin/permissions/roles 获取所有角色
 * @apiName GetAllRoles
 * @apiGroup Permissions
 * @apiDescription 获取所有角色列表（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiSuccess {Array} roles 角色列表
 */
router.get('/roles', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const roles = await getAllRoles();
    res.json({ roles });
  } catch (error) {
    console.error('❌ 获取角色列表失败:', error.message);
    res.status(500).json({ error: { message: error.message || '服务器错误' } });
  }
});

/**
 * @api {get} /admin/permissions/roles/:roleCode 获取角色详情
 * @apiName GetRoleByCode
 * @apiGroup Permissions
 * @apiDescription 获取指定角色的详细信息（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} roleCode 角色代码
 *
 * @apiSuccess {Object} role 角色对象
 */
router.get('/roles/:roleCode', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const role = await getRoleByCode(req.params.roleCode);
    res.json({ role });
  } catch (error) {
    console.error('❌ 获取角色详情失败:', error.message);
    res.status(404).json({ error: { message: error.message || '角色不存在' } });
  }
});

/**
 * @api {post} /admin/permissions/roles 创建角色
 * @apiName CreateRole
 * @apiGroup Permissions
 * @apiDescription 创建新角色（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiBody {String} code 角色代码
 * @apiBody {String} name 角色名称
 * @apiBody {String} description 角色描述
 * @apiBody {Array} permissions 权限列表
 *
 * @apiSuccess {Object} role 创建的角色对象
 */
router.post('/roles', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const role = await createRole(req.body);
    res.status(201).json({
      message: '角色创建成功',
      role
    });
  } catch (error) {
    console.error('❌ 创建角色失败:', error.message);
    res.status(400).json({ error: { message: error.message || '创建失败' } });
  }
});

/**
 * @api {put} /admin/permissions/roles/:roleCode 更新角色
 * @apiName UpdateRole
 * @apiGroup Permissions
 * @apiDescription 更新角色信息（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} roleCode 角色代码
 * @apiBody {String} [name] 角色名称
 * @apiBody {String} [description] 角色描述
 * @apiBody {Array} [permissions] 权限列表
 *
 * @apiSuccess {Object} role 更新后的角色对象
 */
router.put('/roles/:roleCode', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const role = await updateRole(req.params.roleCode, req.body);
    res.json({
      message: '角色更新成功',
      role
    });
  } catch (error) {
    console.error('❌ 更新角色失败:', error.message);
    res.status(400).json({ error: { message: error.message || '更新失败' } });
  }
});

/**
 * @api {delete} /admin/permissions/roles/:roleCode 删除角色
 * @apiName DeleteRole
 * @apiGroup Permissions
 * @apiDescription 删除角色（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} roleCode 角色代码
 *
 * @apiSuccess {String} message 成功消息
 */
router.delete('/roles/:roleCode', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await deleteRole(req.params.roleCode);
    res.json(result);
  } catch (error) {
    console.error('❌ 删除角色失败:', error.message);
    res.status(400).json({ error: { message: error.message || '删除失败' } });
  }
});

/**
 * @api {get} /admin/permissions/roles/:roleCode/users 获取角色用户
 * @apiName GetUsersByRole
 * @apiGroup Permissions
 * @apiDescription 获取指定角色的所有用户（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} roleCode 角色代码
 *
 * @apiSuccess {Array} users 用户列表
 */
router.get('/roles/:roleCode/users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const users = await getUsersByRole(req.params.roleCode);
    res.json({ users });
  } catch (error) {
    console.error('❌ 获取角色用户失败:', error.message);
    res.status(500).json({ error: { message: error.message || '服务器错误' } });
  }
});

/**
 * @api {post} /admin/permissions/users/:userId/roles 分配角色给用户
 * @apiName AssignRoleToUser
 * @apiGroup Permissions
 * @apiDescription 为用户分配角色（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} userId 用户ID
 * @apiBody {String} roleCode 角色代码
 *
 * @apiSuccess {Object} user 更新后的用户对象
 */
router.post('/users/:userId/roles', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { roleCode } = req.body;
    if (!roleCode) {
      return res.status(400).json({ error: { message: '请提供角色代码' } });
    }

    const user = await assignRoleToUser(req.params.userId, roleCode);
    res.json({
      message: '角色分配成功',
      user
    });
  } catch (error) {
    console.error('❌ 分配角色失败:', error.message);
    res.status(400).json({ error: { message: error.message || '分配失败' } });
  }
});

/**
 * @api {delete} /admin/permissions/users/:userId/roles/:roleCode 撤销用户角色
 * @apiName RevokeRoleFromUser
 * @apiGroup Permissions
 * @apiDescription 撤销用户的角色（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} userId 用户ID
 * @apiParam {String} roleCode 角色代码
 *
 * @apiSuccess {Object} user 更新后的用户对象
 */
router.delete('/users/:userId/roles/:roleCode', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const user = await revokeRoleFromUser(req.params.userId, req.params.roleCode);
    res.json({
      message: '角色撤销成功',
      user
    });
  } catch (error) {
    console.error('❌ 撤销角色失败:', error.message);
    res.status(400).json({ error: { message: error.message || '撤销失败' } });
  }
});

/**
 * @api {get} /admin/permissions/users/:userId 获取用户权限
 * @apiName GetUserPermissions
 * @apiGroup Permissions
 * @apiDescription 获取用户的所有权限（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} userId 用户ID
 *
 * @apiSuccess {Array} permissions 权限列表
 */
router.get('/users/:userId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const permissions = await getUserPermissions(req.params.userId);
    res.json({ permissions });
  } catch (error) {
    console.error('❌ 获取用户权限失败:', error.message);
    res.status(500).json({ error: { message: error.message || '服务器错误' } });
  }
});

/**
 * @api {post} /admin/permissions/users/:userId/permissions 添加用户权限
 * @apiName AddPermissionToUser
 * @apiGroup Permissions
 * @apiDescription 为用户添加额外权限（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} userId 用户ID
 * @apiBody {String} permissionCode 权限代码
 *
 * @apiSuccess {Object} user 更新后的用户对象
 */
router.post('/users/:userId/permissions', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { permissionCode } = req.body;
    if (!permissionCode) {
      return res.status(400).json({ error: { message: '请提供权限代码' } });
    }

    const user = await addPermissionToUser(req.params.userId, permissionCode);
    res.json({
      message: '权限添加成功',
      user
    });
  } catch (error) {
    console.error('❌ 添加权限失败:', error.message);
    res.status(400).json({ error: { message: error.message || '添加失败' } });
  }
});

/**
 * @api {delete} /admin/permissions/users/:userId/permissions/:permissionCode 移除用户权限
 * @apiName RemovePermissionFromUser
 * @apiGroup Permissions
 * @apiDescription 移除用户的额外权限（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} userId 用户ID
 * @apiParam {String} permissionCode 权限代码
 *
 * @apiSuccess {Object} user 更新后的用户对象
 */
router.delete('/users/:userId/permissions/:permissionCode', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const user = await removePermissionFromUser(req.params.userId, req.params.permissionCode);
    res.json({
      message: '权限移除成功',
      user
    });
  } catch (error) {
    console.error('❌ 移除权限失败:', error.message);
    res.status(400).json({ error: { message: error.message || '移除失败' } });
  }
});

export default router;
