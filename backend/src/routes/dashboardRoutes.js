import express from 'express';
import { optionalAuthenticateToken } from '../middleware/auth.middleware.js';
import {
  getDashboardStats,
  getTrendData,
  getTopAgents,
  getCategoryStats,
  getFullDashboard,
  getSystemDetails
} from '../controllers/dashboardController.js';

const router = express.Router();

/**
 * @api {get} /dashboard/stats 获取仪表盘统计数据
 * @apiName GetDashboardStats
 * @apiGroup Dashboard
 * @apiDescription 获取系统核心统计数据（智能体数、对话数、用户数等）
 * @apiHeader {String} Authorization Bearer Token (可选)
 *
 * @apiSuccess {Object} agents 智能体统计
 * @apiSuccess {Object} conversations 对话统计
 * @apiSuccess {Object} users 用户统计
 * @apiSuccess {Object} apiKeys API密钥统计
 * @apiSuccess {Object} system 系统状态
 */
router.get('/stats', optionalAuthenticateToken, getDashboardStats);

/**
 * @api {get} /dashboard/trend 获取趋势数据
 * @apiName GetTrendData
 * @apiGroup Dashboard
 * @apiDescription 获取最近N天的趋势数据
 * @apiHeader {String} Authorization Bearer Token (可选)
 * @apiQuery {Number} [days=7] 查询天数
 *
 * @apiSuccess {Array} trend 趋势数据数组
 */
router.get('/trend', optionalAuthenticateToken, getTrendData);

/**
 * @api {get} /dashboard/top-agents 获取热门智能体
 * @apiName GetTopAgents
 * @apiGroup Dashboard
 * @apiDescription 获取使用量最高的智能体列表
 * @apiHeader {String} Authorization Bearer Token (可选)
 * @apiQuery {Number} [limit=5] 返回数量
 *
 * @apiSuccess {Array} agents 热门智能体列表
 */
router.get('/top-agents', optionalAuthenticateToken, getTopAgents);

/**
 * @api {get} /dashboard/categories 获取分类统计
 * @apiName GetCategoryStats
 * @apiGroup Dashboard
 * @apiDescription 获取智能体分类统计
 * @apiHeader {String} Authorization Bearer Token (可选)
 *
 * @apiSuccess {Array} stats 分类统计数组
 */
router.get('/categories', optionalAuthenticateToken, getCategoryStats);

/**
 * @api {get} /dashboard/full 获取完整仪表盘数据
 * @apiName GetFullDashboard
 * @apiGroup Dashboard
 * @apiDescription 一次性获取所有仪表盘数据
 * @apiHeader {String} Authorization Bearer Token (可选)
 *
 * @apiSuccess {Object} stats 统计数据
 * @apiSuccess {Array} trend 趋势数据
 * @apiSuccess {Array} topAgents 热门智能体
 * @apiSuccess {Array} categoryStats 分类统计
 */
router.get('/full', optionalAuthenticateToken, getFullDashboard);

/**
 * @api {get} /dashboard/system-details 获取系统详细信息
 * @apiName GetSystemDetails
 * @apiGroup Dashboard
 * @apiDescription 获取系统 CPU、内存、硬盘等详细信息
 * @apiHeader {String} Authorization Bearer Token (可选)
 *
 * @apiSuccess {Object} cpu CPU信息
 * @apiSuccess {Object} memory 内存信息
 * @apiSuccess {Object} disk 磁盘信息
 * @apiSuccess {Object} os 操作系统信息
 * @apiSuccess {Object} node Node.js信息
 */
router.get('/system-details', optionalAuthenticateToken, getSystemDetails);

export default router;
