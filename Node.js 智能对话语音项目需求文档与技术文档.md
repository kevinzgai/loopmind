# Node.js 智能对话语音项目需求文档与技术文档

# 第一部分：需求文档

## 1. 项目概述

本项目基于 Node.js 开发，核心目标是构建一个具备 AI 智能对话、语音交互、智能体自主决策及联网查资料能力的应用。项目采用 DeepSeek 大模型作为核心 AI 能力支撑，用户可通过文字或语音方式与系统交互，系统能根据用户需求自主判断是否需要联网获取最新信息，最终以文字或语音形式反馈结果。

## 2. 核心功能需求

### 2.1 AI 智能对话功能

- 支持用户文字输入，系统通过 DeepSeek 模型生成准确、简洁的文字回复；

- 对话逻辑需支持上下文关联，确保多轮对话的连贯性；

- 支持自定义对话助手角色（如通用助手、技术顾问），可配置系统提示词。

### 2.2 语音交互功能

- 语音输入：支持用户上传语音文件（如 mp3、wav、m4a 格式），系统将语音转文字（ASR）；

- 语音输出：系统将 AI 生成的文字回复转为自然、流畅的语音文件（TTS），支持保存为常用音频格式；

- 音频格式兼容：支持自动转换不兼容的音频格式，确保语音转文字功能正常运行。

### 2.3 智能体与联网查资料功能

- 智能决策：系统能自主判断用户问题是否需要最新信息支撑（如时效性问题、动态数据查询）；

- 联网搜索：当需要最新信息时，自动调用联网搜索工具获取数据，并结合 DeepSeek 模型整合分析后给出答案；

- 支持对搜索结果的简单解析（如网页文本提取），排除无效信息。

### 2.4 服务封装与扩展功能

- 提供 HTTP API 接口，支持前端或其他客户端调用核心功能（对话、语音转换）；

- 支持对话记录的存储（可选），便于后续查询和分析；

- 开发环境支持热重载，提升开发效率。

## 3. 非功能需求

- 安全性：API Key 需加密存储，禁止硬编码；接口调用需简单鉴权（可选）；

- 性能：单轮文字对话响应时间≤3秒，语音转文字响应时间≤10秒（取决于音频长度）；

- 兼容性：支持 Node.js 18+ 版本，兼容 Windows、macOS、Linux 操作系统；

- 可扩展性：技术选型需考虑后续功能扩展（如本地部署模型、多模型切换）。

## 4. 前置条件与依赖

- 已获取 DeepSeek API Key，且 Key 处于有效状态（已绑定手机号、有可用额度）；

- 若使用第三方语音服务（如 Whisper、百度 TTS），需提前获取对应服务的 API Key；

- 若使用联网搜索功能，需提前获取 SerpAPI 或其他搜索服务的 API Key。

# 第二部分：技术文档

## 1. 技术栈选型

### 1.1 基础运行与工程化

- 运行环境：Node.js 18+（支持 ES 模块、新 API 及异步处理）；

- 包管理工具：npm / yarn / pnpm（推荐 pnpm，效率更高）；

- 工程化工具：
        

    - TypeScript（可选，强类型校验，减少开发阶段 Bug）；

    - ESLint + Prettier（规范代码风格，统一编码格式）；

    - nodemon（开发环境热重载，无需手动重启服务）；

    - dotenv（管理环境变量，安全存储 API Key 等敏感信息）。

### 1.2 核心 AI 能力（DeepSeek 集成）

- 核心依赖：@deepseekai/deepseek-sdk（DeepSeek 官方 Node.js SDK，简化 API 调用）；

- 备选方案：axios（手动调用 DeepSeek REST API，适用于需要自定义请求的场景）；

- 支持模型：deepseek-chat（通用对话模型，核心推荐）、deepseek-coder（代码相关对话，可选）。

### 1.3 智能体与联网查资料

- 智能体框架：langchain（Node.js 版，封装智能体决策逻辑、工具调用流程，支持与 DeepSeek 集成）；

- 联网搜索工具：SerpAPI（调用 Google 搜索，支持中文地区配置）、bing-api（必应搜索，备选）；

- 数据解析工具：cheerio（解析网页 HTML，提取有效文本）、pdf-parse（可选，解析 PDF 文档，扩展资料获取范围）。

### 1.4 语音交互模块

