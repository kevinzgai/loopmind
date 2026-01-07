# ASR 语音识别问题修复说明

## 修复时间
2026-01-07

## 问题描述

### 1. Task ID 不匹配错误
**错误信息**:
```
Gateway:MESSAGE_INVALID:The task id '43585135852103dc301862784f8256a9' of this message doesn't match last message '80ca5faf98cb55fcc60138b37004f2d2'!
```

**原因**: 
- `StartTranscription` 消息使用了一个 task_id
- `StopTranscription` 消息生成了新的 task_id
- 阿里云要求同一个识别会话必须使用相同的 task_id

**解决方案**:
- 在 `createAsrConnection()` 中生成 task_id 后，保存到 `ws.taskId` 属性
- 在 `stopRecognition()` 中使用保存的 `ws.taskId`，而不是生成新的

### 2. 识别成功但返回 TaskFailed
**现象**:
- 成功识别出文字："北京的天气。"
- 但最后返回 TaskFailed 错误

**原因**:
- 由于 task_id 不匹配，阿里云返回 TaskFailed
- 但此时识别已经完成，有有效的识别结果

**解决方案**:
- 在收到 TaskFailed 消息时，检查是否已有识别结果
- 如果有结果，返回结果而不是抛出错误
- 如果没有结果，才抛出错误

### 3. WebM 录音数据太小
**错误信息**:
```
原始音频数据大小: 15 bytes
音频转换失败: ffmpeg exited with code 1: pipe:0: Invalid data found when processing input
```

**原因**:
- MediaRecorder 默认不会立即收集数据
- 调用 `start()` 时没有指定 timeslice 参数
- 导致只在 `stop()` 时才收集数据，数据不完整

**解决方案**:
1. **前端修改**:
   - 使用 `mediaRecorder.start(1000)` 每秒收集一次数据
   - 改用 FormData 上传文件，而不是 base64
   - 添加音频大小检查（至少 100 bytes）
   - 添加详细的日志输出

2. **后端修改**:
   - 增强文件上传处理逻辑
   - 从文件名和 mimetype 自动推断格式
   - 添加音频大小验证
   - 改进错误提示信息

## 修改的文件

### 1. backend/src/services/aliAsrService.js
- ✅ 在 `createAsrConnection()` 中保存 task_id 到 ws 对象
- ✅ 在 `stopRecognition()` 中使用保存的 task_id
- ✅ 在 TaskFailed 处理中检查是否有识别结果

### 2. frontend/src/components/AsrTestDemo.vue
- ✅ 使用 `mediaRecorder.start(1000)` 定期收集数据
- ✅ 改用 FormData 上传，而不是 base64
- ✅ 添加音频大小检查
- ✅ 改进 MediaRecorder 格式选择逻辑
- ✅ 添加详细的调试日志

### 3. backend/src/controllers/asrController.js
- ✅ 增强文件上传处理
- ✅ 自动推断音频格式
- ✅ 添加音频大小验证
- ✅ 改进错误提示

## 测试建议

### 1. 测试录音功能
1. 打开 ASR 测试页面：http://localhost:5173/asr-test
2. 点击「开始录音」
3. 说话 3-5 秒（例如："今天天气真不错"）
4. 点击「停止录音」
5. 查看识别结果

### 2. 测试文件上传
1. 准备一个 WAV 或 MP3 音频文件
2. 点击「选择音频文件」
3. 上传文件
4. 查看识别结果

### 3. 检查日志
**前端控制台应该看到**:
```
🎤 使用音频格式: audio/webm;codecs=opus
📦 收到音频数据块: 12345 bytes
📦 收到音频数据块: 12345 bytes
📦 音频格式: audio/webm;codecs=opus
📦 音频大小: 24690 bytes
📦 音频块数量: 2
📤 发送音频到服务器...
✅ 识别结果: {success: true, text: "今天天气真不错。"}
```

**后端控制台应该看到**:
```
📨 收到 ASR 请求
📁 文件上传: recording.webm 大小: 24690 bytes
🎤 原始音频数据大小: 24690 bytes
⚙️ 音频格式: webm
🔄 正在转换音频格式: webm → PCM
✅ 音频转换完成，PCM 数据大小: 160000 bytes
🎤 创建阿里云 ASR WebSocket 连接...
✅ ASR WebSocket 连接已建立
📤 已发送开始识别指令, task_id: abc123...
📨 收到消息: TranscriptionStarted
✅ 识别已开始
📤 开始发送音频数据...
📨 收到消息: SentenceBegin
📨 收到消息: TranscriptionResultChanged
📝 中间结果: 今天
📨 收到消息: TranscriptionResultChanged
📝 中间结果: 今天天气
📨 收到消息: SentenceEnd
✅ 句子识别完成: 今天天气真不错。
📤 音频数据发送完毕
🛑 已发送停止识别指令, task_id: abc123...
🎉 识别完成，最终结果: 今天天气真不错。
✅ 识别成功: 今天天气真不错。
```

## 技术要点

### MediaRecorder timeslice 参数
```javascript
// ❌ 错误：不指定 timeslice，数据可能不完整
mediaRecorder.start()

// ✅ 正确：每 1000ms 收集一次数据
mediaRecorder.start(1000)
```

### Task ID 管理
```javascript
// ❌ 错误：每次生成新的 task_id
const stopMessage = {
    header: {
        task_id: generateTaskId()  // 新的 ID
    }
}

// ✅ 正确：使用开始时的 task_id
const taskId = generateTaskId()
ws.taskId = taskId  // 保存
// ... 后续使用 ws.taskId
```

### FormData vs Base64
```javascript
// ❌ Base64：数据量大，编码开销
const base64 = await blobToBase64(audioBlob)
fetch('/asr', {
    body: JSON.stringify({ audio: base64 })
})

// ✅ FormData：直接传输二进制，效率高
const formData = new FormData()
formData.append('audio', audioBlob, 'recording.webm')
fetch('/asr', { body: formData })
```

## 已知限制

1. **浏览器兼容性**
   - Chrome/Edge: 支持 audio/webm
   - Safari: 可能不支持 webm，需要 ffmpeg 转换
   - Firefox: 支持 audio/webm

2. **音频格式**
   - 推荐使用 WAV 格式（无需转换）
   - WebM 需要 ffmpeg 转换（已安装）
   - 转换可能增加 1-2 秒延迟

3. **识别质量**
   - 建议清晰发音，避免背景噪音
   - 普通话识别效果最佳
   - 录音时间建议 2-10 秒

## 下一步优化建议

1. **实时流式识别**
   - 当前是录音完成后一次性识别
   - 可以改为边录音边识别（WebSocket 流式传输）

2. **音频预处理**
   - 添加降噪处理
   - 音量归一化
   - 静音检测

3. **用户体验**
   - 添加录音波形可视化
   - 显示识别进度
   - 支持暂停/继续录音

4. **错误处理**
   - 网络断线重连
   - 超时处理
   - 更友好的错误提示
