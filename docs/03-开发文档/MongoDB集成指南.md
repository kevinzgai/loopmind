# 🗄️ MongoDB 集成指南

## 概述

本项目已集成 MongoDB 作为数据库，用于存储用户信息、对话历史等数据。

## 安装依赖

```bash
cd backend
npm install mongoose
```

## 配置 MongoDB

### 1. 本地 MongoDB

**安装 MongoDB：**

```bash
# macOS
brew install mongodb-community

# Windows
# 下载安装程序：https://www.mongodb.com/try/download/community

# Linux (Ubuntu)
sudo apt-get install -y mongodb
```

**启动 MongoDB：**

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# 使用 MongoDB Compass 或命令行启动
```

**配置 .env：**

```env
MONGODB_URI=mongodb://localhost:27017/aichat
MONGODB_DB_NAME=aichat
```

### 2. 远程 MongoDB（推荐用于生产）

**使用 MongoDB Atlas（云服务）：**

1. 访问 https://www.mongodb.com/cloud/atlas
2. 注册免费账户
3. 创建集群
4. 获取连接字符串
5. 配置 .env：

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aichat?retryWrites=true&w=majority
MONGODB_DB_NAME=aichat
```

**使用自建 MongoDB 服务器：**

```env
MONGODB_URI=mongodb://username:password@host:port/aichat?authSource=admin
MONGODB_DB_NAME=aichat
```

## 数据模型

### 用户模型（User）

```javascript
{
  _id: ObjectId,
  username: string,           // 用户名（唯一）
  email: string,              // 邮箱（唯一）
  passwordHash: string,       // 密码哈希
  isActive: boolean,          // 是否激活
  profile: {
    avatar: string,           // 头像 URL
    bio: string               // 个人简介
  },
  lastLoginAt: Date,          // 最后登录时间
  createdAt: Date,            // 创建时间
  updatedAt: Date             // 更新时间
}
```

### 对话模型（Conversation）

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // 用户 ID（关联 User）
  provider: string,           // AI 提供商（deepseek/qwen）
  title: string,              // 对话标题
  messages: [
    {
      role: string,           // 角色（system/user/assistant）
      content: string,        // 消息内容
      createdAt: Date         // 创建时间
    }
  ],
  messageCount: number,       // 消息数量
  createdAt: Date,            // 创建时间
  updatedAt: Date             // 更新时间
}
```

## 数据库连接

### 连接流程

```javascript
// backend/src/config/database.js
import { connectDatabase, disconnectDatabase } from './config/database.js';

// 连接数据库
await connectDatabase();

// 断开连接
await disconnectDatabase();
```

### 在服务器启动时连接

```javascript
// backend/src/server.js
httpServer.listen(PORT, async () => {
  try {
    await connectDatabase();
    console.log('✅ 服务器启动成功');
  } catch (error) {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  }
});
```

## 使用 Mongoose 模型

### 创建用户

```javascript
import User from './models/UserSchema.js';

const user = new User({
  username: 'testuser',
  email: 'test@example.com',
  passwordHash: 'hashed_password'
});

await user.save();
```

### 查询用户

```javascript
// 根据用户名查询
const user = await User.findOne({ username: 'testuser' });

// 根据 ID 查询
const user = await User.findById(userId);

// 查询所有用户
const users = await User.find();

// 带条件查询
const users = await User.find({ isActive: true });
```

### 更新用户

```javascript
// 方法 1：修改后保存
const user = await User.findById(userId);
user.email = 'newemail@example.com';
await user.save();

// 方法 2：直接更新
await User.findByIdAndUpdate(userId, {
  email: 'newemail@example.com'
});

// 方法 3：批量更新
await User.updateMany(
  { isActive: false },
  { isActive: true }
);
```

### 删除用户

```javascript
// 删除单个用户
await User.findByIdAndDelete(userId);

// 删除多个用户
await User.deleteMany({ isActive: false });
```

## 认证服务集成

### 注册用户

```javascript
import { register } from './services/authServiceDB.js';

const user = await register('testuser', 'test@example.com', 'password123');
```

### 登录用户

```javascript
import { login } from './services/authServiceDB.js';

