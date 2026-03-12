import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import ttsRoutes from './routes/ttsRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';
import asrRoutes from './routes/asrRoutes.js';
import agentRoutes from './modules/agent/routes/agentRoutes.js';
import knowledgeRoutes from './modules/knowledge/routes/knowledgeRoutes.js';
import toolRoutes from './modules/tool/routes/toolRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import multimodalRoutes from './routes/multimodalRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import adminConfigRoutes from './routes/adminConfigRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import adminPermissionRoutes from './routes/adminPermissionRoutes.js';
import externalRoutes from './routes/externalRoutes.js';
import apiKeyRoutes from './routes/apiKeyRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { errorHandler as authErrorHandler } from './middleware/auth.middleware.js';
import { setupSecurityMiddleware } from './middleware/security.middleware.js';
import { requestLogger } from './utils/logger.js';
import { cache } from './services/cache/cacheService.js';
import { performanceMiddleware } from './middleware/cache.middleware.js';

// 获取__dirname的ES模块等价物
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 日志中间件
app.use(requestLogger);

// 性能监控中间件
app.use(performanceMiddleware());

// 安全中间件 (包含 Helmet, MongoSanitize, HPP, 全局限流)
setupSecurityMiddleware(app);

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '..', '..', 'dist')));
// 上传文件静态服务
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));
// apidoc 文档
app.use('/apidoc', express.static(path.join(__dirname, '..', 'docs', 'apidoc')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/multimodal', multimodalRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminConfigRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/permissions', adminPermissionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/asr', asrRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/api-key', apiKeyRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cache: cache.getStats(),
        timestamp: new Date().toISOString()
    });
});

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', '..', 'public', 'index.html'));
});

// 错误处理中间件
app.use(authErrorHandler);
app.use(errorHandler);

export default app;
