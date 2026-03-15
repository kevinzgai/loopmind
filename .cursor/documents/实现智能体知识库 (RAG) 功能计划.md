## 知识库功能实现方案 (RAG 架构)

为了让智能体能够基于私有文档回答问题，我们将实现一套完整的 RAG (Retrieval-Augmented Generation) 流程。

### 1. 核心模型设计 (Backend)
在 `src/modules/knowledge/models` 下创建以下 Schema：
- **KnowledgeBase**: 存储知识库元数据（名称、描述、所有者、关联智能体）。
- **KnowledgeDocument**: 存储上传的文档信息（文件名、原始路径、解析状态、总字符数）。
- **KnowledgeChunk**: 存储切分后的文本块及其对应的向量 (Vector)。使用 MongoDB 的向量索引进行存储。

### 2. 核心功能模块 (Backend)
- **文件处理服务**: 集成 `multer` 处理上传，使用 `pdf-parse` 和 `mammoth` 解析 PDF/Word 内容。
- **文本切分策略**: 引入 `langchain` 的 `RecursiveCharacterTextSplitter` 进行智能切分，保证上下文语义连贯。
- **向量化集成**: 在 `embeddingService` 中封装阿里云或 OpenAI 的 Embedding 接口，将文本块转换为向量。
- **检索接口**: 实现语义搜索功能，根据用户问题在指定知识库中召回 Top-K 个最相关的文本片段。

### 3. 智能体集成 (RAG 闭环)
- **Schema 联动**: 在 `AgentSchema` 中增加 `knowledgeBaseId` 字段。
- **对话增强**: 优化 `agentChatController`。在发送给 LLM 之前，先进行向量检索，将检索到的“背景知识”注入到 System Prompt 中。
- **Prompt 模板**: 
  ```text
  你是一个拥有专业知识库的助手。请参考以下背景知识来回答用户的问题。
  如果背景知识中没有相关信息，请诚实告知用户，不要编造。
  ---
  背景知识：
  {retrieved_chunks}
  ```

### 4. 前端交互 (Frontend)
- **管理页面**: 新增 `src/views/knowledge/KnowledgeListPage.vue`，支持知识库的增删改查。
- **上传管理**: 实时展示文档解析和向量化进度。
- **智能体关联**: 在 `AgentForm` 中增加“知识库选择”下拉框。

### 5. 准备工作清单 (用户需配合)
- **Embedding 模型**: 确认 AI 提供商（如阿里云）是否开通了 Embedding 模型（如 `text-embedding-v3`）。
- **数据库升级**: 确认 MongoDB 版本支持向量检索（建议使用 Atlas 或 6.0+ 版本）。
- **依赖安装**: 需要执行 `npm install pdf-parse mammoth langchain`。

**是否开始执行第一阶段：后端 Schema 定义与依赖配置？**
