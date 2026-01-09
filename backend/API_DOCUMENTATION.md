# API 文档

## 认证 API

### 1. 用户注册

**接口**: `POST /api/auth/register`

**描述**: 注册新用户

**请求体**:
```json
{
  "username": "用户名",
  "email": "邮箱",
  "password": "密码",
  "confirmPassword": "确认密码"
}
```

**响应**:
```json
{
  "message": "注册成功",
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "email": "邮箱",
    "createdAt": "创建时间"
  }
}
```

### 2. 用户登录

**接口**: `POST /api/auth/login`

**描述**: 用户登录

**请求体**:
```json
{
  "username": "用户名",
  "password": "密码"
}
```

**响应**:
```json
{
  "message": "登录成功",
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "email": "邮箱"
  },
  "token": "JWT令牌",
  "expiryTime": 1234567890
}
```

### 3. 用户登出

**接口**: `POST /api/auth/logout`

**描述**: 用户登出

**请求头**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "message": "登出成功"
}
```

### 4. 获取当前用户信息

**接口**: `GET /api/auth/me`

**描述**: 获取当前登录用户信息

**请求头**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "email": "邮箱",
    "createdAt": "创建时间"
  }
}
```

### 5. 刷新 Token

**接口**: `POST /api/auth/refresh`

**描述**: 刷新访问令牌

**请求头**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "message": "Token 刷新成功",
  "token": "新的JWT令牌",
  "expiryTime": 1234567890
}
```

### 6. 修改密码

**接口**: `POST /api/auth/change-password`

**描述**: 修改用户密码

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "oldPassword": "旧密码",
  "newPassword": "新密码",
  "confirmPassword": "确认新密码"
}
```

**响应**:
```json
{
  "message": "密码修改成功"
}
```

## 智能体 API

### 1. 创建智能体

**接口**: `POST /api/agent/create`

