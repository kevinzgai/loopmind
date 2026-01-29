# 智能体第三方 API 接口文档

本文档描述了如何通过第三方应用调用 Agent 智能体对话接口。

## 1. 授权认证 (Authorization)

所有外部 API 请求必须包含有效的 **API Key**。

### 1.1 获取方式
请在系统后台“个人中心 -> API 管理”中生成您的 API Key。

### 1.2 使用方式
您可以选择以下两种方式之一传递 API Key：

1.  **请求头 (推荐)**:
    ```http
    X-API-Key: YOUR_API_KEY_HERE
    ```
2.  **查询参数**:
    ```http
    GET /api/external/agent/.../chat?api_key=YOUR_API_KEY_HERE
    ```

---

## 2. 智能体对话接口

与指定的智能体进行对话，支持 RAG 知识库检索。

### 2.1 接口地址
`POST /api/external/agent/:agentId/chat`

### 2.2 请求参数 (JSON)

| 参数名 | 类型 | 必选 | 说明 |
| :--- | :--- | :--- | :--- |
| `message` | `string` | 是 | 用户发送的文本消息 |
| `stream` | `boolean` | 否 | 是否启用流式响应，默认为 `false` |

### 2.3 响应示例 (非流式 `stream: false`)

**请求**:
```json
{
  "message": "你好，请介绍一下你自己",
  "stream": false
}
```

**响应 (200 OK)**:
```json
{
  "content": "你好！我是你的 AI 助手，很高兴为你服务...",
  "agent": {
    "id": "697abf8258354d7ac577b52f",
    "name": "电影专家"
  }
}
```

### 2.4 响应示例 (流式 `stream: true`)

流式响应使用标准的消息流 (Server-Sent Events) 格式。

**请求**:
```json
{
  "message": "写一首关于大海的诗",
  "stream": true
}
```

**响应**:
```text
data: {"content": "大"}

data: {"content": "海"}

data: {"content": "啊"}

data: [DONE]
```

---

## 3. 错误码说明

| 状态码 | 错误信息 | 说明 |
| :--- | :--- | :--- |
| `400` | `Missing message parameter` | 请求体中缺少 message 字段 |
| `401` | `Unauthorized` | 未提供 API Key 或格式不正确 |
| `403` | `Forbidden` | API Key 无效、已禁用或已过期 |
| `404` | `智能体不存在` | URL 中的 agentId 无效 |
| `500` | `Internal Server Error` | 服务器内部错误 |

---

## 4. 调用示例 (Node.js)

```javascript
const axios = require('axios');

async function chatWithAgent() {
  const url = 'https://your-domain.com/api/external/agent/YOUR_AGENT_ID/chat';
  const apiKey = 'YOUR_API_KEY';

  try {
    const response = await axios.post(url, {
      message: '你好',
      stream: false
    }, {
      headers: { 'X-API-Key': apiKey }
    });

    console.log('AI 回复:', response.data.content);
  } catch (error) {
    console.error('调用失败:', error.response.data);
  }
}
```
