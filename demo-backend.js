const http = require('http');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  // 处理 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // 处理 API 端点
  if (req.url === '/api/asr' && req.method === 'POST') {
    handleAudioUpload(req, res);
  } else {
    // 健康检查
    if (req.url === '/health') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'ok' }));
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  }
});

console.log('========================================');
console.log('🎤 语音识别 Demo 后端服务');
console.log('========================================');
console.log('✅ 服务已启动，HTTP 端口: 3002');
console.log('📡 API 地址: http://localhost:3002/api/asr');
console.log('========================================');

// 处理音频上传
function handleAudioUpload(req, res) {
  const sessionId = uuidv4();
  console.log('\n📞 新的音频上传请求');
  console.log('🆔 会话 ID:', sessionId);
  console.log('🌐 客户端地址:', req.socket.remoteAddress);
  
  let body = [];
  
  req.on('data', (chunk) => {
    body.push(chunk);
  });
  
  req.on('end', () => {
    try {
      // 处理文件上传
      const boundary = req.headers['content-type'].split('; ')[1].split('=')[1];
      const bodyBuffer = Buffer.concat(body);
      
      // 解析 multipart/form-data
      const parts = parseMultipartForm(bodyBuffer, boundary);
      
      if (!parts.audio) {
        throw new Error('No audio file provided');
      }
      
      const audioData = parts.audio.data;
      console.log('📊 收到音频文件大小:', audioData.length, '字节');
      
      // 保存音频文件
      saveAudioFile(audioData, sessionId);
      
      // 处理音频数据
      processAudio(audioData, (result) => {
        console.log('✅ 语音识别完成');
        
        // 返回结果
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          text: result,
          confidence: Math.random() * 0.2 + 0.8, // 模拟置信度
          sessionId: sessionId,
          timestamp: new Date().toISOString()
        }));
        
        console.log('========================================');
      });
    } catch (error) {
      console.error('❌ 处理音频上传失败:', error.message);
      
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: '处理音频文件失败',
        message: error.message
      }));
      
      console.error('========================================');
    }
  });
  
  req.on('error', (error) => {
    console.error('❌ 请求错误:', error.message);
    
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: '请求错误',
      message: error.message
    }));
  });
}

// 解析 multipart/form-data
function parseMultipartForm(data, boundary) {
  const parts = {};
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  
  // 分割数据
  let start = 0;
  while (start < data.length) {
    // 查找边界
    const boundaryIndex = data.indexOf(boundaryBuffer, start);
    if (boundaryIndex === -1) break;
    
    // 查找内容开始
    const headerEnd = data.indexOf(Buffer.from('\r\n\r\n'), boundaryIndex);
    if (headerEnd === -1) break;
    
    // 解析头部
    const header = data.slice(boundaryIndex + boundaryBuffer.length, headerEnd).toString();
    const nameMatch = header.match(/name="([^"]+)"/);
    const filenameMatch = header.match(/filename="([^"]+)"/);
    
    if (nameMatch) {
      const name = nameMatch[1];
      // 查找内容结束
      const contentEnd = data.indexOf(Buffer.from('\r\n--'), headerEnd + 4);
      const contentStart = headerEnd + 4;
      const contentEndPos = contentEnd === -1 ? data.length : contentEnd;
      
      // 提取内容
      const content = data.slice(contentStart, contentEndPos);
      
      parts[name] = {
        data: content,
        filename: filenameMatch ? filenameMatch[1] : null
      };
    }
    
    start = boundaryIndex + boundaryBuffer.length;
  }
  
  return parts;
}

// 模拟语音识别处理函数
function processAudio(audioData, callback) {
  console.log('🔄 开始处理音频数据...');
  console.log('📊 音频数据大小:', audioData.length, '字节');
  
  // 模拟处理延迟
  setTimeout(() => {
    // 模拟不同场景的识别结果
    const mockResults = [
      "你好，我是智能助手，有什么可以帮您的吗？",
      "今天天气晴朗，温度适宜，适合户外活动。",
      "明天的会议安排在上午十点，地点是会议室 A。",
      "语音识别测试成功，这是一个演示结果。",
      "感谢您的使用，祝您生活愉快！",
      "我需要查询一下相关信息，请稍等。",
      "您的请求已收到，正在处理中。",
      "这是一个语音识别的示例文本。"
    ];
    
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    console.log('✅ 语音识别完成，结果:', randomResult);
    callback(randomResult);
  }, 1500);
}

// 保存音频文件
function saveAudioFile(audioData, sessionId) {
  const audioDir = path.join(__dirname, 'audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }
  
  const filePath = path.join(audioDir, `${sessionId}-audio.webm`);
  fs.writeFileSync(filePath, audioData);
  console.log('💾 音频文件已保存:', filePath);
}

// 处理服务器错误
server.on('error', (error) => {
  console.error('\n🚨 服务器错误:');
  console.error('📝 错误信息:', error.message);
  console.error('========================================');
});

// 启动服务器
server.listen(3002, () => {
  console.log('📡 服务器正在监听端口 3002...');
  console.log('🎯 服务已就绪，等待音频上传请求...');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n📢 收到关闭信号，正在停止服务...');
  server.close(() => {
    console.log('✅ 服务已停止');
    process.exit(0);
  });
});