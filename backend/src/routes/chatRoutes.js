import { Router } from 'express';
import { handleChatMessage, getChatHistory, getProviders, getUserConversations } from '../controllers/chatController.js';
import { optionalAuthenticateToken } from '../shared/middleware/authMiddleware.js';
import { chatLimiter } from '../middleware/securityMiddleware.js';

const router = Router();

/**
 * @api {post} /chat 发送聊天消息
 * @apiName SendMessage
 * @apiGroup Chat
 * @apiDescription 发送聊天消息给 AI
 * @apiHeader {String} [Authorization] Bearer Token (可选)
 *
 * @apiBody {String} message 用户消息内容
 * @apiBody {String} [userId] 用户ID (未登录时需要)
 * @apiBody {String} [provider] AI提供商 (默认 deepseek)
 * @apiBody {String} [systemPrompt] 系统提示词
 *
 * @apiSuccess {String} reply AI回复内容
 */
router.post('/', chatLimiter, optionalAuthenticateToken, handleChatMessage);

/**
 * @api {get} /chat/history 获取聊天历史
 * @apiName GetChatHistory
 * @apiGroup Chat
 * @apiDescription 获取用户的聊天历史记录
 * @apiHeader {String} [Authorization] Bearer Token (可选)
 *
 * @apiSuccess {Array} history 聊天记录列表
 */
router.get('/history', optionalAuthenticateToken, getChatHistory);

/**
 * @api {get} /chat/conversations 获取对话列表
 * @apiName GetConversations
 * @apiGroup Chat
 * @apiDescription 获取用户的对话列表
 * @apiHeader {String} [Authorization] Bearer Token
 * @apiParam {String} [provider] AI提供商
 *
 * @apiSuccess {Array} conversations 对话列表
 */
router.get('/conversations', optionalAuthenticateToken, getUserConversations);

/**
 * @api {get} /chat/providers 获取AI提供商列表
 * @apiName GetProviders
 * @apiGroup Chat
 * @apiDescription 获取系统支持的 AI 模型提供商列表
 *
 * @apiSuccess {Array} providers 提供商列表
 */
router.get('/providers', getProviders);

export default router;
