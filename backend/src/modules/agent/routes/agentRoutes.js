import express from 'express';
import {
  handleCreateAgent,
  handleGetUserAgents,
  handleGetPublishedAgents,
  handleGetAgent,
  handleUpdateAgent,
  handlePublishAgent,
  handleUnpublishAgent,
  handleDeleteAgent,
  handleGetMemory,
  handleGenerateAgentConfig
} from '../controllers/agentController.js';
import { 
  handleAgentChat, 
  handleGetAgentChatHistory,
  handleListAgentConversations,
  handleCreateAgentConversation,
  handleGetAgentConversationMessages,
  handleAgentChatInConversation,
  handleDeleteAgentConversation
} from '../controllers/agentChatController.js';
import { authenticateToken, optionalAuthenticateToken } from '../../../middleware/auth.middleware.js';

const router = express.Router();

// 公开路由

/**
 * @api {get} /agent/published 获取已发布的智能体
 * @apiName GetPublishedAgents
 * @apiGroup Agent
 * @apiDescription 获取广场上已发布的智能体列表
 *
 * @apiSuccess {Array} agents 智能体列表
 */
router.get('/published', handleGetPublishedAgents);

// 受保护路由

/**
 * @api {post} /agent/generate-config 自动生成智能体配置
 * @apiName GenerateAgentConfig
 * @apiGroup Agent
 * @apiDescription 根据用户描述自动生成智能体配置
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiBody {String} prompt 用户描述
 *
 * @apiSuccess {Object} config 生成的配置信息
 */
router.post('/generate-config', authenticateToken, handleGenerateAgentConfig);

/**
 * @api {post} /agent/create 创建智能体
 * @apiName CreateAgent
 * @apiGroup Agent
 * @apiDescription 创建新的智能体
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiBody {String} name 智能体名称
 * @apiBody {String} [description] 描述
 * @apiBody {String} [systemPrompt] 系统提示词
 * @apiBody {String} [model] 模型名称
 * @apiBody {String} [voice] 语音名称
 *
 * @apiSuccess {Object} agent 创建的智能体信息
 */
router.post('/create', authenticateToken, handleCreateAgent);

/**
 * @api {get} /agent/my-agents 获取我的智能体
 * @apiName GetMyAgents
 * @apiGroup Agent
 * @apiDescription 获取当前用户创建的智能体列表
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiSuccess {Array} agents 智能体列表
 */
router.get('/my-agents', authenticateToken, handleGetUserAgents);

/**
 * @api {get} /agent/:agentId/memory 获取智能体记忆
 * @apiName GetAgentMemory
 * @apiGroup Agent
 * @apiDescription 获取用户与指定智能体的对话记忆
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} agentId 智能体ID
 *
 * @apiSuccess {Object} memory 记忆信息
 */
router.get('/:agentId/memory', authenticateToken, handleGetMemory);

/**
 * @api {get} /agent/:agentId 获取智能体详情
 * @apiName GetAgent
 * @apiGroup Agent
 * @apiDescription 获取指定智能体的详细信息
 * @apiHeader {String} [Authorization] Bearer Token (可选)
 *
 * @apiParam {String} agentId 智能体ID
 *
 * @apiSuccess {Object} agent 智能体详情
 */
router.get('/:agentId', optionalAuthenticateToken, handleGetAgent);

/**
 * @api {put} /agent/:agentId 更新智能体
 * @apiName UpdateAgent
 * @apiGroup Agent
 * @apiDescription 更新智能体信息
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} agentId 智能体ID
 * @apiBody {String} [name] 名称
 * @apiBody {String} [description] 描述
 * @apiBody {String} [systemPrompt] 系统提示词
 *
 * @apiSuccess {Object} agent 更新后的智能体信息
 */
router.put('/:agentId', authenticateToken, handleUpdateAgent);

/**
 * @api {delete} /agent/:agentId 删除智能体
 * @apiName DeleteAgent
 * @apiGroup Agent
 * @apiDescription 删除指定的智能体
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} agentId 智能体ID
 *
 * @apiSuccess {String} message 删除成功消息
 */
router.delete('/:agentId', authenticateToken, handleDeleteAgent);

