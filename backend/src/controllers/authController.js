import {
  register,
  login,
  logout,
  refreshToken,
  changePassword,
  getUserInfo,
  updateUserProfile
} from '../services/auth/authServiceDB.js';
import { getUserPermissions } from '../services/auth/permissionService.js';
import { success, error } from '../utils/response.js';

/**
 * 认证控制器
 * 处理用户注册、登录、登出等请求
 */

/**
 * 用户注册
 * POST /api/auth/register
 */
export async function handleRegister(req, res, next) {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // 验证输入
    if (!username || !email || !password) {
      return error(res, '用户名、邮箱和密码不能为空', 1001, 400);
    }

    // 验证密码一致性
    if (password !== confirmPassword) {
      return error(res, '两次输入的密码不一致', 1002, 400);
    }

    // 注册用户
    const user = await register(username, email, password);

    return success(res, { user }, '注册成功', 201);
  } catch (error) {
    console.error('❌ 注册失败:', error.message);
    next(error);
  }
}

/**
 * 用户登录
 * POST /api/auth/login
 */
export async function handleLogin(req, res, next) {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return error(res, '用户名和密码不能为空', 1001, 400);
    }

    // 登录用户
    const result = await login(username, password);

    // 添加超级管理员标识
    const userWithFlag = {
      ...result.user,
      isSuperAdmin: result.user.role === 'super_admin' || result.user.role === 'admin'
    };

    return success(res, {
      user: userWithFlag,
      token: result.token,
      expiryTime: result.expiryTime
    }, '登录成功');
  } catch (err) {
    console.error('❌ 登录失败:', err.message);

    // 用户不存在或密码错误
    if (err.message === '用户不存在' || err.message === '密码错误') {
      return error(res, '用户名或密码错误', 1003, 401);
    }

    next(err);
  }
}

/**
 * 用户登出
 * POST /api/auth/logout
 */
export async function handleLogout(req, res, next) {
  try {
    const userId = req.user.userId;
    const token = req.token;

    // 登出用户
    await logout(userId, token);

    return success(res, null, '登出成功');
  } catch (err) {
    console.error('❌ 登出失败:', err.message);
    next(err);
  }
}

/**
 * 刷新 Token
 * POST /api/auth/refresh
 */
export async function handleRefreshToken(req, res, next) {
  try {
    const token = req.token;

    // 刷新 Token
    const result = await refreshToken(token);

    return success(res, {
      token: result.token,
      expiryTime: result.expiryTime
    }, 'Token 刷新成功');
  } catch (err) {
    console.error('❌ Token 刷新失败:', err.message);
    next(err);
  }
}

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
export async function handleGetCurrentUser(req, res, next) {
  try {
    const userId = req.user.userId;

    // 获取用户信息
    const user = await getUserInfo(userId);

    // 添加超级管理员标识
    const userWithFlag = {
      ...user,
      isSuperAdmin: user.role === 'super_admin' || user.role === 'admin'
    };

    return success(res, { user: userWithFlag }, '获取用户信息成功');
  } catch (err) {
    console.error('❌ 获取用户信息失败:', err.message);
    next(err);
  }
}

/**
 * 修改密码
 * POST /api/auth/change-password
 */
export async function handleChangePassword(req, res, next) {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // 验证输入
    if (!oldPassword || !newPassword) {
      return error(res, '旧密码和新密码不能为空', 1001, 400);
    }

    // 验证新密码一致性
    if (newPassword !== confirmPassword) {
      return error(res, '两次输入的新密码不一致', 1002, 400);
    }

    // 修改密码
    await changePassword(userId, oldPassword, newPassword);

    return success(res, null, '密码修改成功');
  } catch (err) {
    console.error('❌ 修改密码失败:', err.message);

    if (err.message === '旧密码错误') {
      return error(res, '旧密码错误', 1003, 401);
    }

    next(err);
  }
}

/**
 * 更新用户个人资料
 * PUT /api/auth/profile
 */
export async function handleUpdateProfile(req, res, next) {
  try {
    const userId = req.user.userId;
    const { bio, avatar } = req.body;

    // 更新用户资料
    const user = await updateUserProfile(userId, { bio, avatar });

    return success(res, { user }, '个人资料更新成功');
  } catch (err) {
    console.error('❌ 更新个人资料失败:', err.message);
    next(err);
  }
}

/**
 * 获取用户权限
 * GET /api/auth/permissions
 */
export async function handleGetPermissions(req, res, next) {
  try {
    const userId = req.user.userId;
    
    // 获取用户信息
    const user = await getUserInfo(userId);
    
    // 获取用户权限
    const permissions = await getUserPermissions(userId);
    
    return success(res, {
      permissions,
      isSuperAdmin: user.role === 'super_admin' || user.role === 'admin'
    }, '获取权限成功');
  } catch (err) {
    console.error('❌ 获取用户权限失败:', err.message);
    next(err);
  }
}

export default {
  handleRegister,
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleGetCurrentUser,
  handleChangePassword,
  handleUpdateProfile,
  handleGetPermissions
};
