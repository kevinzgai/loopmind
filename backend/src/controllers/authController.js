import {
  register,
  login,
  logout,
  refreshToken,
  changePassword,
  getUserInfo
} from '../services/authServiceDB.js';

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
      return res.status(400).json({
        error: {
          message: '用户名、邮箱和密码不能为空',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // 验证密码一致性
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: {
          message: '两次输入的密码不一致',
          code: 'PASSWORD_MISMATCH'
        }
      });
    }

    // 注册用户
    const user = await register(username, email, password);

    res.status(201).json({
      message: '注册成功',
      user
    });
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
      return res.status(400).json({
        error: {
          message: '用户名和密码不能为空',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // 登录用户
    const result = await login(username, password);

    res.status(200).json({
      message: '登录成功',
      user: result.user,
      token: result.token,
      expiryTime: result.expiryTime
    });
  } catch (error) {
    console.error('❌ 登录失败:', error.message);

    // 用户不存在或密码错误
    if (error.message === '用户不存在' || error.message === '密码错误') {
      return res.status(401).json({
        error: {
          message: '用户名或密码错误',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    next(error);
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

    res.status(200).json({
      message: '登出成功'
    });
  } catch (error) {
    console.error('❌ 登出失败:', error.message);
    next(error);
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

    res.status(200).json({
      message: 'Token 刷新成功',
      token: result.token,
      expiryTime: result.expiryTime
    });
  } catch (error) {
    console.error('❌ Token 刷新失败:', error.message);
    next(error);
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

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error.message);
    next(error);
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
      return res.status(400).json({
        error: {
          message: '旧密码和新密码不能为空',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // 验证新密码一致性
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: {
          message: '两次输入的新密码不一致',
          code: 'PASSWORD_MISMATCH'
        }
      });
    }

    // 修改密码
    await changePassword(userId, oldPassword, newPassword);

    res.status(200).json({
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('❌ 修改密码失败:', error.message);

    if (error.message === '旧密码错误') {
      return res.status(401).json({
        error: {
          message: error.message,
          code: 'INVALID_PASSWORD'
        }
      });
    }

    next(error);
  }
}

export default {
  handleRegister,
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleGetCurrentUser,
  handleChangePassword
};
