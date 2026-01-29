import express from 'express';
import { verifyApiKey } from '../middleware/externalAuth.js';
import { handleExternalAgentChat } from '../controllers/externalAgentController.js';

const router = express.Router();

/**
 * 所有外部 API 路由都需要 X-API-Key 验证
 */
router.use(verifyApiKey);

/**
 * 智能体对话接口
 * POST /api/external/agent/:agentId/chat
 */
router.post('/agent/:agentId/chat', handleExternalAgentChat);

export default router;
