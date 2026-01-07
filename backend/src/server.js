import app from './app.js';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { PORT } from './config/config.js';
import { SEED_ASR_CONFIG } from './config/config.js';
import SeedASRService from './services/seedAsrService.js';
import { v4 as uuidv4 } from 'uuid';

// 创建 HTTP 服务器
const httpServer = createServer(app);

// 初始化 Seed-ASR 服务
const seedAsrService = new SeedASRService(SEED_ASR_CONFIG);

// 创建 WebSocket 服务器，指定路径为 /seed-asr
const wss = new WebSocketServer({ server: httpServer, path: '/seed-asr' });

// 处理 WebSocket 连接
wss.on('connection', (ws) => {
    const clientId = uuidv4();
    console.log(`客户端已连接，ID: ${clientId}`);
    
    // 处理连接
    seedAsrService.handleConnection(ws, clientId);
});

// 启动服务器
httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`WebSocket server is running on the same port`);
    console.log(`Seed-ASR WebSocket service initialized`);
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