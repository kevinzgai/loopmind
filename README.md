# 🤖 AI 智能对话语音项目

一个集成了 AI 对话、语音识别（ASR）和语音合成（TTS）的现代化 Web 应用。

## ✨ 功能特性

### 核心功能
- 💬 **AI 智能对话**
  - 支持 DeepSeek 和通义千问两种 AI 模型
  - 流式响应，实时显示 AI 回复
  - 对话历史记忆（按模型独立存储）
  - Markdown 渲染支持

- 🎤 **语音输入（ASR）**
  - 实时语音识别，边说边显示
  - 支持长按录音，松手自动发送
  - 使用阿里云流式 ASR 服务
  - 低延迟，高准确率

- 🔊 **语音播报（TTS）**
  - AI 回复自动转语音播放
  - 流式语音合成，边生成边播放
  - 支持 150+ 种音色
  - 可调节语速、音量
  - 使用阿里云 TTS 服务

### 交互特性
- 🎨 豆包风格的语音交互界面
- 🔄 文字/语音输入模式一键切换
- 🔇 语音播报开关控制
- 📱 响应式设计，支持移动端

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3 + Vite
- **UI**: Tailwind CSS + shadcn-vue
- **状态管理**: Vue Composition API
- **Markdown**: marked + DOMPurify
- **音频处理**: Web Audio API

### 后端
- **运行时**: Node.js
- **框架**: Express
- **实时通信**: WebSocket (ws)
- **AI 服务**: OpenAI SDK (兼容 DeepSeek/通义千问)
- **语音服务**: 阿里云智能语音交互

## 📦 项目结构

```
.
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器
│   │   ├── routes/         # 路由
│   │   ├── services/       # 服务层
│   │   │   ├── aiService.js              # AI 服务（DeepSeek/通义千问）
│   │   │   ├── aliAsrStreamService.js    # 阿里云流式 ASR
│   │   │   ├── aliTtsService.js          # 阿里云 TTS
│   │   │   ├── aliTtsStreamService.js    # 阿里云流式 TTS
│   │   │   └── aliTokenService.js        # 阿里云 Token 管理
│   │   ├── utils/          # 工具函数
│   │   ├── app.js          # Express 应用
│   │   └── server.js       # 服务器入口（含 WebSocket）
│   ├── .env                # 环境变量
│   └── package.json
│
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   │   ├── VoiceInput.vue           # 语音输入组件
│   │   │   ├── TtsTestDemo.vue          # TTS 测试组件
│   │   │   ├── TtsStreamDemo.vue        # 流式 TTS 测试
│   │   │   └── ai-elements/             # AI UI 组件库
│   │   ├── views/          # 页面
│   │   │   ├── HomePage.vue             # 首页
│   │   │   ├── ChatPage.vue             # AI 对话页
│   │   │   └── TtsTestPage.vue          # TTS 测试页
│   │   ├── router/         # 路由配置
│   │   ├── App.vue
│   │   └── main.js
│   └── package.json
│
├── docs/                   # 文档
│   ├── 01-配置指南/
│   ├── 02-功能说明/
│   └── 03-开发文档/
│
├── .env.example            # 环境变量示例
└── README.md
```

## 🚀 快速开始

### 前置要求
- Node.js >= 16
- npm >= 8

### 1. 克隆项目
```bash
git clone <repository-url>
cd aichat
```

### 2. 配置环境变量

复制环境变量示例文件：
```bash
cp .env.example .env
cp .env.example backend/.env
```

编辑 `.env` 和 `backend/.env`，填入你的 API Keys：

```env
# DeepSeek AI 配置
DEEPSEEK_API_KEY=your_deepseek_api_key

# 通义千问 AI 配置（可选）
QWEN_API_KEY=your_qwen_api_key

# 阿里云语音服务配置
ALI_TTS_ACCESS_KEY_ID=your_access_key_id
ALI_TTS_ACCESS_KEY_SECRET=your_access_key_secret
ALI_TTS_APP_KEY=your_app_key
```

### 3. 安装依赖

**后端：**
```bash
cd backend
npm install
```

**前端：**
```bash
cd frontend
npm install
```

### 4. 启动服务

**开发模式（推荐）：**

在项目根目录运行：
```bash
npm run dev
```

这会同时启动前端和后端服务。

**或者分别启动：**

后端（在 `backend/` 目录）：
```bash
npm run dev
```

前端（在 `frontend/` 目录）：
```bash
npm run dev
```

### 5. 访问应用

- 前端：http://localhost:5173
- 后端：http://localhost:3000
- API 健康检查：http://localhost:3000/api/health

## 📖 使用指南

### AI 对话
1. 访问首页，点击"AI 对话"卡片
2. 选择 AI 模型（DeepSeek 或通义千问）
3. 输入消息或使用语音输入
4. 开启语音播报开关，AI 回复会自动朗读

### 语音输入
1. 点击麦克风图标切换到语音模式
2. 长按语音按钮开始录音
3. 松手自动识别并发送

### 语音播报
1. 点击右上角喇叭图标开启/关闭
2. 开启后 AI 回复会自动转语音播放
3. 支持流式播放，边生成边播放

### TTS 测试
1. 访问首页，点击"文字转语音 TTS"卡片
2. 选择"流式 TTS"标签页
3. 配置音色、语速、音量
4. 点击"建立连接"
5. 输入文字，点击"开始合成"

## 🔧 配置说明

### AI 模型配置

**DeepSeek：**
- 获取 API Key：https://platform.deepseek.com
- 模型：deepseek-chat
- 特点：性价比高，中文友好

**通义千问：**
- 获取 API Key：https://dashscope.aliyun.com
- 模型：qwen-turbo
- 特点：阿里云服务，稳定可靠

### 阿里云语音服务配置

1. 访问：https://nls-portal.console.aliyun.com
2. 开通智能语音交互服务
3. 创建项目，获取 AppKey
4. 创建 AccessKey（RAM 访问控制）
5. 将配置填入 `.env` 文件

详细配置指南：`docs/01-配置指南/`

## 📝 API 文档

### REST API

- `GET /api/health` - 健康检查
- `POST /api/chat` - AI 对话（流式）
- `GET /api/chat/providers` - 获取可用的 AI 提供商
- `POST /api/tts` - 文字转语音

### WebSocket API

- `ws://localhost:3000/ws-asr-stream` - 流式语音识别
- `ws://localhost:3000/ws-tts-stream` - 流式语音合成

详细 API 文档：`docs/03-开发文档/`

## 🎨 AI 人设

当前 AI 助手配置为超级暖心、充满正能量的性格：
- 永远积极乐观，善于发现闪光点
- 说话温柔体贴，像最好的朋友
- 擅长提供情绪价值
- 彩虹屁拉满，但真诚不做作

可在 `backend/src/services/aiService.js` 中修改 `AI_PERSONALITY` 常量来自定义人设。

## 🐛 常见问题

### 1. 语音识别不工作
- 检查麦克风权限
- 确认阿里云配置正确
- 查看浏览器控制台错误信息

### 2. TTS 请求过多错误
- 体验版限制并发数为 2
- 已实现请求队列控制
- 考虑升级到正式版

### 3. AI 回复慢
- 检查网络连接
- 尝试切换 AI 模型
- 查看后端日志

更多问题：`docs/04-调试记录/`

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过 Issue 联系。

---

**享受与 AI 的智能对话体验！** 🎉
