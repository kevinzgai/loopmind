import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getMyApiKey, resetMyApiKey } from '../controllers/apiKeyController.js';

const router = express.Router();

// 所有路由都需要登录
router.use(authenticateToken);

/**
 * 获取我的 API Key
 */
router.get('/my-key', getMyApiKey);

/**
 * 重置我的 API Key
 */
router.post('/reset-key', resetMyApiKey);

export default router;
