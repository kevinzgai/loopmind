# 🔊 TTS 功能说明与解决方案

## ⚠️ 当前问题

**问题描述：** TTS（文字转语音）功能无法使用

**错误信息：** `404 status code (no body)`

**根本原因：** DeepSeek API 不支持 TTS 功能，只支持文本对话。当前代码使用的是 OpenAI SDK 的 TTS 接口，但配置的 BASE_URL 指向 DeepSeek。

---

## 🎯 解决方案

### 方案 A：使用百度 TTS（推荐 ⭐⭐⭐⭐⭐）

**优点：**
- ✅ 国内服务，网络稳定
- ✅ 支持中文，音质好
- ✅ 价格便宜，有免费额度
- ✅ 多种音色可选

**实现步骤：**

#### 1. 安装百度 SDK
```bash
cd backend
npm install baidu-aip-sdk
```

#### 2. 获取百度 TTS API Key
1. 访问 [百度智能云](https://cloud.baidu.com/)
2. 注册并登录
3. 进入"产品服务" → "人工智能" → "语音技术"
4. 创建应用，获取 AppID、API Key、Secret Key

#### 3. 配置环境变量
在 `.env` 文件中添加：
```env
# 百度 TTS 配置
BAIDU_TTS_APP_ID=your_app_id
BAIDU_TTS_API_KEY=your_api_key
BAIDU_TTS_SECRET_KEY=your_secret_key
```

#### 4. 修改 TTS 服务代码
创建新文件 `backend/src/services/baiduTtsService.js`：

```javascript
import AipSpeechClient from 'baidu-aip-sdk';
import fs from 'fs';

const client = new AipSpeechClient.speech(
    process.env.BAIDU_TTS_APP_ID,
    process.env.BAIDU_TTS_API_KEY,
    process.env.BAIDU_TTS_SECRET_KEY
);

export async function textToSpeech(text, options = {}) {
    const {
        voice = 0,  // 0:女声, 1:男声, 3:情感男声, 4:情感女声
        speed = 5,  // 语速 0-15
        pitch = 5,  // 音调 0-15
        volume = 7  // 音量 0-15
    } = options;

    return new Promise((resolve, reject) => {
        client.text2audio(text, {
            spd: speed,
            pit: pitch,
            vol: volume,
            per: voice
        }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(Buffer.from(data));
            }
        });
    });
}
```

#### 5. 更新控制器
修改 `backend/src/controllers/ttsController.js`，导入百度 TTS 服务。

---

### 方案 B：使用 OpenAI TTS（需要额外费用）

**优点：**
- ✅ 音质最好
- ✅ 支持多语言
- ✅ 6 种高质量音色

**缺点：**
- ❌ 需要科学上网
- ❌ 需要 OpenAI API Key（付费）
- ❌ 与 DeepSeek 聊天功能冲突

**实现步骤：**

#### 1. 获取 OpenAI API Key
访问 [OpenAI Platform](https://platform.openai.com/)

#### 2. 分离配置
修改 `backend/src/config/config.js`：

```javascript
export const CHAT_CONFIG = {
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat'
};

export const TTS_CONFIG = {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1'
};
```

#### 3. 更新环境变量
```env
# DeepSeek 聊天配置
DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com

# OpenAI TTS 配置
OPENAI_API_KEY=sk-your-openai-key
OPENAI_BASE_URL=https://api.openai.com/v1
```

#### 4. 修改服务
更新 `ttsService.js` 使用 `TTS_CONFIG`。

---

### 方案 C：使用阿里云 TTS

**优点：**
- ✅ 国内服务，稳定
- ✅ 支持中文
- ✅ 多种音色

**实现步骤：**

#### 1. 安装 SDK
```bash
npm install @alicloud/pop-core
```

#### 2. 获取 API Key
访问 [阿里云语音服务](https://www.aliyun.com/product/nls)

#### 3. 实现服务
参考阿里云文档实现 TTS 服务。

---

### 方案 D：使用微软 Azure TTS

**优点：**
- ✅ 音质好
- ✅ 支持多语言
- ✅ 免费额度充足

**实现步骤：**

#### 1. 安装 SDK
```bash
npm install microsoft-cognitiveservices-speech-sdk
```

#### 2. 获取 API Key
访问 [Azure 语音服务](https://azure.microsoft.com/zh-cn/services/cognitive-services/speech-services/)

---

### 方案 E：移除 TTS 功能（临时方案）

如果暂时不需要 TTS 功能，可以：

#### 1. 注释掉 TTS 路由
在 `backend/src/app.js` 中：
```javascript
// app.use('/tts', ttsRoutes);
// app.use('/voice', voiceRoutes);
```

#### 2. 前端隐藏 TTS 模式
在 `frontend/src/App.vue` 中移除 TTS 测试按钮。

---

## 📊 方案对比

| 方案 | 成本 | 音质 | 稳定性 | 实现难度 | 推荐度 |
|------|------|------|--------|----------|--------|
| 百度 TTS | 💰 低 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| OpenAI TTS | 💰💰 中 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| 阿里云 TTS | 💰 低 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Azure TTS | 💰 低 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 移除功能 | 💰 免费 | - | - | ⭐ | ⭐⭐ |

---

## 🚀 快速开始（百度 TTS）

### 1. 安装依赖
```bash
cd backend
npm install baidu-aip-sdk
```

### 2. 配置环境变量
```bash
# 编辑 .env 文件
BAIDU_TTS_APP_ID=your_app_id
BAIDU_TTS_API_KEY=your_api_key
BAIDU_TTS_SECRET_KEY=your_secret_key
```

### 3. 创建百度 TTS 服务
创建 `backend/src/services/baiduTtsService.js`（代码见上文）

### 4. 更新控制器
修改 `backend/src/controllers/ttsController.js`：
```javascript
import { textToSpeech } from '../services/baiduTtsService.js';
// 其他代码保持不变
```

### 5. 重启服务
```bash
npm run dev:backend
```

### 6. 测试
```bash
node test-tts.ps1
```

---

## 📝 注意事项

1. **API Key 安全**
   - 不要提交 API Key 到 Git
   - 使用环境变量管理
   - 定期更换 Key

2. **费用控制**
   - 设置每日调用限额
   - 监控 API 使用量
   - 使用缓存减少调用

3. **音频质量**
   - 根据需求选择音质
   - 平衡质量和文件大小
   - 测试不同音色效果

4. **错误处理**
   - 添加重试机制
   - 记录错误日志
   - 提供降级方案

---

## 🎯 推荐方案

**对于本项目，强烈推荐使用百度 TTS：**

1. ✅ 国内服务，网络稳定
2. ✅ 中文支持好
3. ✅ 价格便宜
4. ✅ 实现简单
5. ✅ 与 DeepSeek 聊天功能完美配合

---

## 📞 需要帮助？

如果在实现过程中遇到问题：
1. 查看百度 TTS 官方文档
2. 参考本项目的其他服务实现
3. 查看错误日志
4. 联系技术支持

---

**文档更新时间：** 2026-01-07  
**适用版本：** v1.1.0
