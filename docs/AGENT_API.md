# 智能体 API 文档

## 数据模型

### Agent 对象

```typescript
interface Agent {
  id: string
  name: string                          // 智能体名称 (必填)
  description: string                   // 智能体描述
  avatar: string                        // 头像
  category: string                      // 分类
  model: string                         // AI 模型 (默认: deepseek-chat)
  personality: string                   // 系统提示词
  creatorId: string                     // 创建者 ID
  creatorName: string                   // 创建者名称
  
  // 知识库配置
  knowledgeBaseIds: string[]            // 知识库 ID 列表
  enableKnowledgeBase: boolean          // 是否启用知识库 (默认: false)
  
  // 功能开关
  features: {
    conversationOperator: boolean       // 对话开启白 (默认: true)
    nextQuestionSuggestion: boolean     // 下一步建议 (默认: false)
    textToSpeech: boolean               // 文字转语音 (默认: false)
    speechToText: boolean               // 语音转文字 (默认: false)
    contentModeration: boolean          // 内容审查 (默认: true)
  }
  
  // TTS 配置 (仅阿里云)
  ttsConfig: {
    voice: string                       // 音色 ID (默认: Cherry)
    speechRate: number                  // 语速 50-200 (默认: 150)
    autoPlay: boolean                   // 自动播放 (默认: false)
  }
  
  // 开场白配置
  greeting: {
    enabled: boolean                    // 是否启用开场白
    text: string                        // 开场白文本
    quickQuestions: string[]            // 快捷问题列表
  }
  
  // 内容审查
  sensitiveWords: string[]              // 敏感词列表
  
  // 发布状态
  isPublished: boolean                  // 是否发布
  publishedAt: Date                     // 发布时间
  
  // 统计信息
  usageCount: number                    // 使用次数
  userCount: number                     // 用户数
  
  // 时间戳
  createdAt: Date
  updatedAt: Date
}
```

## API 端点

### 创建智能体

**POST** `/api/agent/create`

**请求体:**
```json
{
  "name": "我的智能体",
  "description": "这是一个测试智能体",
  "model": "deepseek-chat",
  "personality": "你是一个友好的助手",
  "enableKnowledgeBase": false,
  "knowledgeBaseIds": [],
  "features": {
    "conversationOperator": true,
    "nextQuestionSuggestion": false,
    "textToSpeech": false,
    "speechToText": false,
    "contentModeration": true
  },
  "ttsConfig": {
    "voice": "Cherry",
    "speechRate": 150,
    "autoPlay": false
  },
  "greeting": {
    "enabled": false,
    "text": "你好！",
    "quickQuestions": []
  },
  "sensitiveWords": []
}
```

**响应:**
```json
{
  "code": 0,
  "data": {
    "agent": { /* Agent 对象 */ }
  },
  "message": "智能体创建成功"
}
```

### 获取智能体详情

**GET** `/api/agent/:agentId`

**响应:**
```json
{
  "code": 0,
  "data": {
    "agent": { /* Agent 对象 */ }
  },
  "message": "获取成功"
}
```

### 更新智能体

**PUT** `/api/agent/:agentId`

**请求体:** 同创建智能体

**响应:**
```json
{
  "code": 0,
  "data": {
    "agent": { /* 更新后的 Agent 对象 */ }
  },
  "message": "智能体更新成功"
}
```

### 删除智能体

**DELETE** `/api/agent/:agentId`

**响应:**
```json
{
  "code": 0,
  "message": "智能体删除成功"
}
```

### 获取我的智能体列表

**GET** `/api/agent/my-agents`

**查询参数:**
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 10

**响应:**
```json
{
  "code": 0,
  "data": {
    "agents": [ /* Agent 对象数组 */ ],
    "total": 10,
    "page": 1,
    "limit": 10
  },
  "message": "获取成功"
}
```

### 获取公开智能体列表

**GET** `/api/agent/marketplace`

**查询参数:**
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 10
- `category` (可选): 分类过滤

**响应:**
```json
{
  "code": 0,
  "data": {
    "agents": [ /* Agent 对象数组 */ ],
    "total": 100,
    "page": 1,
    "limit": 10
  },
  "message": "获取成功"
}
```

## TTS 相关 API

### 获取音色列表

**GET** `/api/tts/voices`

**响应:**
```json
{
  "code": 0,
  "data": {
    "voices": [
      { "id": "Cherry", "name": "Cherry - 标准女声" },
      { "id": "Serena", "name": "Serena - 温柔女声" },
      { "id": "Chelsie", "name": "Chelsie - 活力女声" },
      { "id": "Momo", "name": "Momo - 可爱女声" },
      { "id": "Vivian", "name": "Vivian - 知性女声" },
      { "id": "Moon", "name": "Moon - 成熟女声" },
      { "id": "Maia", "name": "Maia - 甜美女声" },
      { "id": "Kai", "name": "Kai - 标准男声" },
      { "id": "Nofish", "name": "Nofish - 磁性男声" },
      { "id": "Bella", "name": "Bella - 活泼女声" }
    ]
  },
  "message": "获取音色列表成功"
}
```

### 文字转语音

**POST** `/api/tts`

**请求体:**
```json
{
  "text": "这是音色预览，请听一下这个声音是否满意。",
  "voice": "Cherry",
  "speechRate": 150
}
```

**响应:** 返回音频二进制数据 (audio/mpeg)

### 流式文字转语音

**POST** `/api/tts/stream`

**请求体:** 同文字转语音

**响应:** 返回音频流

## 字段说明

### 音色 (voice)

仅支持阿里云 TTS 的常用音色，共 10 个：

| ID | 名称 | 描述 |
|---|---|---|
| Cherry | Cherry - 标准女声 | 标准普通话女声 |
| Serena | Serena - 温柔女声 | 温柔柔和的女声 |
| Chelsie | Chelsie - 活力女声 | 活泼有朝气的女声 |
| Momo | Momo - 可爱女声 | 可爱萌系的女声 |
| Vivian | Vivian - 知性女声 | 知性成熟的女声 |
| Moon | Moon - 成熟女声 | 成熟稳重的女声 |
| Maia | Maia - 甜美女声 | 甜美温暖的女声 |
| Kai | Kai - 标准男声 | 标准普通话男声 |
| Nofish | Nofish - 磁性男声 | 磁性低沉的男声 |
| Bella | Bella - 活泼女声 | 活泼开朗的女声 |

### 语速 (speechRate)

范围: 50-200，默认 150
- 50-100: 较慢
- 100-150: 正常
- 150-200: 较快

### 知识库启用 (enableKnowledgeBase)

- `true`: 启用知识库，可选择多个知识库
- `false`: 禁用知识库，knowledgeBaseIds 将被忽略

## 错误响应

```json
{
  "code": 1001,
  "data": null,
  "message": "错误信息描述"
}
```

常见错误码：
- `1001`: 参数错误
- `1006`: 资源不存在
- `1007`: 权限不足
- `-1`: 服务器错误
