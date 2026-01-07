import app from './app.js';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { PORT } from './config/config.js';
import { SEED_ASR_CONFIG } from './config/config.js';
import SeedASRService from './services/seedAsrService.js';
// 使用完整版本
import { handleStreamConnection } from './services/aliAsrStreamService.js';
import { v4 as uuidv4 } from 'uuid';

// 创建 HTTP 服务器
const httpServer = createServer(app);

// 初始化 Seed-ASR 服务
const seedAsrService = new SeedASRService(SEED_ASR_CONFIG);

// 使用单一 WebSocket 服务器处理所有连接
const wss = new WebSocketServer({ server: httpServer });

console.log('✅ WebSocket 服务器已创建');

wss.on('connection', (ws, req) => {
    const path = req.url;
    console.log('📞 收到 WebSocket 连接请求，路径:', path);
    
    if (path === '/seed-asr') {
        const clientId = uuidv4();
        console.log(`✅ Seed-ASR 客户端已连接，ID: ${clientId}`);
        seedAsrService.handleConnection(ws, clientId);
    } else if (path === '/ws-asr-stream') {
        console.log('✅ 阿里云流式 ASR 客户端已连接');
        handleStreamConnection(ws);
    } else {
        console.log('❌ 未知路径:', path);
        ws.close();
    }
});

wss.on('error', (error) => {
    console.error('❌ WebSocket 服务器错误:', error);
});

// 启动服务器
httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`WebSocket server is running on the same port`);
    console.log(`Seed-ASR WebSocket service: ws://localhost:${PORT}/seed-asr`);
    console.log(`Ali ASR Stream WebSocket service: ws://localhost:${PORT}/ws-asr-stream`);
});

// 处理服务器关闭
process.on('SIGINT', () => {
    console.log('正在关闭服务器...');
    seedAsrService.closeAllConnections();
    httpServer.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});