/**
 * @api {post} /agent/:agentId/publish 发布智能体
 * @apiName PublishAgent
 * @apiGroup Agent
 * @apiDescription 将智能体发布到广场
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} agentId 智能体ID
 *
 * @apiSuccess {Object} agent 更新后的智能体信息
 */
router.post('/:agentId/publish', authenticateToken, handlePublishAgent);

/**
 * @api {post} /agent/:agentId/unpublish 下架智能体
 * @apiName UnpublishAgent
 * @apiGroup Agent
 * @apiDescription 将智能体从广场下架
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} agentId 智能体ID
 *
 * @apiSuccess {Object} agent 更新后的智能体信息
 */
router.post('/:agentId/unpublish', authenticateToken, handleUnpublishAgent);

/**
 * @api {post} /agent/:agentId/chat 智能体对话
 * @apiName ChatWithAgent
 * @apiGroup Agent
 * @apiDescription 与指定智能体进行对话
 * @apiHeader {String} [Authorization] Bearer Token (可选)
 *
 * @apiParam {String} agentId 智能体ID
 * @apiBody {String} message 用户消息
 *
 * @apiSuccess {String} reply AI回复内容
 */
router.post('/:agentId/chat', optionalAuthenticateToken, handleAgentChat);

/**
 * @api {get} /agent/:agentId/history 获取智能体对话历史
 * @apiName GetAgentChatHistory
 * @apiGroup Agent
 * @apiDescription 获取用户与智能体的对话历史
 * @apiHeader {String} [Authorization] Bearer Token (可选)
 *
 * @apiParam {String} agentId 智能体ID
 * @apiQuery {String} [userId] 匿名用户的ID
 *
 * @apiSuccess {Array} history 对话历史列表
 */
router.get('/:agentId/history', optionalAuthenticateToken, handleGetAgentChatHistory);

/**
 * @api {get} /agent/:agentId/conversations 会话列表
 * @apiName ListAgentConversations
 * @apiGroup Agent
 * @apiDescription 列出用户与该智能体的会话列表（需登录）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} agentId 智能体ID
 *
 * @apiSuccess {Array} conversations 会话列表
 */
router.get('/:agentId/conversations', authenticateToken, handleListAgentConversations);

/**
 * @api {post} /agent/:agentId/conversations 创建会话
 * @apiName CreateAgentConversation
 * @apiGroup Agent
 * @apiDescription 创建新的智能体会话（需登录）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} agentId 智能体ID
 * @apiBody {String} [title] 会话标题
 *
 * @apiSuccess {Object} conversation 新建的会话
 */
router.post('/:agentId/conversations', authenticateToken, handleCreateAgentConversation);

/**
 * @api {get} /agent/:agentId/conversations/:conversationId 获取会话消息
 * @apiName GetAgentConversationMessages
 * @apiGroup Agent
 * @apiDescription 获取指定会话的消息（需登录）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} agentId 智能体ID
 * @apiParam {String} conversationId 会话ID
 *
 * @apiSuccess {Array} messages 消息列表
 */
router.get('/:agentId/conversations/:conversationId', authenticateToken, handleGetAgentConversationMessages);

/**
 * @api {post} /agent/:agentId/conversations/:conversationId/chat 会话内对话
 * @apiName ChatWithAgentInConversation
 * @apiGroup Agent
 * @apiDescription 在指定会话内与智能体对话（需登录，流式）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} agentId 智能体ID
 * @apiParam {String} conversationId 会话ID
 * @apiBody {String} message 用户消息
 */
router.post('/:agentId/conversations/:conversationId/chat', authenticateToken, handleAgentChatInConversation);

/**
 * @api {delete} /agent/:agentId/conversations/:conversationId 删除会话
 * @apiName DeleteAgentConversation
 * @apiGroup Agent
 * @apiDescription 删除指定的智能体会话（需登录）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} agentId 智能体ID
 * @apiParam {String} conversationId 会话ID
 *
 * @apiSuccess {String} message 删除成功消息
 */
router.delete('/:agentId/conversations/:conversationId', authenticateToken, handleDeleteAgentConversation);

export default router;
