import crypto from 'crypto';
import User from '../../models/UserSchema.js';
import Token from '../../models/TokenSchema.js';

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
    // 快速校验 token 格式（64位十六进制），避免无效 token 触发 DB 查询
    if (!token || !/^[0-9a-f]{64}$/i.test(token)) {
      throw new Error('Token 无效');
    }

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
      email: user.email,
      role: user.role
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

/**
 * 更新用户资料
 */
export async function updateUserProfile(userId, profileData) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 更新个人简介
    if (profileData.bio !== undefined) {
      user.profile.bio = profileData.bio;
    }

    // 更新头像
    if (profileData.avatar !== undefined) {
      user.profile.avatar = profileData.avatar;
    }

    await user.save();
    console.log(`✅ 用户资料更新成功: ${user.username}`);
    return user.toJSON();
  } catch (error) {
    console.error('❌ 更新用户资料失败:', error.message);
    throw error;
  }
}

/**
 * 获取所有用户列表（管理员功能）
 */
export async function getAllUsers(options = {}) {
  try {
    const { page = 1, limit = 20, search = '' } = options;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return {
      users: users.map(u => u.toJSON()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('❌ 获取用户列表失败:', error.message);
    throw error;
  }
}

/**
 * 创建用户（管理员功能）
 */
export async function createUser(userData) {
  try {
    const { username, email, password, role = 'user' } = userData;
    
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
    
    // 如果要创建管理员，检查是否已存在管理员
    if (role === 'admin') {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        throw new Error('系统已存在管理员，不能创建多个管理员账号');
      }
    }
    
    const passwordHash = hashPassword(password);
    const user = new User({
      username,
      email,
      passwordHash,
      role
    });
    
    await user.save();
    console.log(`✅ 用户创建成功: ${username} (${role})`);
    return user.toJSON();
  } catch (error) {
    console.error('❌ 创建用户失败:', error.message);
    throw error;
  }
}

/**
 * 更新用户（管理员功能）
 */
export async function updateUser(userId, userData) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    const { username, email, role, isActive } = userData;
    
    // 如果要修改用户名，检查是否已存在
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUsername) {
        throw new Error('用户名已存在');
      }
      user.username = username;
    }
    
    // 如果要修改邮箱，检查是否已存在
    if (email && email !== user.email) {
      if (!isValidEmail(email)) {
        throw new Error('邮箱格式不正确');
      }
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) {
        throw new Error('邮箱已被使用');
      }
      user.email = email;
    }
    
    // 如果要修改角色
    if (role !== undefined && role !== user.role) {
      // 如果要将用户改为管理员
      if (role === 'admin') {
        const existingAdmin = await User.findOne({ role: 'admin', _id: { $ne: userId } });
        if (existingAdmin) {
          throw new Error('系统已存在管理员，不能设置多个管理员账号');
        }
      }
      // 如果要将当前管理员改为普通用户
      if (user.role === 'admin' && role !== 'admin') {
        throw new Error('不能取消唯一管理员的权限');
      }
      user.role = role;
    }
    
    // 修改激活状态
    if (isActive !== undefined) {
      user.isActive = isActive;
    }
    
    await user.save();
    console.log(`✅ 用户更新成功: ${user.username}`);
    return user.toJSON();
  } catch (error) {
    console.error('❌ 更新用户失败:', error.message);
    throw error;
  }
}

/**
 * 删除用户（管理员功能）
 */
export async function deleteUser(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 不能删除管理员
    if (user.role === 'admin') {
      throw new Error('不能删除管理员账号');
    }
    
    // 删除用户的所有 Token
    await Token.deleteMany({ userId });
    
    // 删除用户
    await User.findByIdAndDelete(userId);
    console.log(`✅ 用户删除成功: ${user.username}`);
    return { message: '用户已删除' };
  } catch (error) {
    console.error('❌ 删除用户失败:', error.message);
    throw error;
  }
}

/**
 * 重置用户密码（管理员功能）
 */
export async function resetUserPassword(userId, newPassword) {
  try {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new Error('用户不存在');
    }
    
    if (!newPassword || newPassword.length < 6) {
      throw new Error('新密码至少 6 个字符');
    }
    
    user.passwordHash = hashPassword(newPassword);
    await user.save();
    
    // 删除该用户的所有 Token，强制重新登录
    await Token.deleteMany({ userId });
    
    console.log(`✅ 用户密码重置成功: ${user.username}`);
    return { message: '密码已重置' };
  } catch (error) {
    console.error('❌ 重置密码失败:', error.message);
    throw error;
  }
}

/**
 * 获取用户统计信息（管理员功能）
 */
export async function getUserStats() {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const todayLogins = await User.countDocuments({
      lastLoginAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    
    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminCount,
      todayLogins
    };
  } catch (error) {
    console.error('❌ 获取用户统计失败:', error.message);
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
  updateUserProfile,
  getTokenInfo,
  clearAllTokens,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getUserStats
};
