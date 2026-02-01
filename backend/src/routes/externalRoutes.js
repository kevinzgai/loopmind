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
 * @api {get} /external/agents 获取公开智能体列表
 * @apiName GetPublicAgents
 * @apiGroup External
 * @apiDescription 获取系统中所有公开的智能体列表
 * @apiHeader {String} X-API-Key 外部 API 密钥
 *
 * @apiSuccess {Array} agents 智能体列表
 */
router.get('/agents', handleGetPublicAgents);

/**
 * @api {get} /external/agents/my 获取我的智能体列表
 * @apiName GetMyAgents
 * @apiGroup External
 * @apiDescription 获取当前 API 密钥关联的智能体列表
 * @apiHeader {String} X-API-Key 外部 API 密钥
 *
 * @apiSuccess {Array} agents 智能体列表
 */
router.get('/agents/my', handleGetMyAgents);

/**
 * @api {get} /external/agent/:agentId 获取智能体详情
 * @apiName GetAgentDetails
 * @apiGroup External
 * @apiDescription 获取指定智能体的详细信息
 * @apiHeader {String} X-API-Key 外部 API 密钥
 *
 * @apiParam {String} agentId 智能体ID
 *
 * @apiSuccess {Object} agent 智能体详情
 */
router.get('/agent/:agentId', handleGetAgentDetails);

/**
 * @api {post} /external/agent/:agentId/conversations 创建会话
 * @apiName CreateConversation
 * @apiGroup External
 * @apiDescription 为指定智能体创建新会话
 * @apiHeader {String} X-API-Key 外部 API 密钥
 *
 * @apiParam {String} agentId 智能体ID
 *
 * @apiSuccess {Object} conversation 创建的会话信息
 */
router.post('/agent/:agentId/conversations', handleCreateConversation);

/**
 * @api {get} /external/agent/:agentId/conversations 获取会话列表
 * @apiName GetConversations
 * @apiGroup External
 * @apiDescription 获取与指定智能体的会话列表
 * @apiHeader {String} X-API-Key 外部 API 密钥
 *
 * @apiParam {String} agentId 智能体ID
 *
 * @apiSuccess {Array} conversations 会话列表
 */
router.get('/agent/:agentId/conversations', handleGetConversations);

/**
 * @api {get} /external/agent/:agentId/conversations/:conversationId/messages 获取会话消息
 * @apiName GetConversationMessages
 * @apiGroup External
 * @apiDescription 获取指定会话的消息记录
 * @apiHeader {String} X-API-Key 外部 API 密钥
 *
 * @apiParam {String} agentId 智能体ID
 * @apiParam {String} conversationId 会话ID
 *
 * @apiSuccess {Array} messages 消息列表
 */
router.get('/agent/:agentId/conversations/:conversationId/messages', handleGetConversationMessages);

/**
 * @api {delete} /external/agent/:agentId/conversations/:conversationId 删除会话
 * @apiName DeleteConversation
 * @apiGroup External
 * @apiDescription 删除指定的会话
 * @apiHeader {String} X-API-Key 外部 API 密钥
 *
 * @apiParam {String} agentId 智能体ID
 * @apiParam {String} conversationId 会话ID
 *
 * @apiSuccess {String} message 删除成功消息
 */
router.delete('/agent/:agentId/conversations/:conversationId', handleDeleteConversation);

/**
 * @api {post} /external/agent/:agentId/chat 智能体对话接口
 * @apiName ExternalAgentChat
 * @apiGroup External
 * @apiDescription 与指定智能体进行对话
 * @apiHeader {String} X-API-Key 外部 API 密钥
 *
 * @apiParam {String} agentId 智能体ID
 * @apiBody {String} message 用户消息
 *
 * @apiSuccess {String} reply AI回复内容
 */
router.post('/agent/:agentId/chat', handleExternalAgentChat);

/**
 * @api {post} /external/knowledge/:kbId/query 知识库查询接口
 * @apiName ExternalKnowledgeQuery
 * @apiGroup External
 * @apiDescription 在指定知识库中进行语义检索
 * @apiHeader {String} X-API-Key 外部 API 密钥
 *
 * @apiParam {String} kbId 知识库ID
 * @apiBody {String} query 查询文本
 * @apiBody {Number} [limit=5] 返回结果数量
 *
 * @apiSuccess {Array} results 检索结果列表
 */
router.post('/knowledge/:kbId/query', handleExternalKnowledgeQuery);

/**
 * @api {post} /external/tts 文字转语音接口
 * @apiName ExternalTextToSpeech
 * @apiGroup External
 * @apiDescription 将文本转换为语音
 * @apiHeader {String} X-API-Key 外部 API 密钥
 *
 * @apiBody {String} text 要转换的文本
 * @apiBody {String} [voice] 音色
 * @apiBody {String} [provider] 语音提供商
 *
 * @apiSuccess {File} audio 音频文件数据
 */
router.post('/tts', handleTextToSpeech);

/**
 * @api {get} /external/tts/voices 获取音色列表
 * @apiName ExternalGetVoices
 * @apiGroup External
 * @apiDescription 获取系统支持的音色列表
 * @apiHeader {String} X-API-Key 外部 API 密钥
 *
 * @apiSuccess {Array} voices 音色列表
 */
router.get('/tts/voices', handleGetVoices);

/**
 * @api {post} /external/asr 语音识别接口
 * @apiName ExternalASR
 * @apiGroup External
 * @apiDescription 将语音文件转换为文本
 * @apiHeader {String} X-API-Key 外部 API 密钥
 *
 * @apiBody {File} file 语音文件
 *
 * @apiSuccess {String} text 识别出的文本
 */
router.post('/asr', upload.single('file'), handleRecognition);

export default router;
