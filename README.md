# 🧠 LoopMind

一个集成了 AI 对话、语音识别（ASR）、语音合成（TTS）以及 **智能体知识库（RAG）** 的现代化 Web 应用。

> 路线图：Agent Loop 自主任务循环 → 任务分解（Task Decomposition）→ 知识库高级应用（RAG 增强）。

## ✨ 功能特性

### 核心功能
- 💬 **AI 智能对话**
  - 支持 DeepSeek 和通义千问两种 AI 模型
  - 流式响应，实时显示 AI 回复
  - **智能对话模式**：支持多轮对话历史记忆

- 🧠 **智能体与知识库 (RAG)**
  - **自定义智能体**：用户可创建具有特定人格、指令和音色的 AI 助手
  - **知识库挂载**：支持上传 PDF、Word、TXT 等文档，通过向量搜索（LanceDB）实现精准问答
  - **智能检索**：对话过程中自动判断是否需要调用知识库，过滤闲聊，节省成本
  - **智能体广场**：浏览并使用他人发布的公开智能体

- 🎤 **语音交互（ASR & TTS）**
  - **实时识别**：使用阿里云流式 ASR，边说边显
  - **流畅播报**：阿里云流式 TTS，150+ 种音色可选，语速音量可调
  - **豆包风格 UI**：极致的移动端交互体验，支持长按录音

- 👤 **个人中心与管理**
  - **用户认证**：完善的登录、注册、JWT 认证体系
  - **个人中心**：管理个人资料（头像、简介）、查看资产统计（智能体、知识库数量）
  - **管理员后台**：系统配置管理、运行日志实时监控

- � **嵌入式插件 (Widget)**
  - 支持通过一行 `<script>` 脚本将智能体嵌入到任何第三方网站

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3 + Vite
- **UI**: Tailwind CSS + shadcn-vue
- **状态管理**: Pinia / Composition API
- **组件库**: AI UI Elements (自研)

### 后端
- **运行时**: Node.js + Express
- **数据库**: MongoDB (用户、智能体、会话) + LanceDB (向量知识库)
- **实时通信**: WebSocket (ASR/TTS 流式传输)
- **AI/语音**: OpenAI SDK + 阿里云 NLS

## 📦 项目结构

```
.
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── modules/
│   │   │   ├── agent/       # 智能体模块 (控制器、模型、服务)
│   │   │   └── knowledge/   # 知识库模块 (向量检索、文档处理)
│   │   ├── shared/          # 公共中间件与工具
│   │   ├── app.js           # Express 应用配置
│   │   └── server.js        # 服务器入口
│   ├── data/                # 向量数据库存储 (LanceDB)
│   ├── uploads/             # 文档上传存储
│   └── tests/               # 自动化测试 (Jest/Supertest)
│
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # UI 组件
│   │   ├── stores/         # 状态管理
│   │   ├── views/          # 页面视图 (个人中心、智能体、聊天等)
│   │   └── services/       # 接口服务
│   └── public/
│       └── widget.js       # 智能体嵌入脚本
│
├── docs/                   # 详细开发与配置文档
└── TODO.md                 # 路线图与进度追踪
```

## 🚀 快速开始

### 前置要求
- Node.js >= 18
- pnpm >= 8
- MongoDB 实例
- 阿里云 AccessKey (ASR/TTS 权限)

### 1. 配置环境变量
复制根目录及 backend 目录下的 `.env.example` 并重命名为 `.env`，填入相关密钥。

### 2. 安装与运行
```bash
# 安装所有依赖
pnpm install

# 启动开发服务器 (前端 + 后端)
pnpm dev
```

## � API 与文档
- 详细配置指南：`docs/01-配置指南/`
- API 使用说明：`docs/02-功能说明/`
- 开发调试记录：`docs/04-调试记录/`

## 📄 许可证
MIT License

---
**享受与 Chart AI 的智能对话体验！** 🎉
