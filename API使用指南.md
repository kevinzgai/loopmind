# API 使用指南

## 📚 目录
1. [聊天 API](#聊天-api)
2. [文字转语音 API](#文字转语音-api)
3. [语音对话 API](#语音对话-api)
4. [Seed-ASR 语音识别](#seed-asr-语音识别)

---

## 💬 聊天 API

### 端点
```
POST /chat
```

### 请求参数
```json
{
  "message": "你好，请介绍一下自己",
  "userId": "user_123",
  "stream": true
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| message | string | 是 | 用户消息内容 |
| userId | string | 是 | 用户唯一标识符 |
| stream | boolean | 否 | 是否启用流式响应（默认 true） |

### 响应
流式响应，逐字返回 AI 回复内容（text/plain）

### 示例代码

#### JavaScript/Fetch
```javascript
const response = await fetch('/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: '你好，请介绍一下自己',
    userId: 'user_123'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  console.log(chunk); // 逐字输出
}
```

#### cURL
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好，请介绍一下自己",
    "userId": "user_123"
  }'
```

---

## 🔊 文字转语音 API

### 端点
```
POST /tts
```

### 请求参数
```json
{
  "text": "你好，我是 AI 助手",
  "voice": "alloy",
  "model": "tts-1",
  "speed": 1.0
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text | string | 是 | 要转换的文字 |
| voice | string | 否 | 语音类型（默认 alloy） |
| model | string | 否 | 模型（tts-1 或 tts-1-hd） |
| speed | number | 否 | 语速（0.25-4.0，默认 1.0） |

### 支持的语音类型
- `alloy` - 中性、平衡的声音
- `echo` - 男性、清晰的声音
- `fable` - 英式、温暖的声音
- `onyx` - 男性、深沉的声音
- `nova` - 女性、活泼的声音
- `shimmer` - 女性、柔和的声音

### 响应
返回 MP3 音频文件（audio/mpeg）

### 示例代码

#### JavaScript/Fetch
```javascript
const response = await fetch('/tts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: '你好，我是 AI 助手',
    voice: 'nova',
    speed: 1.2
  })
});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);

// 播放音频
const audio = new Audio(audioUrl);
audio.play();
```

#### cURL（保存到文件）
```bash
curl -X POST http://localhost:3000/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "你好，我是 AI 助手",
    "voice": "nova",
    "speed": 1.0
  }' \
  --output speech.mp3
