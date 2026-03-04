import * as dashboardService from '../services/dashboard/dashboardService.js';
import { success, error } from '../utils/response.js';

/**
 * 获取仪表盘统计数据
 */
export async function getDashboardStats(req, res) {
  try {
    const stats = await dashboardService.getDashboardStats();
    return success(res, stats, '获取统计数据成功');
  } catch (err) {
    console.error('❌ 获取仪表盘统计数据失败:', err.message);
    return error(res, '获取统计数据失败', -1, 500);
  }
}

/**
 * 获取趋势数据
 */
export async function getTrendData(req, res) {
  try {
    const days = parseInt(req.query.days) || 7;
    const trend = await dashboardService.getTrendData(days);
    return success(res, trend, '获取趋势数据成功');
  } catch (err) {
    console.error('❌ 获取趋势数据失败:', err.message);
    return error(res, '获取趋势数据失败', -1, 500);
  }
}

/**
 * 获取热门智能体
 */
export async function getTopAgents(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const agents = await dashboardService.getTopAgents(limit);
    return success(res, agents, '获取热门智能体成功');
  } catch (err) {
    console.error('❌ 获取热门智能体失败:', err.message);
    return error(res, '获取热门智能体失败', -1, 500);
  }
}

/**
 * 获取分类统计
 */
export async function getCategoryStats(req, res) {
  try {
    const stats = await dashboardService.getCategoryStats();
    return success(res, stats, '获取分类统计成功');
  } catch (err) {
    console.error('❌ 获取分类统计失败:', err.message);
    return error(res, '获取分类统计失败', -1, 500);
  }
}

/**
 * 获取完整仪表盘数据（一次性获取所有数据）
 */
export async function getFullDashboard(req, res) {
  try {
    const [stats, trend, topAgents, categoryStats] = await Promise.all([
      dashboardService.getDashboardStats(),
      dashboardService.getTrendData(7),
      dashboardService.getTopAgents(5),
      dashboardService.getCategoryStats()
    ]);

    return success(res, {
      stats,
      trend,
      topAgents,
      categoryStats
    }, '获取仪表盘数据成功');
  } catch (err) {
    console.error('❌ 获取完整仪表盘数据失败:', err.message);
    return error(res, '获取仪表盘数据失败', -1, 500);
  }
}

/**
 * 获取系统详细信息
 */
export async function getSystemDetails(req, res) {
  try {
    const details = await dashboardService.getSystemDetails();
    return success(res, details, '获取系统详细信息成功');
  } catch (err) {
    console.error('❌ 获取系统详细信息失败:', err.message);
    return error(res, '获取系统详细信息失败', -1, 500);
  }
}
