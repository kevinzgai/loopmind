import express from 'express';
import analyticsController from './analyticsController.js';
import { authenticateToken as authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

// Token 消耗统计
router.get('/tokens/usage', analyticsController.getTokenUsage.bind(analyticsController));

// 概览统计
router.get('/overview', analyticsController.getOverview.bind(analyticsController));

// 每日趋势
router.get('/trend/daily', analyticsController.getDailyTrend.bind(analyticsController));

// 热门智能体
router.get('/agents/top', analyticsController.getTopAgents.bind(analyticsController));

// 热词分析
router.get('/words/hot', analyticsController.getHotWords.bind(analyticsController));

// 活跃时段
router.get('/activity/hourly', analyticsController.getActivityByHour.bind(analyticsController));

// 平均对话长度
router.get('/conversations/avg-length', analyticsController.getAvgLength.bind(analyticsController));

// 用户增长趋势（管理员专用）
router.get('/users/growth', analyticsController.getUserGrowth.bind(analyticsController));

// 单个智能体分析
router.get('/agent/:agentId', analyticsController.getAgentAnalytics.bind(analyticsController));

export default router;
