# 🔐 认证 API 文档

## 概述

本文档描述了 AI 智能对话语音项目的认证系统 API。所有需要认证的接口都需要在请求头中提供有效的 Token。

## 基础信息

### 基础 URL
```
http://localhost:3000/api/auth
```

### 认证方式
使用 Bearer Token 认证，在请求头中添加：
```
Authorization: Bearer <token>
```

或在 URL 查询参数中添加：
```
?token=<token>
```

### 响应格式
所有响应都是 JSON 格式。

**成功响应示例：**
```json
{
  "message": "操作成功",
  "user": {
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2026-01-08T10:00:00.000Z",
    "updatedAt": "2026-01-08T10:00:00.000Z",
    "isActive": true
  }
}
```

**错误响应示例：**
```json
{
  "error": {
    "message": "错误描述",
    "code": "ERROR_CODE"
  }
}
```

## API 端点

### 1. 用户注册

**端点：** `POST /register`

**描述：** 创建新用户账户

**请求体：**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**参数说明：**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| username | string | ✅ | 用户名，至少 3 个字符 |
| email | string | ✅ | 邮箱地址，必须是有效的邮箱格式 |
| password | string | ✅ | 密码，至少 6 个字符 |
| confirmPassword | string | ✅ | 确认密码，必须与 password 一致 |

**成功响应（201）：**
```json
{
  "message": "注册成功",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2026-01-08T10:00:00.000Z",
    "updatedAt": "2026-01-08T10:00:00.000Z",
    "isActive": true
  }
}
```

**错误响应：**
- `400` - 参数验证失败
- `409` - 用户名或邮箱已存在

**示例：**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### 2. 用户登录

**端点：** `POST /login`

**描述：** 用户登录，获取 Token

**请求体：**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**参数说明：**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| username | string | ✅ | 用户名 |
| password | string | ✅ | 密码 |

**成功响应（200）：**
```json
{
  "message": "登录成功",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2026-01-08T10:00:00.000Z",
    "updatedAt": "2026-01-08T10:00:00.000Z",
    "isActive": true
  },
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "expiryTime": 1673164800000
}
```

**错误响应：**
- `400` - 参数缺失
- `401` - 用户名或密码错误

**示例：**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 3. 获取当前用户信息

**端点：** `GET /me`

**描述：** 获取当前登录用户的信息

**认证：** ✅ 需要

**成功响应（200）：**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2026-01-08T10:00:00.000Z",
    "updatedAt": "2026-01-08T10:00:00.000Z",
    "isActive": true
  }
}
```

**错误响应：**
- `401` - Token 无效或已过期
- `404` - 用户不存在

**示例：**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### 4. 刷新 Token

**端点：** `POST /refresh`

**描述：** 使用有效的 Token 获取新的 Token

**认证：** ✅ 需要

**成功响应（200）：**
```json
{
  "message": "Token 刷新成功",
  "token": "new_token_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "expiryTime": 1673251200000
}
```

**错误响应：**
- `401` - Token 无效或已过期

**示例：**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer <token>"
```

### 5. 修改密码

**端点：** `POST /change-password`

**描述：** 修改当前用户的密码

**认证：** ✅ 需要

**请求体：**
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

**参数说明：**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| oldPassword | string | ✅ | 旧密码 |
| newPassword | string | ✅ | 新密码，至少 6 个字符 |
| confirmPassword | string | ✅ | 确认新密码，必须与 newPassword 一致 |

**成功响应（200）：**
```json
{
  "message": "密码修改成功"
}
```

**错误响应：**
- `400` - 参数验证失败
- `401` - 旧密码错误或 Token 无效

**示例：**
```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "password123",
    "newPassword": "newpassword456",
    "confirmPassword": "newpassword456"
  }'
```

### 6. 用户登出

**端点：** `POST /logout`

**描述：** 用户登出，使当前 Token 失效

**认证：** ✅ 需要

**成功响应（200）：**
```json
{
  "message": "登出成功"
}
```

**错误响应：**
- `401` - Token 无效或已过期

**示例：**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

## 错误代码

| 错误代码 | HTTP 状态 | 说明 |
|---------|---------|------|
| MISSING_FIELDS | 400 | 缺少必需字段 |
| PASSWORD_MISMATCH | 400 | 两次输入的密码不一致 |
| VALIDATION_ERROR | 400 | 参数验证失败 |
| INVALID_CREDENTIALS | 401 | 用户名或密码错误 |
| INVALID_PASSWORD | 401 | 旧密码错误 |
| NO_TOKEN | 401 | 未提供 Token |
| INVALID_TOKEN | 401 | Token 无效 |
| TOKEN_EXPIRED | 401 | Token 已过期 |
| USER_EXISTS | 409 | 用户已存在 |
| USER_NOT_FOUND | 404 | 用户不存在 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

## Token 说明

### Token 格式
Token 是一个 64 位的十六进制字符串，由服务器生成。

### Token 有效期
- 默认有效期：24 小时
- 过期后需要重新登录或使用刷新接口获取新 Token

### Token 存储
- 前端应将 Token 存储在 localStorage 或 sessionStorage 中
- 建议使用 localStorage 以保持登录状态

### Token 使用
在所有需要认证的请求中，将 Token 添加到请求头：
```
Authorization: Bearer <token>
```

## 使用示例

### JavaScript/Fetch

```javascript
// 注册
async function register() {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    })
  });
  const data = await response.json();
  return data;
}

// 登录
async function login() {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'testuser',
      password: 'password123'
    })
  });
  const data = await response.json();
  
  // 保存 Token
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  
  return data;
}

// 获取当前用户
async function getCurrentUser() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
}

// 登出
async function logout() {
  const token = localStorage.getItem('token');
  await fetch('http://localhost:3000/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // 清除 Token
  localStorage.removeItem('token');
}
```

### cURL

```bash
# 注册
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

# 获取当前用户（需要替换 <token>）
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"

# 登出
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

## 最佳实践

### 1. 密码安全
- 密码最少 6 个字符
- 建议使用强密码（包含大小写字母、数字、特殊字符）
- 不要在客户端存储密码

### 2. Token 管理
- 将 Token 存储在安全的位置（localStorage 或 sessionStorage）
- 定期刷新 Token 以保持登录状态
- 登出时清除 Token

### 3. 错误处理
- 捕获所有 API 错误并显示友好的错误提示
- 当收到 401 错误时，提示用户重新登录
- 实现自动重试机制（可选）

### 4. 安全性
- 使用 HTTPS 传输敏感信息
- 不要在 URL 中传递密码
- 实现请求频率限制以防止暴力破解

## 测试

### 运行测试脚本

```bash
cd backend
node test-auth.js
```

测试脚本会自动执行以下测试：
1. 用户注册
2. 重复注册（应该失败）
3. 用户登录
4. 错误密码登录（应该失败）
5. 获取用户信息
6. 无效 Token（应该失败）
7. 修改密码
8. 使用新密码登录
9. 刷新 Token
10. 用户登出
11. 使用已登出的 Token（应该失败）

---

**文档版本**: v1.0.0  
**最后更新**: 2026-01-08