- 语音转文字（ASR）：
        

    - 核心方案：OpenAI Whisper（通过 whisper-node 封装，支持中文识别，准确率高）；

    - 备选方案：百度语音识别、阿里云 ASR（国内服务，网络稳定性好，需额外获取 API Key）。

- 文字转语音（TTS）：
        

    - 核心方案：百度 TTS / 阿里云 TTS（国内服务，支持中文多音色，网络稳定）；

    - 备选方案：ElevenLabs（拟真度高，支持多语言，需科学上网）、OpenAI TTS（需额外获取 OpenAI API Key）。

- 音频处理：fluent-ffmpeg（音频格式转换，如 mp4 转 wav、调整音频参数）、wavefile（音频文件细节处理，可选）。

### 1.5 服务与交互层

- API 服务框架：Express（轻量、易用，快速搭建 HTTP 接口）；

- 实时通信（可选）：ws（WebSocket 库，支持实时语音/文字对话，适用于网页端实时交互场景）；

- 数据库（可选）：MongoDB（存储对话记录，文档型数据库，适配非结构化数据）、Redis（缓存会话状态，提升响应速度）。

## 2. 核心模块实现方案

### 2.1 环境配置与初始化

#### 2.1.1 项目初始化

```bash

# 1. 创建项目目录并初始化
mkdir node-ai-chat && cd node-ai-chat
npm init -y

# 2. 安装核心依赖
npm install @deepseekai/deepseek-sdk langchain axios express
npm install whisper-node fluent-ffmpeg

# 3. 安装开发依赖
npm install typescript @types/node nodemon dotenv eslint prettier --save-dev
```

#### 2.1.2 环境变量配置

在项目根目录创建 .env 文件，存储敏感信息：

```env

# .env 文件
# DeepSeek 配置
DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# 搜索工具配置
SERPAPI_API_KEY=your-serpapi-key

# 语音服务配置（Whisper/百度TTS等）
OPENAI_API_KEY=your-openai-key（Whisper用）
BAIDU_TTS_API_KEY=your-baidu-tts-key
BAIDU_TTS_SECRET_KEY=your-baidu-tts-secret-key

# 服务配置
PORT=3000（Express服务端口）
```

在代码中加载环境变量：

```javascript

// config.js
require("dotenv").config();

module.exports = {
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL,
    timeout: 30000
  },
  serpapi: {
    apiKey: process.env.SERPAPI_API_KEY
  },
  server: {
    port: process.env.PORT || 3000
  }
};
```

### 2.2 DeepSeek 核心对话模块实现

```javascript

// src/services/deepseekService.js
const { Deepseek } = require("@deepseekai/deepseek-sdk");
const config = require("../../config");

// 初始化 DeepSeek 客户端
const deepseekClient = new Deepseek({
  apiKey: config.deepseek.apiKey,
  baseURL: config.deepseek.baseURL,
  timeout: config.deepseek.timeout,
  // 国内访问可选配置代理
  // proxy: { host: "your-proxy-ip", port: your-proxy-port }
});

/**
 * 基础对话函数
 * @param {string} userInput - 用户输入文本
 * @param {Array} history - 对话历史（上下文关联用）
 * @returns {Promise<string>} AI 回复文本
 */
async function deepseekChat(userInput, history = []) {
  try {
    // 构造对话消息（包含历史上下文）
    const messages = [
      { role: "system", content: "你是一个智能助手，回答准确、简洁，需要最新信息时请告知需联网查询" },
      ...history,
      { role: "user", content: userInput }
    ];

    const response = await deepseekClient.chat.completions.create({
      model: "deepseek-chat",
      messages,
      temperature: 0.7, // 随机性：0.5-0.9 为宜
      max_tokens: 2000, // 最大回复长度（deepseek-chat 支持最大 8192）
      stream: false // 非流式响应（简单场景用）
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek 调用失败：", error.message);
    throw new Error(`AI 对话服务异常：${error.message}`);
  }
}

module.exports = { deepseekChat };
```

### 2.3 智能体 + 联网查资料模块实现

