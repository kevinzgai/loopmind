import crypto from 'crypto';
import User from '../models/UserSchema.js';
import Token from '../models/TokenSchema.js';

/**
 * 认证服务（MongoDB 版本）
 * 处理用户注册、登录、Token 管理等
 */

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
 * 验证邮箱格式
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 用户注册
 */
export async function register(username, email, password) {
  try {
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

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error('邮箱已被注册');
    }

    // 创建用户
    const passwordHash = hashPassword(password);
    const user = new User({
      username,
      email,
      passwordHash
    });

    await user.save();

    console.log(`✅ 用户注册成功: ${username}`);
    return user.toJSON();
  } catch (error) {
    console.error('❌ 注册失败:', error.message);
    throw error;
  }
}

/**
 * 用户登录
 */
export async function login(username, password) {
  try {
    // 查找用户
    const user = await User.findOne({ username }).select('+passwordHash');
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

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 生成 Token
    const token = generateToken();
    const expiryTime = new Date(Date.now() + TOKEN_EXPIRY);

    // 存储 Token 到 MongoDB
    const tokenDoc = new Token({
      userId: user._id,
      token,
      expiryTime
    });
    await tokenDoc.save();

    console.log(`✅ 用户登录成功: ${username}`);
    
    const userJson = user.toJSON();
    return {
      user: userJson,
      token,
      expiryTime: expiryTime.getTime()
    };
  } catch (error) {
    console.error('❌ 登录失败:', error.message);
    throw error;
  }
}

/**
 * 用户登出
 */
export async function logout(userId, token) {
  try {
    await Token.deleteOne({ userId, token });
    console.log(`✅ 用户登出成功: ${userId}`);
  } catch (error) {
    console.error('❌ 登出失败:', error.message);
    throw error;
  }
}

/**
 * 验证 Token
 */
export async function verifyToken(token) {
  try {
    // 从 MongoDB 查找 Token
    const tokenDoc = await Token.findOne({ token }).populate('userId');

    if (!tokenDoc) {
      throw new Error('Token 无效');
    }

    // 检查是否过期
    if (Date.now() > tokenDoc.expiryTime.getTime()) {
      await Token.deleteOne({ _id: tokenDoc._id });
      throw new Error('Token 已过期');
    }

    // 获取用户信息
    const user = tokenDoc.userId;
    if (!user) {
      await Token.deleteOne({ _id: tokenDoc._id });
      throw new Error('用户不存在');
    }

    return {
      userId: user._id.toString(),
      username: user.username,
      email: user.email
    };
  } catch (error) {
    console.error('❌ Token 验证失败:', error.message);
    throw error;
  }
}

/**
 * 刷新 Token
 */
export async function refreshToken(token) {
  try {
    // 验证旧 Token
    const userInfo = await verifyToken(token);

    // 删除旧 Token
    await Token.deleteOne({ token });

    // 生成新 Token
    const newToken = generateToken();
    const expiryTime = new Date(Date.now() + TOKEN_EXPIRY);

    // 存储新 Token 到 MongoDB
    const tokenDoc = new Token({
      userId: userInfo.userId,
      token: newToken,
      expiryTime
    });
    await tokenDoc.save();

    console.log(`✅ Token 刷新成功: ${userInfo.username}`);
    return {
      token: newToken,
      expiryTime: expiryTime.getTime()
    };
  } catch (error) {
    console.error('❌ Token 刷新失败:', error.message);
    throw error;
  }
}

/**
 * 修改密码
 */
export async function changePassword(userId, oldPassword, newPassword) {
  try {
    // 获取用户
    const user = await User.findById(userId).select('+passwordHash');
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
    user.passwordHash = newPasswordHash;
    await user.save();

    console.log(`✅ 密码修改成功: ${user.username}`);
  } catch (error) {
    console.error('❌ 修改密码失败:', error.message);
    throw error;
  }
}

/**
 * 获取用户信息
 */
export async function getUserInfo(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    return user.toJSON();
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error.message);
    throw error;
  }
}

/**
 * 获取 Token 信息（仅用于调试）
 */
export async function getTokenInfo(token) {
  try {
    const tokenDoc = await Token.findOne({ token });
    if (!tokenDoc) {
      return null;
    }
    return {
      userId: tokenDoc.userId.toString(),
      createdAt: tokenDoc.createdAt,
      expiryTime: tokenDoc.expiryTime,
      isExpired: Date.now() > tokenDoc.expiryTime.getTime()
    };
  } catch (error) {
    console.error('❌ 获取 Token 信息失败:', error.message);
    return null;
  }
}

/**
 * 清空所有 Token（仅用于测试）
 */
export async function clearAllTokens() {
  try {
    await Token.deleteMany({});
    console.log('🗑️  所有 Token 已清空');
  } catch (error) {
    console.error('❌ 清空 Token 失败:', error.message);
    throw error;
  }
}

export default {
  register,
  login,
  logout,
  verifyToken,
  refreshToken,
  changePassword,
  getUserInfo,
  getTokenInfo,
  clearAllTokens
};
