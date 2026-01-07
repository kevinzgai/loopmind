# 阿里云 ASR（语音识别）集成说明

## ✅ 完成状态

阿里云 ASR 语音识别服务已集成完成！

## 🎯 功能特性

### 1. 实时语音识别
- 支持浏览器麦克风录音
- 实时音量可视化
- WebSocket 实时传输

### 2. 文件识别
- 支持上传音频文件
- 支持多种格式：WAV、MP3、WebM 等
- 自动格式转换

### 3. 智能处理
- 自动标点符号
- 数字文本转换（ITN）
- 中文普通话识别

## 📁 文件结构

### 后端文件

1. **服务层** (`backend/src/services/aliAsrService.js`)
   - WebSocket 连接管理
   - 音频数据发送
   - 识别结果处理
   - Token 自动获取

2. **控制器** (`backend/src/controllers/asrController.js`)
   - 处理 HTTP 请求
   - 文件上传处理
   - Base64 音频解码

3. **路由** (`backend/src/routes/asrRoutes.js`)
   - POST /asr - 语音识别接口
   - GET /asr/health - 健康检查

### 前端文件

1. **组件** (`frontend/src/components/AsrTestDemo.vue`)
   - 录音控制
   - 音量可视化
   - 文件上传
   - 结果显示

2. **页面** (`frontend/src/views/AsrTestPage.vue`)
   - ASR 测试页面容器

3. **路由** (`frontend/src/router/index.js`)
   - /asr-test 路由配置

## 🔧 配置说明

### 环境变量

在 `backend/.env` 中配置（与 TTS 共用）：

```env
# 阿里云语音服务配置
ALI_TTS_ACCESS_KEY_ID=your_access_key_id
ALI_TTS_ACCESS_KEY_SECRET=your_access_key_secret
ALI_TTS_APP_KEY=your_app_key
```

### 依赖安装

后端已安装：
- `ws` - WebSocket 客户端
- `multer` - 文件上传处理

## 📊 API 接口

### POST /asr

**请求方式 1：文件上传**
```bash
curl -X POST http://localhost:3000/asr \
  -F "audio=@test.wav" \
  -F "format=wav" \
  -F "sampleRate=16000"
```

**请求方式 2：Base64 编码**
```json
POST /asr
Content-Type: application/json

{
  "audio": "data:audio/webm;base64,GkXf...",
  "format": "webm",
  "sampleRate": 16000
}
```

**响应**
```json
{
  "success": true,
  "text": "你好，这是一个语音识别测试",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

### GET /asr/health

**响应**
```json
{
  "status": "ok",
  "service": "Aliyun ASR",
  "configured": true
}
```

## 🎤 使用流程

### 浏览器录音识别

1. 用户点击「开始录音」
2. 浏览器请求麦克风权限
3. 开始录音，实时显示音量
4. 用户点击「停止录音」
5. 音频数据发送到服务器
6. 服务器调用阿里云 ASR API
7. 返回识别结果

### 文件上传识别

1. 用户选择音频文件
2. 文件上传到服务器
3. 服务器调用阿里云 ASR API
4. 返回识别结果

## 🔄 技术实现

### WebSocket 通信流程

```
客户端                    后端服务器                阿里云 ASR
  |                          |                          |
  |-- 1. 请求识别 ---------->|                          |
  |                          |-- 2. 获取 Token -------->|
  |                          |<-- 3. 返回 Token --------|
  |                          |-- 4. 建立 WebSocket ---->|
  |                          |<-- 5. 连接成功 ----------|
  |                          |-- 6. 发送开始指令 ------>|
  |                          |-- 7. 发送音频数据 ------>|
  |                          |<-- 8. 中间结果 ----------|
  |                          |-- 9. 发送停止指令 ------>|
  |                          |<-- 10. 最终结果 ---------|
  |<-- 11. 返回结果 ---------|                          |
```

### 音频处理

1. **浏览器录音**
   - 使用 MediaRecorder API
   - 格式：WebM（Opus 编码）
   - 采样率：16000 Hz
   - 声道：单声道

2. **音频转换**
   - 前端：WebM → Base64
   - 后端：Base64 → Buffer
   - 发送：分块发送（每 100ms）

3. **识别配置**
   - 启用标点符号预测
   - 启用数字文本转换
   - 启用中间结果

## 🎨 前端功能

### 录音控制
- 开始/停止录音按钮
- 录音状态指示
- 音量实时可视化

### 文件上传
- 拖拽上传区域
- 文件格式验证
- 上传进度显示

### 结果展示
- 识别结果文本框
- 复制到剪贴板
- 清除结果

### 状态提示
- 录音状态
- 识别进度
- 错误信息

## 📝 测试建议

### 测试内容
1. "你好，这是一个语音识别测试"
2. "今天天气真不错"
3. "人工智能正在改变我们的生活"
4. "学习新知识是一件令人兴奋的事情"

### 注意事项
- 使用普通话清晰发音
- 避免环境噪音
- 保持麦克风距离适中
- 建议使用耳机麦克风

## 🚀 性能优化

### 音频压缩
- 使用 Opus 编码
- 降低比特率
- 单声道传输

### 网络优化
- 分块发送音频
- WebSocket 长连接
- 自动重连机制

### 用户体验
- 实时音量反馈
- 识别进度提示
- 错误友好提示

## 🔍 故障排查

### 常见问题

1. **麦克风权限被拒绝**
   - 检查浏览器权限设置
   - 使用 HTTPS 协议
   - 重新加载页面

2. **识别失败**
   - 检查 Token 是否有效
   - 检查网络连接
   - 查看后端日志

3. **音频格式不支持**
   - 转换为 WAV/PCM 格式
   - 确保采样率为 16000 Hz
   - 使用单声道

4. **识别结果为空**
   - 检查音频质量
   - 确保有清晰语音
   - 增加录音时长

## 📚 参考文档

- [阿里云语音识别文档](https://help.aliyun.com/document_detail/90727.html)
- [WebSocket API](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)
- [MediaRecorder API](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaRecorder)

## ✨ 后续优化

### 功能增强
- [ ] 支持实时流式识别
- [ ] 支持多语言识别
- [ ] 支持方言识别
- [ ] 添加语音唤醒

### 性能优化
- [ ] 音频预处理（降噪）
- [ ] 本地缓存识别结果
- [ ] 批量识别优化

### 用户体验
- [ ] 添加识别历史
- [ ] 支持结果编辑
- [ ] 导出识别结果

---

**集成完成时间**：2026年1月7日  
**状态**：✅ 可用  
**测试状态**：待测试