const result = await login('testuser', 'password123');
// result = { user, token, expiryTime }
```

### 验证 Token

```javascript
import { verifyToken } from './services/authServiceDB.js';

const userInfo = await verifyToken(token);
// userInfo = { userId, username, email }
```

## 测试

### 运行测试脚本

```bash
cd backend

# 确保 MongoDB 正在运行
# 然后运行测试
node test-auth-db.js
```

### 测试内容

1. ✅ 用户注册
2. ✅ 重复注册（应该失败）
3. ✅ 用户登录
4. ✅ 错误密码登录（应该失败）
5. ✅ 获取用户信息
6. ✅ 无效 Token（应该失败）
7. ✅ 修改密码
8. ✅ 使用新密码登录
9. ✅ 刷新 Token
10. ✅ 用户登出
11. ✅ 使用已登出的 Token（应该失败）
12. ✅ 验证数据库中的用户

## 常见问题

### 问题 1：连接超时

**错误信息：**
```
MongooseError: connect ECONNREFUSED 127.0.0.1:27017
```

**解决方案：**
1. 检查 MongoDB 是否正在运行
2. 检查连接字符串是否正确
3. 检查防火墙设置

### 问题 2：认证失败

**错误信息：**
```
MongoError: authentication failed
```

**解决方案：**
1. 检查用户名和密码是否正确
2. 检查 authSource 参数是否正确
3. 确认用户在指定的数据库中存在

### 问题 3：连接字符串格式错误

**常见错误：**
```
// ❌ 错误
mongodb://user:pass@host:27017/db

// ✅ 正确（带特殊字符时需要 URL 编码）
mongodb://user:pass%40word@host:27017/db?authSource=admin
```

### 问题 4：集合不存在

**解决方案：**
Mongoose 会自动创建集合，无需手动创建。

## 性能优化

### 1. 添加索引

```javascript
// 已在 Schema 中定义
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
conversationSchema.index({ userId: 1, provider: 1 });
```

### 2. 查询优化

```javascript
// ❌ 不好：查询所有字段
const user = await User.findById(userId);

// ✅ 好：只查询需要的字段
const user = await User.findById(userId).select('username email');

// ✅ 好：排除不需要的字段
const user = await User.findById(userId).select('-passwordHash');
```

### 3. 分页查询

```javascript
const page = 1;
const pageSize = 10;
const skip = (page - 1) * pageSize;

const users = await User.find()
  .skip(skip)
  .limit(pageSize)
  .sort({ createdAt: -1 });
```

## 备份和恢复

### 备份数据库

```bash
# 使用 mongodump
mongodump --uri "mongodb://localhost:27017/aichat" --out ./backup

# 使用 MongoDB Atlas 自动备份
# 在 MongoDB Atlas 控制面板中配置
```

### 恢复数据库

```bash
# 使用 mongorestore
mongorestore --uri "mongodb://localhost:27017/aichat" ./backup/aichat
```

## 监控和日志

### 查看连接状态

```javascript
import { getDatabaseStatus } from './config/database.js';

const status = getDatabaseStatus();
console.log(status);
// {
//   connected: true,
//   readyState: 1,
//   dbName: 'aichat',
//   host: 'localhost',
//   port: 27017
// }
```

### 启用 Mongoose 调试

```javascript
import mongoose from 'mongoose';

// 启用调试模式
mongoose.set('debug', true);

// 现在所有数据库操作都会被记录
```

## 迁移指南

### 从内存存储迁移到 MongoDB

1. **备份现有数据**
   ```javascript
   // 导出内存中的用户数据
   const users = getAllUsers();
   ```

2. **创建迁移脚本**
   ```javascript
   // 将数据导入 MongoDB
   for (const userData of users) {
     const user = new User(userData);
     await user.save();
   }
   ```

3. **验证数据**
   ```javascript
   const count = await User.countDocuments();
   console.log(`已迁移 ${count} 个用户`);
   ```

## 下一步

- [ ] 实现对话历史存储
- [ ] 添加用户个人资料管理
- [ ] 实现数据导出功能
- [ ] 添加数据备份策略
- [ ] 性能监控和优化

---

**文档版本**: v1.0.0  
**最后更新**: 2026-01-08
