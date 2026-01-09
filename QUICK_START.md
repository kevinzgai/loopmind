# 快速开始指南

## 🚀 5 分钟快速开始

### 1. 启动后端服务

```bash
cd backend
npm run dev
```

**预期输出**:
```
Server running at http://localhost:3000
MongoDB 连接成功
```

### 2. 启动前端开发服务器

```bash
cd frontend
npm run dev
```

**预期输出**:
```
VITE v5.4.21  ready in 1234 ms

➜  Local:   http://localhost:5173/
```

### 3. 打开浏览器

访问 `http://localhost:5173`

## 📝 测试认证系统

### 步骤 1: 注册新用户

1. 点击首页右上角的"注册"按钮
2. 填写表单：
   - 用户名: `testuser`
   - 邮箱: `test@example.com`
   - 密码: `password123`
   - 确认密码: `password123`
3. 点击"注册"按钮
4. 应该跳转到登录页

### 步骤 2: 登录

1. 填写登录表单：
   - 用户名: `testuser`
   - 密码: `password123`
2. 点击"登录"按钮
3. 应该跳转到首页
4. 导航栏应该显示用户名和"登出"按钮

### 步骤 3: 访问受保护的路由

1. 点击导航栏的"对话"链接或首页的"AI 对话"卡片
2. 应该能够进入对话页面
3. 可以正常发送消息

### 步骤 4: 测试登出

1. 点击导航栏的"登出"按钮
2. 应该跳转到登录页
3. 导航栏消失

### 步骤 5: 测试路由保护

1. 尝试直接访问 `http://localhost:5173/chat`
2. 应该自动重定向到登录页

## 🔍 调试技巧

### 查看浏览器控制台

打开浏览器开发者工具（F12），查看 Console 标签：

**登录成功时**:
```
✅ 登录成功
```

**注册成功时**:
```
✅ 注册成功
```

**错误时**:
```
❌ 登录失败: [错误信息]
```

### 查看本地存储

在浏览器开发者工具中：
1. 打开 Application 标签
2. 点击 Local Storage
3. 查看 `token` 和 `user` 的值

### 查看后端日志

后端控制台会显示：
```
✅ 用户注册成功
✅ 用户登录成功
✅ 获取用户信息成功
```

## 📚 文件导航

### 前端认证相关文件

```
frontend/src/
├── stores/authStore.js              # 认证状态管理
├── views/
│   ├── LoginPage.vue                # 登录页面
│   ├── RegisterPage.vue             # 注册页面
│   └── HomePage.vue                 # 首页
├── router/index.js                  # 路由配置
└── App.vue                          # 主应用
```

### 后端认证相关文件

```
backend/src/
├── routes/authRoutes.js             # 认证路由
├── controllers/authController.js    # 认证控制器
├── services/authServiceDB.js        # 认证服务
├── middleware/authMiddleware.js     # 认证中间件
└── models/UserSchema.js             # 用户模型
```

### 文档

```
docs/03-开发文档/
├── 前端认证集成指南.md              # 详细集成指南
├── 认证系统测试指南.md              # 测试指南
├── 认证API文档.md                   # API 文档
└── MongoDB集成指南.md               # 数据库指南
```

## 🔧 常见问题

### Q: 登录后页面没有更新？

**A**: 
1. 检查浏览器控制台是否有错误
2. 确保后端正常运行
3. 清除浏览器缓存并刷新

### Q: 无法连接到后端？

**A**:
1. 确保后端已启动：`npm run dev`
2. 检查后端是否运行在 `http://localhost:3000`
3. 检查防火墙设置

### Q: MongoDB 连接失败？

**A**:
1. 检查 `.env` 文件中的 MongoDB 连接字符串
2. 确保 MongoDB 服务器正常运行
3. 检查网络连接

### Q: 注册时显示"用户已存在"？

**A**: 使用不同的用户名重新注册

### Q: 登录时显示"用户名或密码错误"？

**A**: 
1. 检查用户名和密码是否正确
2. 确保用户已注册
3. 检查大小写

## 📊 API 端点速查

| 方法 | 端点 | 功能 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/me` | 获取用户 |
| POST | `/api/auth/logout` | 登出 |
| POST | `/api/auth/refresh` | 刷新 Token |

## 🧪 快速测试命令

### 测试注册

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "email":"test@example.com",
    "password":"password123",
    "confirmPassword":"password123"
  }'
```

### 测试登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "password":"password123"
  }'
```

### 测试获取用户信息

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📱 移动设备测试

### 在本地网络上测试

1. 获取本机 IP 地址：
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. 在移动设备上访问：
   ```
   http://YOUR_IP:5173
   ```

3. 确保防火墙允许连接

## 🎯 下一步

- [ ] 完成认证系统测试
- [ ] 部署到生产环境
- [ ] 添加邮箱验证
- [ ] 实现密码重置
- [ ] 添加社交登录

## 📖 详细文档

- [前端认证集成指南](docs/03-开发文档/前端认证集成指南.md)
- [认证系统测试指南](docs/03-开发文档/认证系统测试指南.md)
- [认证 API 文档](docs/03-开发文档/认证API文档.md)
- [实现总结](IMPLEMENTATION_SUMMARY.md)

## 💡 提示

- 使用 `npm run dev` 启动开发服务器
- 使用 `npm run build` 构建生产版本
- 使用浏览器开发者工具调试
- 查看后端日志了解服务器状态
- 定期检查浏览器控制台的错误信息

## 🆘 获取帮助

1. 查看相关文档
2. 检查浏览器控制台错误
3. 查看后端日志
4. 检查网络连接
5. 清除缓存并重新启动

---

**祝你使用愉快！** 🎉
