# Chart AI 技术开发文档

## 1. 系统架构
项目采用前后端分离架构。

*   **前端 (Frontend)**：基于 Vue 3 + Vite 的单页面应用 (SPA)。
*   **后端 (Backend)**：基于 Node.js + Express 的 RESTful API 服务。
*   **数据库 (Database)**：MongoDB 存储非结构化数据及元数据。

## 2. 技术栈详情

### 2.1 前端
*   **框架**：Vue 3 (Composition API)
*   **构建工具**：Vite
*   **样式**：Tailwind CSS
*   **组件库**：基于 Radix Vue 自定义的 UI 组件（类似于 Shadcn UI）
*   **状态管理**：Vue 响应式 API (ref, reactive) + 自定义 Store
*   **图标**：Lucide Vue Next

### 2.2 后端
*   **运行时**：Node.js
*   **框架**：Express
*   **数据库 ORM**：Mongoose (MongoDB)
*   **认证**：JSON Web Token (JWT)
*   **通信**：HTTP + SSE (用于流式对话)

### 2.3 AI 服务集成
*   **LLM**：DeepSeek API (deepseek-chat, deepseek-reasoner)
*   **ASR/TTS**：阿里云智能语音交互 (SDK/API)
*   **RAG**：
    *   **Embedding**：DeepSeek Embedding 或同类服务。
    *   **Vector Search**：基于 MongoDB 的字段检索或轻量级向量检索方案。

## 3. 核心功能实现方案

### 3.1 智能体对话流程
1.  用户发送消息。
2.  后端根据 `agentId` 获取智能体配置（人设、记忆、知识库 ID）。
3.  **RAG 增强**（若有关联知识库）：
    *   将用户提问转化为向量。
    *   从知识库中检索最相关的 Top-K 文档片段。
    *   将片段作为上下文注入 Prompt。
4.  调用大模型接口，开启流式传输。
5.  后端使用 SSE 将内容实时推送给前端。

### 3.2 知识库处理 (RAG)
*   **上传**：文件保存至 `uploads/knowledge`。
*   **解析**：使用 `pdf-parse` 或 `mammoth` 解析 PDF/Docx。
*   **分片**：按固定长度或语义分段。
*   **存储**：在 `KnowledgeChunk` 集合中存储文本片段及对应的向量 ID。

### 3.3 语音处理
*   **ASR**：前端采集音频流，通过后端转发至阿里云 ASR 接口进行实时转写。
*   **TTS**：后端接收文字，调用阿里云 TTS 生成音频流或链接返回前端播放。

## 4. 数据库模型 (部分)
*   **User**: 用户名、密码（哈希）、角色、API 额度。
*   **Agent**: 名称、人设、关联知识库 ID、模型配置、发布状态。
*   **KnowledgeBase**: 名称、描述、关联文档列表。
*   **KnowledgeChunk**: 文本内容、所属文档、向量标识。
*   **Conversation**: 对话历史、参与用户、使用的智能体。

## 5. 接口规范
*   基础路径：`/api`
*   返回格式：`{ success: boolean, data?: any, message?: string }`
*   认证：请求头携带 `Authorization: Bearer <token>`
