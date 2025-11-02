import { Router } from 'express';
import { handleChatMessage } from '../controllers/chatController.js';

const router = Router();

// API端点：处理聊天消息（支持流式响应）
router.post('/', handleChatMessage);

export default router;