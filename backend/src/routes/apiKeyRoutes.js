import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  getMyApiKeys,
  createApiKey,
  deleteApiKey,
  toggleApiKeyStatus,
  getApiKeyStats,
  getAllApiKeysStats,
  getMyApiKey,
  resetMyApiKey
} from '../controllers/apiKeyController.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * @api {get} /api-keys/my-key 获取我的 API 密钥
 * @apiName GetMyApiKey
 * @apiGroup ApiKey
 * @apiDescription 获取当前用户的 API 密钥信息
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiSuccess {Object} apiKey API 密钥信息
 */
router.get('/my-key', getMyApiKey);

/**
 * @api {post} /api-keys/reset-key 重置我的 API 密钥
 * @apiName ResetMyApiKey
 * @apiGroup ApiKey
 * @apiDescription 重置当前用户的 API 密钥
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiSuccess {Object} apiKey 新的 API 密钥信息
 */
router.post('/reset-key', resetMyApiKey);

/**
 * @api {get} /api-keys 获取我的 API 密钥列表
 * @apiName GetMyApiKeys
 * @apiGroup ApiKey
 * @apiDescription 获取当前用户的所有 API 密钥
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiSuccess {Array} apiKeys API 密钥列表
 */
router.get('/', getMyApiKeys);

/**
 * @api {post} /api-keys 创建 API 密钥
 * @apiName CreateApiKey
 * @apiGroup ApiKey
 * @apiDescription 为当前用户创建新的 API 密钥
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiBody {String} name 密钥名称
 * @apiBody {String} [description] 密钥描述
 *
 * @apiSuccess {Object} apiKey 创建的 API 密钥信息
 */
router.post('/', createApiKey);

/**
 * @api {delete} /api-keys/:id 删除 API 密钥
 * @apiName DeleteApiKey
 * @apiGroup ApiKey
 * @apiDescription 删除指定的 API 密钥
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} id API 密钥ID
 *
 * @apiSuccess {String} message 删除成功消息
 */
router.delete('/:id', deleteApiKey);

/**
 * @api {patch} /api-keys/:id/toggle 切换 API 密钥状态
 * @apiName ToggleApiKeyStatus
 * @apiGroup ApiKey
 * @apiDescription 切换指定 API 密钥的启用/禁用状态
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} id API 密钥ID
 *
 * @apiSuccess {Object} apiKey 更新后的 API 密钥信息
 */
router.patch('/:id/toggle', toggleApiKeyStatus);

/**
 * @api {get} /api-keys/:id/stats 获取 API 密钥统计
 * @apiName GetApiKeyStats
 * @apiGroup ApiKey
 * @apiDescription 获取指定 API 密钥的使用统计信息
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} id API 密钥ID
 *
 * @apiSuccess {Object} stats API 密钥使用统计
 */
router.get('/:id/stats', getApiKeyStats);

/**
 * @api {get} /api-keys/stats/overview 获取所有 API 密钥统计概览
 * @apiName GetAllApiKeysStats
 * @apiGroup ApiKey
 * @apiDescription 获取当前用户所有 API 密钥的统计概览
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiSuccess {Array} stats 统计概览列表
 */
router.get('/stats/overview', getAllApiKeysStats);

export default router;
