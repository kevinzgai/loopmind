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
  handleGetMemory
} from '../controllers/agentController.js';
import { handleAgentChat } from '../controllers/agentChatController.js';
import { authenticateToken, optionalAuthenticateToken } from '../../../shared/middleware/authMiddleware.js';

const router = express.Router();

/**
 * 智能体路由
 */

// 公开路由

/**
 * GET /api/agent/published
 * 获取已发布的智能体列表（广场）
 */
router.get('/published', handleGetPublishedAgents);

// 受保护路由

/**
 * POST /api/agent/create
 * 创建智能体
 */
router.post('/create', authenticateToken, handleCreateAgent);

/**
 * GET /api/agent/my-agents
 * 获取用户的智能体列表
 */
router.get('/my-agents', authenticateToken, handleGetUserAgents);

/**
 * GET /api/agent/:agentId/memory
 * 获取用户与智能体的记忆
 */
router.get('/:agentId/memory', authenticateToken, handleGetMemory);

/**
 * POST /api/agent/:agentId/chat
 * 智能体对话
 */
router.post('/:agentId/chat', optionalAuthenticateToken, handleAgentChat);

/**
 * GET /api/agent/:agentId
 * 获取智能体详情
 */
router.get('/:agentId', handleGetAgent);

/**
 * PUT /api/agent/:agentId
 * 更新智能体
 */
router.put('/:agentId', authenticateToken, handleUpdateAgent);

/**
 * POST /api/agent/:agentId/publish
 * 发布智能体
 */
router.post('/:agentId/publish', authenticateToken, handlePublishAgent);

/**
 * POST /api/agent/:agentId/unpublish
 * 下架智能体
 */
router.post('/:agentId/unpublish', authenticateToken, handleUnpublishAgent);

/**
 * DELETE /api/agent/:agentId
 * 删除智能体
 */
router.delete('/:agentId', authenticateToken, handleDeleteAgent);

export default router;
