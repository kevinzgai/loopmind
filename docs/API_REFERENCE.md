# Chart AI API 文档

## 概述

Chart AI 是一个多模态 AI 智能体平台，提供 RESTful API 供开发者集成。

- **基础 URL**: `http://localhost:3002/api`
- **认证方式**: Bearer Token (JWT)
- **响应格式**: JSON

## 认证

所有需要认证的接口，请在请求头中携带：

```
Authorization: Bearer <your-jwt-token>
```

## 统一响应格式

```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

---

## 认证接口

### 登录

```
POST /auth/login
```

**请求体:**
```json
{
  "username": "admin",
  "password": "admin@123"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": { "id": "...", "username": "admin", "role": "admin" }
  }
}
```

### 注册

```
POST /auth/register
```

**请求体:**
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "password123"
}
```

---

## 智能体接口

### 获取已发布的智能体

```
GET /agent/published?page=1&limit=12&category=编程
```

### 获取我的智能体

```
GET /agent/my-agents
```

### 创建智能体

```
POST /agent/create
```

**请求体:**
```json
{
  "name": "Python 助手",
  "description": "专注 Python 编程的助手",
  "model": "deepseek-chat",
  "personality": "你是一个专业的 Python 编程助手",
  "category": "编程",
  "voiceConfig": {
    "voice": "Cherry",
    "speechRate": 150
  }
}
```

### 更新智能体

```
PUT /agent/:agentId
```

### 删除智能体

```
DELETE /agent/:agentId
```

### 发布智能体

```
POST /agent/:agentId/publish
```

### 与智能体对话

```
POST /agent/:agentId/conversations/:conversationId/chat
```

**请求体:**
```json
{
  "message": "帮我写一个快速排序算法"
}
```

**响应**: SSE 流式输出

---

## 知识库接口

### 获取知识库列表

```
GET /knowledge
```

### 创建知识库

```
POST /knowledge
```

**请求体:**
```json
{
  "name": "产品文档",
  "description": "产品使用手册"
}
```

### 上传文档

```
POST /knowledge/:kbId/documents
Content-Type: multipart/form-data
```

**表单字段:** `file` (PDF/DOCX 文件)

---

## 工作流接口

### 创建工作流

```
POST /workflow
```

**请求体:**
```json
{
  "name": "客服自动化",
  "description": "自动处理客户咨询",
  "nodes": [
    {
      "id": "node_1",
      "type": "input",
      "label": "用户输入",
      "position": { "x": 100, "y": 100 },
      "data": { "variableName": "userInput" }
    },
    {
      "id": "node_2",
      "type": "llm",
      "label": "AI 回复",
      "position": { "x": 300, "y": 100 },
      "data": {
        "model": "deepseek-chat",
        "prompt": "请回答用户的问题: {{userInput}}"
      }
    },
    {
      "id": "node_3",
      "type": "output",
      "label": "输出",
      "position": { "x": 500, "y": 100 },
      "data": { "outputName": "reply", "value": "{{node_2}}" }
    }
  ],
  "edges": [
    { "id": "e1", "source": "node_1", "target": "node_2" },
    { "id": "e2", "source": "node_2", "target": "node_3" }
  ]
}
```

### 执行工作流

```
POST /workflow/:workflowId/execute
```

**请求体:**
```json
{
  "inputData": {
    "userInput": "如何重置密码?"
  }
}
```

---

## 工具接口

### 获取内置工具

```
GET /tools/builtin
```

### 创建自定义工具

```
POST /tools
```

**请求体 (HTTP 工具):**
```json
{
  "name": "weather_api",
  "description": "查询天气信息",
  "type": "http",
  "httpConfig": {
    "method": "GET",
    "url": "https://api.weather.com/v1/current?city={city}",
    "timeout": 10000
  },
  "inputs": [
    { "name": "city", "type": "string", "description": "城市名称", "required": true }
  ],
  "outputs": [
    { "name": "weather", "type": "object", "description": "天气数据" }
  ]
}
```

### 执行工具

```
POST /tools/:toolId/execute
```

**请求体:**
```json
{
  "inputs": {
    "city": "上海"
  }
}
```

---

## 数据分析接口

### 获取概览统计

```
GET /analytics/overview?days=30
```

### 获取每日趋势

```
GET /analytics/trend/daily?days=30
```

### 获取热词分析

```
GET /analytics/words/hot?limit=30&days=30
```

### 获取活跃时段

```
GET /analytics/activity/hourly
```

---

## 导出接口

### 导出对话

```
GET /export/:conversationId?format=markdown
```

**format 可选值**: `markdown`, `json`, `csv`, `txt`

---

## 工作空间接口

### 创建工作空间

```
POST /workspace
```

**请求体:**
```json
{
  "name": "我的团队",
  "description": "团队协作空间"
}
```

### 邀请成员

```
POST /workspace/:workspaceId/members
```

**请求体:**
```json
{
  "userId": "xxx",
  "role": "editor"
}
```

**角色说明:**
- `owner`: 所有权限
- `admin`: 管理权限（可邀请成员）
- `editor`: 编辑权限（可创建/编辑智能体）
- `viewer`: 只读权限

### 生成邀请码

```
POST /workspace/:workspaceId/invite-code
```

**请求体:**
```json
{
  "expiryHours": 24
}
```

### 通过邀请码加入

```
POST /workspace/join
```

**请求体:**
```json
{
  "code": "ABCD1234"
}
```

---

## 多模态接口

### 上传图片

```
POST /multimodal/upload
Content-Type: multipart/form-data
```

**表单字段:** `images` (支持最多 5 张图片，JPEG/PNG/GIF/WebP，最大 10MB)

### 解析文件

```
POST /files/parse
Content-Type: multipart/form-data
```

**表单字段:** `file` (CSV/JSON/TXT，最大 20MB)

---

## Agent 版本管理

### 创建版本快照

```
POST /agent/:agentId/versions
```

**请求体:**
```json
{
  "changelog": "更新系统提示词"
}
```

### 获取版本历史

```
GET /agent/:agentId/versions
```

### 对比版本

```
GET /agent/:agentId/versions/compare?versionA=1&versionB=3
```

### 回滚版本

```
POST /agent/:agentId/versions/:versionNumber/rollback
```

---

## 审计日志接口

### 查询审计日志

```
GET /audit?action=agent.create&startDate=2026-01-01&page=1&limit=50
```

### 获取统计

```
GET /audit/stats?days=7
```

---

## 错误码

| HTTP 状态码 | 说明 |
|------------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

---

## 速率限制

- 默认限制：每分钟 100 次请求
- 响应头包含：`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- 超出限制返回 429 状态码
