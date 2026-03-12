import { verifyToken } from '../services/auth/authServiceDB.js';
import { userHasPermission } from '../services/auth/permissionService.js';
import { error } from '../utils/response.js';

/**
 * 认证中间件
 * 验证请求中的 Token
 */

/**
 * 验证 Token 中间件
 * 从 Authorization header 或 query 参数中提取 Token
 */
export async function authenticateToken(req, res, next) {
  try {
    // 从 Authorization header 获取 Token
    // 格式: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 如果没有从 header 获取，尝试从 query 参数获取
    if (!token && req.query.token) {
      token = req.query.token;
    }

    // 如果没有 Token，返回 401
    if (!token) {
      return error(res, '未提供认证 Token', 1004, 401);
    }

    // 验证 Token
    const userInfo = await verifyToken(token);

    // 将用户信息附加到请求对象
    req.user = { ...userInfo, id: userInfo.userId };
    req.token = token;

    next();
  } catch (err) {
    console.error('❌ Token 验证失败:', err.message);

    // 根据错误类型返回不同的状态码
    if (err.message === 'Token 已过期') {
      return error(res, 'Token 已过期', 1004, 401);
    }

    return error(res, 'Token 无效', 1004, 401);
  }
}

/**
 * 可选认证中间件
 * 如果提供了 Token 则验证，否则继续
 */
export async function optionalAuthenticateToken(req, res, next) {
  try {
    // 从 Authorization header 获取 Token
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 如果没有从 header 获取，尝试从 query 参数获取
    if (!token && req.query.token) {
      token = req.query.token;
    }

    // 如果有 Token，验证它
    if (token) {
      const userInfo = await verifyToken(token);
      req.user = userInfo;
      req.token = token;
    }

    next();
  } catch (err) {
    // 即使验证失败也继续，但记录错误
    console.warn('⚠️ Token 验证失败（可选）:', err.message);
    next();
  }
}

/**
 * 错误处理中间件
 */
export function errorHandler(err, req, res, next) {
  console.error('❌ 错误:', err);

  // 认证错误
  if (err.message === 'Token 无效' || err.message === 'Token 已过期') {
    return error(res, err.message, 1004, 401);
  }

  // 验证错误
  if (err.message.includes('至少')) {
    return error(res, err.message, 1001, 400);
  }

  // 用户已存在错误
  if (err.message.includes('已存在') || err.message.includes('已被注册')) {
    return error(res, err.message, 1005, 409);
  }

  // 用户不存在错误
  if (err.message === '用户不存在') {
    return error(res, err.message, 1006, 404);
  }

  // 通用错误
  return error(res, '服务器错误', -1, 500);
}


/**
 * 管理员授权中间件
 * 检查用户是否为管理员
 */
export async function authorizeAdmin(req, res, next) {
  try {
    if (!req.user) {
      return error(res, '未授权访问', 1004, 401);
    }
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return error(res, '需要管理员权限', 1003, 403);
    }
    next();
  } catch (err) {
    console.error('authorizeAdmin 错误:', err);
    return error(res, '服务器错误', -1, 500);
  }
}

/**
 * 权限检查中间件
 * 检查用户是否具有指定权限
 * @param {String} permission - 权限代码
 */
export function checkPermission(permission) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return error(res, '未授权访问', 1004, 401);
      }

      const userId = req.user.userId || req.user.id;
      const hasPermission = await userHasPermission(userId, permission);
      
      if (!hasPermission) {
        return error(res, '权限不足', 1003, 403);
      }

      next();
    } catch (err) {
      console.error('权限检查失败:', err);
      return error(res, '服务器错误', -1, 500);
    }
  };
}

/**
 * 多权限检查中间件
 * 检查用户是否具有指定权限（支持且/或逻辑）
 * @param {Array<String>} permissions - 权限代码数组
 * @param {Boolean} requireAll - 是否需要全部权限（默认为 false，即满足其一即可）
 */
export function checkPermissions(permissions, requireAll = false) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return error(res, '未授权访问', 1004, 401);
      }

      if (!Array.isArray(permissions) || permissions.length === 0) {
        return error(res, '权限参数无效', 1001, 400);
      }

      const userId = req.user.userId || req.user.id;
      const results = await Promise.all(
        permissions.map(p => userHasPermission(userId, p))
      );

      const hasPermission = requireAll
        ? results.every(r => r === true)
        : results.some(r => r === true);

      if (!hasPermission) {
        return error(res, requireAll ? '缺少必要权限' : '权限不足', 1003, 403);
      }

      next();
    } catch (err) {
      console.error('权限检查失败:', err);
      return error(res, '服务器错误', -1, 500);
    }
  };
}

/**
 * 角色检查中间件
 * 检查用户是否具有指定角色
 * @param {String|Array<String>} roles - 角色代码或数组
 */
export function checkRole(roles) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return error(res, '未授权访问', 1004, 401);
      }

      const roleList = Array.isArray(roles) ? roles : [roles];
      
      if (!roleList.includes(req.user.role)) {
        return error(res, '角色权限不足', 1003, 403);
      }

      next();
    } catch (err) {
      console.error('角色检查失败:', err);
      return error(res, '服务器错误', -1, 500);
    }
  };
}

export default {
  authenticateToken,
  optionalAuthenticateToken,
  errorHandler,
  authorizeAdmin,
  checkPermission,
  checkPermissions,
  checkRole
};
