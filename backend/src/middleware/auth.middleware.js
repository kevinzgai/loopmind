import { verifyToken } from '../services/auth/authServiceDB.js';

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
      return res.status(401).json({
        error: {
          message: '未提供认证 Token',
          code: 'NO_TOKEN'
        }
      });
    }

    // 验证 Token
    const userInfo = await verifyToken(token);

    // 将用户信息附加到请求对象
    req.user = userInfo;
    req.token = token;

    next();
  } catch (error) {
    console.error('❌ Token 验证失败:', error.message);

    // 根据错误类型返回不同的状态码
    if (error.message === 'Token 已过期') {
      return res.status(401).json({
        error: {
          message: 'Token 已过期',
          code: 'TOKEN_EXPIRED'
        }
      });
    }

    return res.status(401).json({
      error: {
        message: 'Token 无效',
        code: 'INVALID_TOKEN'
      }
    });
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
  } catch (error) {
    // 即使验证失败也继续，但记录错误
    console.warn('⚠️ Token 验证失败（可选）:', error.message);
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
    return res.status(401).json({
      error: {
        message: err.message,
        code: 'AUTH_ERROR'
      }
    });
  }

  // 验证错误
  if (err.message.includes('至少')) {
    return res.status(400).json({
      error: {
        message: err.message,
        code: 'VALIDATION_ERROR'
      }
    });
  }

  // 用户已存在错误
  if (err.message.includes('已存在') || err.message.includes('已被注册')) {
    return res.status(409).json({
      error: {
        message: err.message,
        code: 'USER_EXISTS'
      }
    });
  }

  // 用户不存在错误
  if (err.message === '用户不存在') {
    return res.status(404).json({
      error: {
        message: err.message,
        code: 'USER_NOT_FOUND'
      }
    });
  }

  // 通用错误
  res.status(500).json({
    error: {
      message: '服务器错误',
      code: 'INTERNAL_ERROR'
    }
  });
}


/**
 * 管理员授权中间件
 * 检查用户是否为管理员
 */
export async function authorizeAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { message: '未授权访问', code: 'UNAUTHORIZED' }
      });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: { message: '需要管理员权限', code: 'FORBIDDEN' }
      });
    }
    next();
  } catch (error) {
    console.error('authorizeAdmin 错误:', error);
    res.status(500).json({ error: { message: '服务器错误', code: 'INTERNAL_ERROR' } });
  }
}

export default {
  authenticateToken,
  optionalAuthenticateToken,
  errorHandler,
  authorizeAdmin
};