**描述**: 创建新的智能体

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "name": "智能体名称",
  "description": "智能体描述",
  "avatar": "头像URL",
  "model": "deepseek|qwen",
  "personality": "人设描述",
  "initialMemory": "初始记忆",
  "voice": "xiaoxian|xiaogang|xiaohui",
  "speechRate": 150
}
```

**响应**:
```json
{
  "message": "智能体创建成功",
  "agent": {
    "id": "智能体ID",
    "name": "智能体名称",
    "description": "智能体描述",
    "avatar": "头像URL",
    "model": "AI模型",
    "personality": "人设描述",
    "initialMemory": "初始记忆",
    "voice": "语音",
    "speechRate": 150,
    "creatorId": "创建者ID",
    "creatorName": "创建者名称",
    "isPublished": false,
    "usageCount": 0,
    "userCount": 0,
    "createdAt": "创建时间"
  }
}
```

### 2. 获取用户的智能体列表

**接口**: `GET /api/agent/my-agents`

**描述**: 获取当前用户创建的智能体列表

**请求头**:
```
Authorization: Bearer <token>
```

**查询参数**:
- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 10）

**响应**:
```json
{
  "message": "获取用户智能体列表成功",
  "agents": [
    {
      "id": "智能体ID",
      "name": "智能体名称",
      // ... 其他字段
    }
  ],
  "total": 总数,
  "page": 当前页,
  "limit": 每页数量,
  "pages": 总页数
}
```

### 3. 获取已发布的智能体列表

**接口**: `GET /api/agent/published`

**描述**: 获取已发布的智能体列表（广场）

**查询参数**:
- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 10）

**响应**:
```json
{
  "message": "获取已发布智能体列表成功",
  "agents": [
    {
      "id": "智能体ID",
      "name": "智能体名称",
      // ... 其他字段
    }
  ],
  "total": 总数,
  "page": 当前页,
  "limit": 每页数量,
  "pages": 总页数
}
```

### 4. 获取智能体详情

**接口**: `GET /api/agent/:agentId`

**描述**: 获取指定智能体的详细信息

**路径参数**:
- `agentId`: 智能体 ID

**响应**:
```json
{
  "message": "获取智能体详情成功",
  "agent": {
    "id": "智能体ID",
    "name": "智能体名称",
    // ... 完整字段
  }
}
```

### 5. 更新智能体

**接口**: `PUT /api/agent/:agentId`

**描述**: 更新智能体信息

**请求头**:
```
Authorization: Bearer <token>
```

**路径参数**:
- `agentId`: 智能体 ID

**请求体**:
```json
{
  "name": "新的智能体名称",
  "description": "新的描述",
  // ... 其他要更新的字段
}
```

**响应**:
```json
{
  "message": "智能体更新成功",
  "agent": {
    "id": "智能体ID",
    // ... 更新后的字段
  }
}
```

### 6. 发布智能体

**接口**: `POST /api/agent/:agentId/publish`

**描述**: 发布智能体到广场

**请求头**:
```
Authorization: Bearer <token>
```

**路径参数**:
- `agentId`: 智能体 ID

**响应**:
```json
{
  "message": "智能体发布成功",
  "agent": {
    "id": "智能体ID",
    "name": "智能体名称",
    "isPublished": true,
    "publishedAt": "发布时间",
    // ... 其他字段
  }
}
```

### 7. 下架智能体

**接口**: `POST /api/agent/:agentId/unpublish`

**描述**: 下架已发布的智能体

**请求头**:
```
Authorization: Bearer <token>
```

**路径参数**:
- `agentId`: 智能体 ID

**响应**:
```json
{
  "message": "智能体下架成功",
  "agent": {
    "id": "智能体ID",
    "name": "智能体名称",
    "isPublished": false,
    "publishedAt": null,
    // ... 其他字段
  }
}
```

### 8. 删除智能体

**接口**: `DELETE /api/agent/:agentId`

**描述**: 删除智能体

**请求头**:
```
Authorization: Bearer <token>
```

**路径参数**:
- `agentId`: 智能体 ID

**响应**:
```json
{
  "message": "智能体已删除"
}
```

### 9. 智能体对话

**接口**: `POST /api/agent/:agentId/chat`

**描述**: 与指定智能体进行对话

**请求头**:
```
Authorization: Bearer <token> (可选，登录用户会有记忆功能)
```

**路径参数**:
- `agentId`: 智能体 ID

**请求体**:
```json
{
  "userId": "用户ID",
  "message": "对话消息"
}
```

**响应**: 流式文本响应（Server-Sent Events）

**功能特性**:
- 自动应用智能体的人设和初始记忆
- 支持用户个性化记忆（登录用户）
- 自动记忆管理（超过2000字自动压缩）
- 使用次数统计
- 流式响应支持

### 10. 获取用户与智能体的记忆

**接口**: `GET /api/agent/:agentId/memory`

**描述**: 获取用户与指定智能体的对话记忆

**请求头**:
```
Authorization: Bearer <token>
```

**路径参数**:
- `agentId`: 智能体 ID

**响应**:
```json
{
  "message": "获取记忆成功",
  "memory": {
    "agentId": "智能体ID",
    "userId": "用户ID",
    "content": "记忆内容",
    "contentLength": 内容长度,
    "conversationCount": 对话次数,
    "keywords": ["关键词1", "关键词2"],
    "createdAt": "创建时间",
    "updatedAt": "更新时间"
  }
}
```

## 错误响应格式

所有 API 在出错时都会返回以下格式的错误响应：

```json
{
  "error": {
    "message": "错误描述",
    "code": "错误代码"
  }
}
```

常见错误代码：
- `MISSING_FIELDS`: 缺少必填字段
- `INVALID_CREDENTIALS`: 用户名或密码错误
- `TOKEN_EXPIRED`: Token 已过期
- `INVALID_TOKEN`: Token 无效
- `NO_TOKEN`: 未提供认证 Token
- `USER_EXISTS`: 用户已存在
- `USER_NOT_FOUND`: 用户不存在
- `VALIDATION_ERROR`: 验证错误
- `AUTH_ERROR`: 认证错误
- `INTERNAL_ERROR`: 服务器内部错误