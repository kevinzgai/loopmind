# Seed-ASR Node.js 后端配置与运行指南

这里为你提供一套**可直接运行的 Node.js 后端 Seed-ASR 语音交互 Demo**，包含完整的 WebSocket 服务、Seed-ASR 鉴权、音频转发、DeepSeek 对话整合等核心逻辑，你只需替换配置即可快速验证语音交互全链路。

### 一、Demo 项目结构

```Plain Text

```

### 二、步骤 1：配置依赖与环境变量

#### 1.1 package.json

```JSON

```

#### 1.2 .env 文件（核心配置，替换为你的密钥）

```Plain Text

```

### 三、步骤 2：核心代码实现

#### 2.1 鉴权工具（src/utils/auth.js）

```JavaScript

```

#### 2.2 DeepSeek 对话服务（src/services/chat.js）

```JavaScript

```

#### 2.3 Seed-ASR 核心逻辑（src/services/asr.js）

```JavaScript

```

#### 2.4 主服务（src/server.js）

```JavaScript

```

#### 2.5 启动入口（start.js）

```JavaScript

```

### 四、运行与测试

#### 4.1 安装依赖

```Bash

```

#### 4.2 启动服务

```Bash

```

启动成功后会输出：

```Plain Text

```

#### 4.3 验证服务

- 访问健康检查接口：`http://localhost:3000/health`，返回 `status: ok` 即服务正常；

- 前端可通过 `ws://localhost:3000/seed-asr` 连接 WS，上传 16kHz 单声道 PCM/WAV 音频流，即可接收识别结果和 AI 回复。

### 五、核心注意事项

1. **音频格式必须严格匹配**：

Seed-ASR 仅支持 **16kHz 采样率、单声道、16bit 位深、PCM/WAV 格式**，前端采集时需强制配置，否则识别失败；

1. **密钥安全**：

`.env` 文件切勿提交到代码仓库，生产环境建议通过服务器环境变量配置；

1. **网络要求**：

国内服务器若连接 Seed-ASR 云端超时，需配置代理（在 `new WebSocket` 时添加 `agent` 参数）；

1. **调试技巧**：

可在 `asr.js` 中添加日志打印音频数据大小、识别结果，方便定位问题。

### 六、与前端联调说明

前端需实现：

1. 申请麦克风权限，采集 16kHz 单声道音频；

2. 连接 `ws://localhost:3000/seed-asr`；

3. 流式上传音频二进制数据；

4. 监听 WS 消息，接收 `partial`（实时结果）、`final`（最终结果）、`answer`（AI 回复）。

如果需要配套的 **前端 Vue 测试页面代码**，我可以补充，让你快速完成全链路测试。
> （注：文档部分内容可能由 AI 生成）