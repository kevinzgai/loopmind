import crypto from 'crypto';

/**
 * 用户模型
 * 内存存储（未来可迁移到数据库）
 */

// 用户存储
const users = new Map();

/**
 * 用户数据结构
 */
class User {
  constructor(username, email, passwordHash) {
    this.id = crypto.randomUUID();
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.isActive = true;
  }

  /**
   * 转换为 JSON（不包含密码）
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
    };
  }
}

/**
 * 创建用户
 */
export function createUser(username, email, passwordHash) {
  // 检查用户名是否已存在
  if (Array.from(users.values()).some(u => u.username === username)) {
    throw new Error('用户名已存在');
  }

  // 检查邮箱是否已存在
  if (Array.from(users.values()).some(u => u.email === email)) {
    throw new Error('邮箱已被注册');
  }

  const user = new User(username, email, passwordHash);
  users.set(user.id, user);

  console.log(`✅ 用户创建成功: ${username}`);
  return user;
}

/**
 * 根据 ID 获取用户
 */
export function getUserById(userId) {
  return users.get(userId);
}

/**
 * 根据用户名获取用户
 */
export function getUserByUsername(username) {
  return Array.from(users.values()).find(u => u.username === username);
}

/**
 * 根据邮箱获取用户
 */
export function getUserByEmail(email) {
  return Array.from(users.values()).find(u => u.email === email);
}

/**
 * 更新用户
 */
export function updateUser(userId, updates) {
  const user = users.get(userId);
  if (!user) {
    throw new Error('用户不存在');
  }

  Object.assign(user, updates, { updatedAt: new Date() });
  console.log(`✅ 用户更新成功: ${user.username}`);
  return user;
}

/**
 * 删除用户
 */
export function deleteUser(userId) {
  const user = users.get(userId);
  if (!user) {
    throw new Error('用户不存在');
  }

  users.delete(userId);
  console.log(`✅ 用户删除成功: ${user.username}`);
  return true;
}

/**
 * 获取所有用户（仅用于调试）
 */
export function getAllUsers() {
  return Array.from(users.values()).map(u => u.toJSON());
}

/**
 * 清空所有用户（仅用于测试）
 */
export function clearAllUsers() {
  users.clear();
  console.log('🗑️  所有用户已清空');
}

export default {
  createUser,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  updateUser,
  deleteUser,
  getAllUsers,
  clearAllUsers
};
