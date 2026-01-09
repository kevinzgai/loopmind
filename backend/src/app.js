import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import ttsRoutes from './routes/ttsRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';
import asrRoutes from './routes/asrRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { errorHandler as authErrorHandler } from './middleware/authMiddleware.js';

// 获取__dirname的ES模块等价物
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '..', '..', 'dist')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/tts', ttsRoutes);
app.use('/voice', voiceRoutes);
app.use('/asr', asrRoutes);

// 健康检查接口
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', '..', 'public', 'index.html'));
});

// 错误处理中间件
app.use(authErrorHandler);
app.use(errorHandler);

export default app;