```javascript

// src/services/agentService.js
const { SerpAPI } = require("langchain/tools");
const { AgentExecutor, createOpenAIFunctionsAgent } = require("langchain/agents");
const { ChatPromptTemplate } = require("langchain/prompts");
const { LLM } = require("langchain/llms/base");
const { Deepseek } = require("@deepseekai/deepseek-sdk");
const config = require("../../config");

// 1. 自定义 DeepSeek LLM 封装（适配 LangChain）
class DeepseekLLM extends LLM {
  constructor() {
    super();
    this.deepseekClient = new Deepseek({
      apiKey: config.deepseek.apiKey,
      baseURL: config.deepseek.baseURL
    });
  }

  // 核心调用方法
  async _call(prompt) {
    const response = await this.deepseekClient.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });
    return response.choices[0].message.content;
  }

  // 定义模型类型
  _llmType() {
    return "deepseek";
  }
}

// 2. 初始化智能体（集成搜索工具）
async function initAgent() {
  // 初始化 LLM
  const llm = new DeepseekLLM();

  // 初始化搜索工具（SerpAPI，中文配置）
  const searchTool = new SerpAPI(config.serpapi.apiKey, {
    hl: "zh-CN", // 语言：中文
    gl: "cn"     // 地区：中国
  });

  // 定义智能体提示词
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "你是智能助手，当用户问题需要最新、实时或动态信息时，必须先调用搜索工具获取数据，再整理回答；无需搜索时直接回答。"],
    ["user", "{input}"],
    ["placeholder", "{agent_scratchpad}"] // 智能体思考过程（内部使用）
  ]);

  // 创建智能体和执行器
  const agent = await createOpenAIFunctionsAgent({ llm, tools: [searchTool], prompt });
  return AgentExecutor.fromAgentAndTools({ agent, tools: [searchTool] });
}

/**
 * 智能体处理用户请求（含联网能力）
 * @param {string} userInput - 用户输入文本
 * @returns {Promise<string>} 整合搜索结果后的 AI 回复
 */
async function runAgent(userInput) {
  const agentExecutor = await initAgent();
  const result = await agentExecutor.invoke({ input: userInput });
  return result.output;
}

module.exports = { runAgent };
```

### 2.4 语音交互模块实现

```javascript

// src/services/voiceService.js
const fs = require("fs");
const { OpenAI } = require("openai"); // Whisper 依赖
const ffmpeg = require("fluent-ffmpeg");
const config = require("../../config");

// 初始化 Whisper 客户端（语音转文字）
const openaiClient = new OpenAI({ apiKey: config.openai.apiKey });

/**
 * 语音转文字（ASR）- 基于 Whisper
 * @param {string} audioPath - 输入音频文件路径
 * @returns {Promise<string>} 转换后的文字
 */
async function speechToText(audioPath) {
  try {
    // 校验文件是否存在
    if (!fs.existsSync(audioPath)) {
      throw new Error(`音频文件不存在：${audioPath}`);
    }

    const transcription = await openaiClient.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
      language: "zh", // 强制中文识别，提升准确率
      response_format: "text"
    });

    return transcription;
  } catch (error) {
    console.error("语音转文字失败：", error.message);
    throw new Error(`语音转文字异常：${error.message}`);
  }
}

/**
 * 音频格式转换（适配 Whisper 要求）
 * @param {string} inputPath - 输入音频路径
 * @param {string} outputPath - 输出音频路径（如 .wav）
 * @returns {Promise<void>}
 */
function convertAudioFormat(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat(outputPath.split(".").pop())
      .on("end", () => resolve())
      .on("error", (err) => reject(new Error(`格式转换失败：${err.message}`)))
      .save(outputPath);
  });
}

/**
 * 文字转语音（TTS）- 基于百度 TTS（示例）
 * 注：需提前安装百度语音 SDK：npm install baidu-aip-sdk
 */
const AipSpeechClient = require("baidu-aip-sdk").speech;
const baiduTtsClient = new AipSpeechClient(
  "your-app-id",
  config.baiduTts.apiKey,
  config.baiduTts.secretKey
);

async function textToSpeech(text, outputPath = "./output.mp3") {
  try {
    const result = await new Promise((resolve, reject) => {
      baiduTtsClient.text2audio(text, {
        spd: 5, // 语速（0-9）
        pit: 5, // 音调（0-9）
        vol: 7, // 音量（0-15）
        per: 0  // 发音人（0：女声，1：男声，3：情感男声）
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    // 保存音频文件
    fs.writeFileSync(outputPath, result);
    console.log(`语音文件已保存：${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("文字转语音失败：", error.message);
    throw new Error(`文字转语音异常：${error.message}`);
  }
}