```

---

## 🎤 语音对话 API

### 端点 1：返回 JSON
```
POST /voice/chat
```

### 请求参数
```json
{
  "message": "今天天气怎么样？",
  "userId": "user_123",
  "voice": "nova",
  "speed": 1.0
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| message | string | 是 | 用户消息（通常来自 ASR） |
| userId | string | 是 | 用户唯一标识符 |
| voice | string | 否 | TTS 语音类型 |
| speed | number | 否 | TTS 语速 |

### 响应
```json
{
  "success": true,
  "text": "今天天气晴朗，温度适宜...",
  "audio": "base64_encoded_audio_data",
  "audioSize": 12345
}
```

### 示例代码
```javascript
const response = await fetch('/voice/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: '今天天气怎么样？',
    userId: 'user_123',
    voice: 'nova'
  })
});

const result = await response.json();

// 显示文字回复
console.log(result.text);

// 播放音频
const audioBlob = new Blob(
  [Uint8Array.from(atob(result.audio), c => c.charCodeAt(0))],
  { type: 'audio/mpeg' }
);
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
audio.play();
```

---

### 端点 2：返回音频流
```
POST /voice/chat/stream
```

### 请求参数
同上

### 响应
- Content-Type: `audio/mpeg`
- Header: `X-AI-Response` 包含 AI 文字回复（URL 编码）

### 示例代码
```javascript
const response = await fetch('/voice/chat/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: '今天天气怎么样？',
    userId: 'user_123',
    voice: 'nova'
  })
});

// 获取文字回复
const aiText = decodeURIComponent(response.headers.get('X-AI-Response'));
console.log('AI 回复:', aiText);

// 播放音频
const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
audio.play();
```

---

## 🤖 Seed-ASR 语音识别

### WebSocket 端点
```
ws://localhost:3000/seed-asr
```

### 连接流程

1. **建立 WebSocket 连接**
```javascript
const ws = new WebSocket('ws://localhost:3000/seed-asr');

ws.onopen = () => {
  console.log('已连接到 Seed-ASR 服务');
};
```

2. **开始录音**
```javascript
ws.send(JSON.stringify({ type: 'start_recording' }));
```

3. **发送音频数据**
```javascript
// 发送 PCM 16-bit 音频数据（Int16Array）
const audioData = new Int16Array([...]); // 从麦克风获取
ws.send(audioData);
```

4. **停止录音**
```javascript
ws.send(JSON.stringify({ type: 'stop_recording' }));
```

5. **接收识别结果**
```javascript
ws.onmessage = (event) => {
  const result = JSON.parse(event.data);
  
  switch (result.type) {
    case 'recording_started':
      console.log('开始录音');
      break;
      
    case 'recording_stopped':
      console.log('正在识别...');
      break;
      
    case 'recognition_result':
      console.log('识别结果:', result.data);
      break;
      
    case 'error':
      console.error('错误:', result.message);
      break;
  }
};
```

### 完整示例
```javascript
class SeedASRClient {
  constructor() {
    this.ws = null;
    this.audioContext = null;
    this.mediaStream = null;
  }

  async connect() {
    // 获取麦克风权限
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // 创建音频上下文
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    
    // 连接 WebSocket
    this.ws = new WebSocket('ws://localhost:3000/seed-asr');
    
    this.ws.onopen = () => {
      console.log('已连接');
    };
    
    this.ws.onmessage = (event) => {
      const result = JSON.parse(event.data);
      this.handleMessage(result);
    };
  }

  startRecording() {
    if (!this.ws) return;
    
    // 发送开始录音消息
    this.ws.send(JSON.stringify({ type: 'start_recording' }));
    
    // 设置音频处理
    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      const audioData = e.inputBuffer.getChannelData(0);
      const pcm16 = this.float32ToInt16(audioData);
      this.ws.send(pcm16);
    };
    
    source.connect(processor);
    processor.connect(this.audioContext.destination);
  }

  stopRecording() {
    if (!this.ws) return;
    this.ws.send(JSON.stringify({ type: 'stop_recording' }));
  }

  float32ToInt16(float32Data) {
    const int16Data = new Int16Array(float32Data.length);
    for (let i = 0; i < float32Data.length; i++) {
      const sample = Math.max(-1, Math.min(1, float32Data[i]));
      int16Data[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    return int16Data;
  }

  handleMessage(result) {
    switch (result.type) {
      case 'recognition_result':
        console.log('识别结果:', result.data);
        break;
      case 'error':
        console.error('错误:', result.message);
        break;
    }
  }
}

// 使用示例
const client = new SeedASRClient();
await client.connect();
client.startRecording();
// ... 说话 ...
client.stopRecording();
```

---

## 🔧 获取支持的语音列表

### 端点
```
GET /tts/voices
```

### 响应
```json
{
  "voices": [
    {
      "id": "alloy",
      "name": "Alloy",
      "description": "中性、平衡的声音"
    },
    {
      "id": "echo",
      "name": "Echo",
      "description": "男性、清晰的声音"
    }
    // ... 更多语音
  ]
}
```

### 示例代码
```javascript
const response = await fetch('/tts/voices');
const data = await response.json();
console.log('支持的语音:', data.voices);
```

---

## 🚀 完整语音对话流程示例

```javascript
// 1. 连接 Seed-ASR
const asrClient = new SeedASRClient();
await asrClient.connect();

// 2. 开始录音
asrClient.startRecording();

// 3. 用户说话...

// 4. 停止录音并获取识别结果
asrClient.stopRecording();

asrClient.onResult = async (recognizedText) => {
  console.log('识别到:', recognizedText);
  
  // 5. 发送到语音对话 API
  const response = await fetch('/voice/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: recognizedText,
      userId: 'user_123',
      voice: 'nova'
    })
  });
  
  // 6. 获取 AI 回复文字
  const aiText = decodeURIComponent(response.headers.get('X-AI-Response'));
  console.log('AI 回复:', aiText);
  
  // 7. 播放 AI 语音回复
  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
};
```

---

## ⚙️ 环境配置

确保 `.env` 文件包含以下配置：

```env
# 服务器配置
PORT=3000

# AI 服务配置
API_KEY=your_deepseek_api_key
BASE_URL=https://api.deepseek.com
MODEL=deepseek-chat

# Seed-ASR 配置
SEED_ASR_APPID=your_seed_asr_appid
SEED_ASR_API_KEY=your_seed_asr_api_key
SEED_ASR_API_SECRET=your_seed_asr_api_secret
SEED_ASR_API_URL=https://openspeech.bytedance.com/api/v3/auc/bigmodel/submit
SEED_ASR_RESOURCE_ID=volc.seedasr.auc
```

---

## 📝 注意事项

1. **API Key 安全**
   - 不要在前端代码中暴露 API Key
   - 使用环境变量管理敏感信息

2. **音频格式**
   - TTS 输出格式：MP3
   - ASR 输入格式：PCM 16-bit, 16kHz, 单声道

3. **错误处理**
   - 所有 API 都应该添加错误处理
   - 检查响应状态码

4. **性能优化**
   - 对于长文本，考虑分段处理
   - 使用流式响应提升用户体验

5. **浏览器兼容性**
   - 确保浏览器支持 MediaRecorder API
   - 确保浏览器支持 WebSocket

---

## 🐛 常见问题

### 1. TTS 转换失败
- 检查 API_KEY 是否正确
- 检查网络连接
- 检查文字长度是否超限

### 2. ASR 识别不准确
- 确保环境安静
- 检查麦克风权限
- 确保音频格式正确

### 3. WebSocket 连接失败
- 检查服务器是否运行
- 检查端口是否被占用
- 检查防火墙设置

---

## 📞 技术支持

如有问题，请查看：
- 项目 README.md
- 功能完善计划.md
- 需求文档与技术文档.md

祝使用愉快！🎉
