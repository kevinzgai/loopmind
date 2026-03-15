import analyticsService from '../services/analytics/analyticsService.js';
import { success, error } from '../utils/response.js';

class AnalyticsController {
  /**
   * 获取 Token 消耗统计
   */
  async getTokenUsage(req, res) {
    try {
      const userId = req.user?.id;
      const { days = 30 } = req.query;
      const result = await analyticsService.getTokenUsage(userId, parseInt(days));
      return success(res, result, '获取 Token 消耗统计成功');
    } catch (err) {
      console.error('❌ 获取 Token 消耗统计失败:', err.message);
      return error(res, '获取 Token 消耗统计失败', -1, 500);
    }
  }

  /**
   * 获取概览统计
   */
  async getOverview(req, res) {
    try {
      const userId = req.user?.id;
      const { days = 30 } = req.query;
      const stats = await analyticsService.getOverviewStats(userId, parseInt(days));
      return success(res, stats, '获取概览统计成功');
    } catch (err) {
      console.error('❌ 获取概览统计失败:', err.message);
      return error(res, '获取概览统计失败', -1, 500);
    }
  }

  /**
   * 获取每日趋势
   */
  async getDailyTrend(req, res) {
    try {
      const userId = req.user?.id;
      const { days = 30 } = req.query;
      const trend = await analyticsService.getDailyTrend(userId, parseInt(days));
      return success(res, trend, '获取每日趋势成功');
    } catch (err) {
      console.error('❌ 获取每日趋势失败:', err.message);
      return error(res, '获取每日趋势失败', -1, 500);
    }
  }

  /**
   * 获取热门智能体
   */
  async getTopAgents(req, res) {
    try {
      const userId = req.user?.id;
      const { limit = 10, days = 30 } = req.query;
      const agents = await analyticsService.getTopAgents(userId, parseInt(limit), parseInt(days));
      return success(res, agents, '获取热门智能体成功');
    } catch (err) {
      console.error('❌ 获取热门智能体失败:', err.message);
      return error(res, '获取热门智能体失败', -1, 500);
    }
  }

  /**
   * 获取热词分析
   */
  async getHotWords(req, res) {
    try {
      const userId = req.user?.id;
      const { limit = 30, days = 30 } = req.query;
      const hotWords = await analyticsService.getHotWords(userId, parseInt(limit), parseInt(days));
      return success(res, hotWords, '获取热词分析成功');
    } catch (err) {
      console.error('❌ 获取热词分析失败:', err.message);
      return error(res, '获取热词分析失败', -1, 500);
    }
  }

  /**
   * 获取活跃时段分布
   */
  async getActivityByHour(req, res) {
    try {
      const userId = req.user?.id;
      const { days = 30 } = req.query;
      const hourly = await analyticsService.getActivityByHour(userId, parseInt(days));
      return success(res, hourly, '获取活跃时段成功');
    } catch (err) {
      console.error('❌ 获取活跃时段失败:', err.message);
      return error(res, '获取活跃时段失败', -1, 500);
    }
  }

  /**
   * 获取平均对话长度趋势
   */
  async getAvgLength(req, res) {
    try {
      const userId = req.user?.id;
      const { days = 30 } = req.query;
      const result = await analyticsService.getAvgConversationLength(userId, parseInt(days));
      return success(res, result, '获取平均对话长度成功');
    } catch (err) {
      console.error('❌ 获取平均对话长度失败:', err.message);
      return error(res, '获取平均对话长度失败', -1, 500);
    }
  }

  /**
   * 获取用户增长趋势（管理员）
   */
  async getUserGrowth(req, res) {
    try {
      const { days = 30 } = req.query;
      const trend = await analyticsService.getUserGrowthTrend(parseInt(days));
      return success(res, trend, '获取用户增长趋势成功');
    } catch (err) {
      console.error('❌ 获取用户增长趋势失败:', err.message);
      return error(res, '获取用户增长趋势失败', -1, 500);
    }
  }

  /**
   * 获取智能体分析
   */
  async getAgentAnalytics(req, res) {
    try {
      const { agentId } = req.params;
      const { days = 30 } = req.query;
      const result = await analyticsService.getAgentAnalytics(agentId, parseInt(days));
      return success(res, result, '获取智能体分析成功');
    } catch (err) {
      console.error('❌ 获取智能体分析失败:', err.message);
      return error(res, err.message, -1, 500);
    }
  }
}

export default new AnalyticsController();