module.exports = { speechToText, convertAudioFormat, textToSpeech };
```

### 2.5 API 服务封装（Express）

```javascript

// src/server.js
const express = require("express");
const cors = require("cors"); // 解决跨域（可选，前端调用时需要）
const config = require("../config");
const { deepseekChat } = require("./services/deepseekService");
const { runAgent } = require("./services/agentService");
const { speechToText, convertAudioFormat, textToSpeech } = require("./services/voiceService");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. 基础文字对话接口
app.post("/api/chat", async (req, res) => {
  try {
    const { input, history = [] } = req.body;
    if (!input) {
      return res.status(400).json({ success: false, message: "请输入对话内容" });
    }
    const answer = await deepseekChat(input, history);
    res.json({ success: true, answer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. 智能体+联网查资料接口
app.post("/api/agent/chat", async (req, res) => {
  try {
    const { input } = req.body;
    if (!input) {
      return res.status(400).json({ success: false, message: "请输入查询内容" });
    }
    const answer = await runAgent(input);
    res.json({ success: true, answer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. 语音转文字接口（简化版，实际需处理文件上传）
app.post("/api/speech/toText", async (req, res) => {
  try {
    const { audioPath } = req.body;
    if (!audioPath) {
      return res.status(400).json({ success: false, message: "请传入音频文件路径" });
    }
    // 若格式不兼容，先转换（示例：转为 wav）
    const wavPath = audioPath.replace(/\.\w+$/, ".wav");
    await convertAudioFormat(audioPath, wavPath);
    const text = await speechToText(wavPath);
    res.json({ success: true, text });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. 文字转语音接口
app.post("/api/text/toSpeech", async (req, res) => {
  try {
    const { text, outputPath } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "请输入需要转换的文字" });
    }
    const audioPath = await textToSpeech(text, outputPath);
    res.json({ success: true, audioPath });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 启动服务
app.listen(config.server.port, () => {
  console.log(`服务已启动，运行在 http://localhost:${config.server.port}`);
});
```

## 3. 关键注意事项

### 3.1 网络配置

- 国内服务器调用 DeepSeek API 时，若出现连接超时，需配置代理（在 DeepSeek 客户端初始化时添加 proxy 参数）；

- SerpAPI 调用 Google 搜索时，地区配置为 cn（gl: "cn"），确保搜索结果符合中文用户需求。

### 3.2 API Key 管理

- 所有 API Key 必须存储在 .env 文件中，通过 dotenv 加载，禁止硬编码到代码中；

- 定期检查 API Key 有效性和额度，避免因额度耗尽导致服务异常；

- 生产环境建议对 API 接口添加鉴权（如 API 密钥验证），防止 Key 泄露后被恶意调用。

### 3.3 音频处理

- Whisper 对音频格式有一定要求，优先使用 wav、mp3 格式，其他格式需通过 fluent-ffmpeg 转换；

- 处理大音频文件时，建议添加进度提示和超时控制，提升用户体验。

### 3.4 错误处理

- 所有第三方 API 调用（DeepSeek、Whisper、SerpAPI 等）必须添加异常捕获，返回友好的错误提示；

- 针对常见错误场景（如 Key 过期、网络异常、文件不存在），添加特定的错误判断和处理逻辑。

## 4. 部署与测试建议

### 4.1 测试流程

- 单元测试：分别测试各核心模块（DeepSeek 对话、语音转文字、智能体搜索）是否正常工作；

- 集成测试：测试完整流程（语音输入→转文字→智能体处理→AI 回复→转语音）是否连贯；

- 压力测试：针对 API 接口，测试并发调用时的响应时间和稳定性（开发环境可使用 Postman 或 JMeter）。

### 4.2 部署建议

- 开发环境：使用 nodemon 实现热重载，提升开发效率；

- 生产环境：
        

    - 使用 PM2 管理 Node.js 进程（自动重启、负载均衡）；

    - 配置环境变量时，避免将 .env 文件提交到代码仓库，生产环境通过服务器环境变量配置；

    - 根据业务需求选择合适的服务器配置，确保 CPU 和内存满足音频处理和 AI 调用需求。
> （注：文档部分内容可能由 AI 生成）