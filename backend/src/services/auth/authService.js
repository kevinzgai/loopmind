import crypto from 'crypto';
import {
  createUser,
  getUserByUsername,
  getUserById,
  updateUser
} from '../../models/User.js';

/**
 * 认证服务
 * 处理用户注册、登录、Token 管理等
 */

// Token 存储（userId -> token）
const tokenStore = new Map();

// Token 过期时间（24 小时）
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

/**
 * 密码哈希
 */
function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
}

/**
 * 验证密码
 */
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

/**
 * 生成 Token
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 用户注册
 * @param {string} username - 用户名
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 * @returns {Object} 用户信息
 */
export function register(username, email, password) {
  // 验证输入
  if (!username || username.length < 3) {
    throw new Error('用户名至少 3 个字符');
  }

  if (!email || !isValidEmail(email)) {
    throw new Error('邮箱格式不正确');
  }

  if (!password || password.length < 6) {
    throw new Error('密码至少 6 个字符');
  }

  // 创建用户
  const passwordHash = hashPassword(password);
  const user = createUser(username, email, passwordHash);

  console.log(`✅ 用户注册成功: ${username}`);
  return user.toJSON();
}

/**
 * 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Object} {user, token}
 */
export function login(username, password) {
  // 查找用户
  const user = getUserByUsername(username);
  if (!user) {
    throw new Error('用户不存在');
  }

  // 验证密码
  if (!verifyPassword(password, user.passwordHash)) {
    throw new Error('密码错误');
  }

  // 检查用户是否激活
  if (!user.isActive) {
    throw new Error('用户已被禁用');
  }

  // 生成 Token
  const token = generateToken();
  const expiryTime = Date.now() + TOKEN_EXPIRY;

  // 存储 Token
  tokenStore.set(user.id, {
    token,
    expiryTime,
    createdAt: new Date()
  });

  console.log(`✅ 用户登录成功: ${username}`);
  return {
    user: user.toJSON(),
    token,
    expiryTime
  };
}

/**
 * 用户登出
 * @param {string} userId - 用户 ID
 */
export function logout(userId) {
  tokenStore.delete(userId);
  console.log(`✅ 用户登出成功: ${userId}`);
}

/**
 * 验证 Token
 * @param {string} token - Token
 * @returns {Object} 用户信息
 */
export function verifyToken(token) {
  // 查找 Token
  for (const [userId, tokenData] of tokenStore.entries()) {
    if (tokenData.token === token) {
      // 检查是否过期
      if (Date.now() > tokenData.expiryTime) {
        tokenStore.delete(userId);
        throw new Error('Token 已过期');
      }

      // 获取用户信息
      const user = getUserById(userId);
      if (!user) {
        tokenStore.delete(userId);
        throw new Error('用户不存在');
      }

      return {
        userId: user.id,
        username: user.username,
        email: user.email
      };
    }
  }

  throw new Error('Token 无效');
}

/**
 * 刷新 Token
 * @param {string} token - 旧 Token
 * @returns {Object} {token, expiryTime}
 */
export function refreshToken(token) {
  // 验证旧 Token
  const userInfo = verifyToken(token);

  // 生成新 Token
  const newToken = generateToken();
  const expiryTime = Date.now() + TOKEN_EXPIRY;

  // 更新 Token 存储
  tokenStore.set(userInfo.userId, {
    token: newToken,
    expiryTime,
    createdAt: new Date()
  });

  console.log(`✅ Token 刷新成功: ${userInfo.username}`);
  return {
    token: newToken,
    expiryTime
  };
}

/**
 * 修改密码
 * @param {string} userId - 用户 ID
 * @param {string} oldPassword - 旧密码
 * @param {string} newPassword - 新密码
 */
export function changePassword(userId, oldPassword, newPassword) {
  // 获取用户
  const user = getUserById(userId);
  if (!user) {
    throw new Error('用户不存在');
  }

  // 验证旧密码
  if (!verifyPassword(oldPassword, user.passwordHash)) {
    throw new Error('旧密码错误');
  }

  // 验证新密码
  if (!newPassword || newPassword.length < 6) {
    throw new Error('新密码至少 6 个字符');
  }

  // 更新密码
  const newPasswordHash = hashPassword(newPassword);
  updateUser(userId, { passwordHash: newPasswordHash });

  console.log(`✅ 密码修改成功: ${user.username}`);
}

/**
 * 验证邮箱格式
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 获取 Token 信息（仅用于调试）
 */
export function getTokenInfo(token) {
  for (const [userId, tokenData] of tokenStore.entries()) {
    if (tokenData.token === token) {
      return {
        userId,
        createdAt: tokenData.createdAt,
        expiryTime: tokenData.expiryTime,
        isExpired: Date.now() > tokenData.expiryTime
      };
    }
  }
  return null;
}

/**
 * 清空所有 Token（仅用于测试）
 */
export function clearAllTokens() {
  tokenStore.clear();
  console.log('🗑️  所有 Token 已清空');
}

export default {
  register,
  login,
  logout,
  verifyToken,
  refreshToken,
  changePassword,
  getTokenInfo,
  clearAllTokens
};
