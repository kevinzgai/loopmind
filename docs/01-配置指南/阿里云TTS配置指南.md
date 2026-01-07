# 🔊 阿里云 TTS 配置指南

## 📋 概述

本项目已集成阿里云智能语音交互服务（TTS），提供高质量的中文语音合成功能。

---

## ✨ 优势

- ✅ **国内服务** - 网络稳定，速度快
- ✅ **中文优化** - 专为中文优化，发音准确
- ✅ **多种音色** - 支持 20+ 种中文音色
- ✅ **价格实惠** - 按量计费，有免费额度
- ✅ **易于集成** - 官方 SDK 支持

---

## 🚀 快速开始

### 第一步：注册阿里云账号

1. 访问 [阿里云官网](https://www.aliyun.com/)
2. 点击右上角「免费注册」
3. 完成注册和实名认证

### 第二步：开通智能语音交互服务

1. 访问 [智能语音交互控制台](https://nls-portal.console.aliyun.com/)
2. 点击「立即开通」
3. 选择「按量付费」模式
4. 同意服务协议并开通

### 第三步：创建项目

1. 在控制台点击「项目管理」
2. 点击「创建项目」
3. 填写项目名称（如：AI Chat TTS）
4. 选择「语音合成」服务
5. 点击「确定」创建

### 第四步：获取 AppKey

1. 在项目列表中找到刚创建的项目
2. 点击项目名称进入详情
3. 在「基本信息」中找到 **AppKey**
4. 复制保存 AppKey

### 第五步：创建 AccessKey

1. 点击右上角头像，选择「AccessKey 管理」
2. 或直接访问 [AccessKey 管理页面](https://ram.console.aliyun.com/manage/ak)
3. 点击「创建 AccessKey」
4. 完成安全验证
5. 保存 **AccessKey ID** 和 **AccessKey Secret**

⚠️ **重要提示：** AccessKey Secret 只显示一次，请妥善保管！

### 第六步：配置环境变量

编辑项目根目录的 `.env` 文件：

```env
# 阿里云 TTS 配置
ALI_TTS_ACCESS_KEY_ID=LTAI5t...（你的 AccessKey ID）
ALI_TTS_ACCESS_KEY_SECRET=your_secret...（你的 AccessKey Secret）
ALI_TTS_APP_KEY=your_app_key...（你的 AppKey）
```

### 第七步：重启服务

```bash
# 停止当前服务（Ctrl+C）

# 重新启动后端
npm run dev:backend
```

### 第八步：测试

1. 访问前端页面：http://localhost:5173
2. 进入「TTS 测试」页面
3. 输入文字，点击「转换为语音」
4. 如果成功，会听到语音播放

---

## 🎤 支持的音色

### 标准中文音色

| 音色 ID | 名称 | 描述 | 适用场景 |
|---------|------|------|----------|
| xiaoyun | 小云 | 女声、温柔 | 客服、助手 |
| xiaogang | 小刚 | 男声、成熟 | 播报、解说 |
| ruoxi | 若曦 | 女声、温柔 | 故事、朗读 |
| siqi | 思琪 | 女声、温柔 | 客服、助手 |
| sijia | 思佳 | 女声、标准 | 播报、通知 |
| sicheng | 思诚 | 男声、标准 | 播报、解说 |
| aiqi | 艾琪 | 女声、温柔 | 客服、助手 |
| aijia | 艾佳 | 女声、标准 | 播报、通知 |
| aicheng | 艾诚 | 男声、标准 | 播报、解说 |
| aida | 艾达 | 男声、标准 | 播报、解说 |
| ninger | 宁儿 | 女声、标准 | 播报、通知 |
| ruilin | 瑞琳 | 女声、标准 | 播报、通知 |
| siyue | 思悦 | 女声、温柔 | 客服、助手 |
| aiya | 艾雅 | 女声、标准 | 播报、通知 |
| aimei | 艾美 | 女声、甜美 | 故事、朗读 |
| aiyu | 艾雨 | 女声、标准 | 播报、通知 |
| aiyue | 艾悦 | 女声、标准 | 播报、通知 |
| aijing | 艾婧 | 女声、标准 | 播报、通知 |
| xiaomei | 小美 | 女声、甜美 | 故事、朗读 |
| aina | 艾娜 | 女声、标准 | 播报、通知 |

### 英文音色

| 音色 ID | 名称 | 描述 |
|---------|------|------|
| harry | Harry | 男声、英文 |
| abby | Abby | 女声、英文 |
| andy | Andy | 男声、英文 |
| eric | Eric | 男声、英文 |
| emily | Emily | 女声、英文 |
| luna | Luna | 女声、英文 |
| luca | Luca | 男声、英文 |
| wendy | Wendy | 女声、英文 |
| william | William | 男声、英文 |
| olivia | Olivia | 女声、英文 |

---

## ⚙️ 参数说明

### 语速（speechRate）
- 范围：-500 到 500
- 默认：0（正常速度）
- -500：最慢
- 0：正常
- 500：最快

### 音量（volume）
- 范围：0 到 100
- 默认：50
- 0：静音
- 50：正常
- 100：最大

### 音调（pitchRate）
- 范围：-500 到 500
- 默认：0（正常音调）
- -500：最低
- 0：正常
- 500：最高

### 音频格式（format）
- mp3：MP3 格式（默认）
- wav：WAV 格式
- pcm：PCM 格式

### 采样率（sampleRate）
- 8000：8kHz
- 16000：16kHz（默认）
- 24000：24kHz

---

## 💰 计费说明

### 免费额度
- 新用户赠送 100 万字符免费额度
- 每月前 100 万字符免费

### 按量计费
- 超出免费额度后按量计费
- 价格：约 0.0002 元/字符
- 示例：1000 字符 ≈ 0.2 元

### 费用控制
1. 在控制台设置每日调用上限
2. 开启费用预警
3. 定期查看用量统计

---

## 🔧 API 使用示例

### 基础调用
```javascript
const response = await fetch('/tts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: '你好，这是测试',
    voice: 'xiaoyun',
    speechRate: 0
  })
});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
audio.play();
```

### 自定义参数
```javascript
const response = await fetch('/tts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: '你好，这是测试',
    voice: 'xiaoyun',      // 音色
    format: 'mp3',         // 格式
    volume: 80,            // 音量
    speechRate: 100,       // 语速
    pitchRate: 0           // 音调
  })
});
```

---

## 🐛 常见问题

### 1. 提示"TTS service not configured"
**原因：** 环境变量未配置或配置错误

**解决：**
1. 检查 `.env` 文件是否存在
2. 确认三个配置项都已填写
3. 重启后端服务

### 2. 提示"AccessKey 无效"
**原因：** AccessKey 配置错误

**解决：**
1. 检查 AccessKey ID 和 Secret 是否正确
2. 确认 AccessKey 状态是否为"启用"
3. 尝试重新创建 AccessKey

### 3. 提示"AppKey 无效"
**原因：** AppKey 配置错误或项目未开通

**解决：**
1. 检查 AppKey 是否正确
2. 确认项目已开通语音合成服务
3. 检查项目状态是否正常

### 4. 转换速度慢
**原因：** 网络问题或文字过长

**解决：**
1. 检查网络连接
2. 减少单次转换的文字量
3. 考虑使用缓存

### 5. 音质不佳
**原因：** 采样率或格式设置不当

**解决：**
1. 使用 24000Hz 采样率
2. 使用 WAV 格式（无损）
3. 调整音量和音调参数

---

## 📊 性能优化

### 1. 缓存策略
```javascript
// 缓存常用语音
const cache = new Map();

async function getCachedTTS(text, voice) {
  const key = `${text}_${voice}`;
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const audio = await textToSpeech(text, { voice });
  cache.set(key, audio);
  return audio;
}
```

### 2. 批量处理
```javascript
// 批量转换多段文字
const texts = ['文字1', '文字2', '文字3'];
const audios = await batchTextToSpeech(texts, { voice: 'xiaoyun' });
```

### 3. 异步处理
```javascript
// 异步转换，不阻塞主流程
textToSpeech(text, options)
  .then(audio => {
    // 处理音频
  })
  .catch(error => {
    // 处理错误
  });
```

---

## 🔒 安全建议

1. **不要泄露 AccessKey**
   - 不要提交到 Git
   - 不要在前端代码中使用
   - 定期更换 AccessKey

2. **设置访问控制**
   - 使用 RAM 子账号
   - 设置最小权限
   - 启用 MFA 认证

3. **监控使用情况**
   - 定期查看调用日志
   - 设置异常告警
   - 监控费用变化

---

## 📚 参考资料

- [阿里云智能语音交互官网](https://ai.aliyun.com/nls)
- [语音合成 API 文档](https://help.aliyun.com/document_detail/84435.html)
- [音色列表](https://help.aliyun.com/document_detail/84435.html#section-v3r-5lh-gfb)
- [SDK 文档](https://help.aliyun.com/document_detail/120693.html)
- [价格说明](https://www.aliyun.com/price/product#/nls/detail)

---

## 🎉 完成

配置完成后，你就可以使用阿里云 TTS 服务了！

如有问题，请参考上述文档或联系技术支持。

---

**文档更新时间：** 2026-01-07  
**适用版本：** v1.2.0
