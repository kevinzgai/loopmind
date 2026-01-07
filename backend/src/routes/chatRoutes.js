import { Router } from 'express';
import { handleChatMessage, getProviders } from '../controllers/chatController.js';

const router = Router();

// API端点：处理聊天消息（支持流式响应）
router.post('/', handleChatMessage);

// API端点：获取可用的 AI 提供商列表
router.get('/providers', getProviders);

export default router;