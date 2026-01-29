import express from 'express';
import multer from 'multer';
import { verifyApiKey } from '../middleware/externalAuth.js';
import { 
    handleExternalAgentChat, 
    handleGetPublicAgents,
    handleGetMyAgents,
    handleGetAgentDetails,
    handleCreateConversation,
    handleGetConversations,
    handleGetConversationMessages,
    handleDeleteConversation
} from '../controllers/externalAgentController.js';
import { handleExternalKnowledgeQuery } from '../controllers/externalKnowledgeController.js';
import { handleTextToSpeech, handleGetVoices } from '../controllers/ttsController.js';
import { handleRecognition } from '../controllers/asrController.js';

const router = express.Router();

// 配置 multer 用于处理文件上传
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

/**
 * 所有外部 API 路由都需要 X-API-Key 验证
 */
router.use(verifyApiKey);

/**
 * 获取公开智能体列表
 */
router.get('/agents', handleGetPublicAgents);

/**
 * 获取我的智能体列表
 */
router.get('/agents/my', handleGetMyAgents);

/**
 * 获取智能体详情
 */
router.get('/agent/:agentId', handleGetAgentDetails);

/**
 * 创建会话
 */
router.post('/agent/:agentId/conversations', handleCreateConversation);

/**
 * 获取会话列表
 */
router.get('/agent/:agentId/conversations', handleGetConversations);

/**
 * 获取会话消息
 */
router.get('/agent/:agentId/conversations/:conversationId/messages', handleGetConversationMessages);

/**
 * 删除会话
 */
router.delete('/agent/:agentId/conversations/:conversationId', handleDeleteConversation);

/**
 * 智能体对话接口
 */
router.post('/agent/:agentId/chat', handleExternalAgentChat);

/**
 * 知识库查询接口
 */
router.post('/knowledge/:kbId/query', handleExternalKnowledgeQuery);

/**
 * 文字转语音接口
 */
router.post('/tts', handleTextToSpeech);

/**
 * 获取音色列表
 */
router.get('/tts/voices', handleGetVoices);

/**
 * 语音识别接口
 */
router.post('/asr', upload.single('file'), handleRecognition);

export default router;
