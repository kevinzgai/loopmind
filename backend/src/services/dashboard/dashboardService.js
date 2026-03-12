import Agent from '../../modules/agent/models/AgentSchema.js';
import Conversation from '../../models/ConversationSchema.js';
import User from '../../models/UserSchema.js';
import ApiKey from '../../models/ApiKeySchema.js';
import os from 'os';
import { execSync } from 'child_process';

/**
 * 获取仪表盘统计数据
 */
export async function getDashboardStats() {
  try {
    const [
      totalAgents,
      publishedAgents,
      totalConversations,
      totalMessages,
      totalUsers,
      activeUsersToday,
      totalApiKeys,
      activeApiKeys
    ] = await Promise.all([
      Agent.countDocuments(),
      Agent.countDocuments({ isPublished: true }),
      Conversation.countDocuments(),
      Conversation.aggregate([
        { $group: { _id: null, total: { $sum: '$messageCount' } } }
      ]),
      User.countDocuments(),
      User.countDocuments({
        lastLoginAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }),
      ApiKey.countDocuments(),
      ApiKey.countDocuments({ isActive: true })
    ]);

    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [lastWeekAgents, lastWeekConversations] = await Promise.all([
      Agent.countDocuments({ createdAt: { $gte: lastWeek } }),
      Conversation.countDocuments({ createdAt: { $gte: lastWeek } })
    ]);

    const previousWeek = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const [previousWeekAgents, previousWeekConversations] = await Promise.all([
      Agent.countDocuments({ createdAt: { $gte: previousWeek, $lt: lastWeek } }),
      Conversation.countDocuments({ createdAt: { $gte: previousWeek, $lt: lastWeek } })
    ]);

    const agentGrowthRate = previousWeekAgents > 0
      ? ((lastWeekAgents - previousWeekAgents) / previousWeekAgents * 100).toFixed(1)
      : lastWeekAgents > 0 ? 100 : 0;

    const conversationGrowthRate = previousWeekConversations > 0
      ? ((lastWeekConversations - previousWeekConversations) / previousWeekConversations * 100).toFixed(1)
      : lastWeekConversations > 0 ? 100 : 0;

    // 用 CPU 1分钟负载均值 / 核心数 计算真实系统负载
    const cpuCount = os.cpus().length || 1;
    const loadAvg1m = os.loadavg()[0] || 0;
    const systemLoad = Math.min(Math.round((loadAvg1m / cpuCount) * 100), 100);

    return {
      agents: {
        total: totalAgents,
        published: publishedAgents,
        weeklyGrowth: parseFloat(agentGrowthRate),
        lastWeekNew: lastWeekAgents
      },
      conversations: {
        total: totalConversations,
        totalMessages: totalMessages[0]?.total || 0,
        weeklyGrowth: parseFloat(conversationGrowthRate),
        lastWeekNew: lastWeekConversations
      },
      users: {
        total: totalUsers,
        activeToday: activeUsersToday
      },
      apiKeys: {
        total: totalApiKeys,
        active: activeApiKeys
      },
      system: {
        load: systemLoad,
        status: systemLoad < 50 ? '运行平稳' : systemLoad < 80 ? '负载较高' : '负载过高',
        cpuCores: cpuCount,
        loadAvg1m: loadAvg1m.toFixed(2)
      }
    };
  } catch (error) {
    console.error('❌ 获取仪表盘统计数据失败:', error.message);
    throw error;
  }
}

/**
 * 获取趋势数据（最近N天）
 */
export async function getTrendData(days = 7) {
  try {
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [conversations, messages, newUsers] = await Promise.all([
        Conversation.countDocuments({
          createdAt: { $gte: date, $lt: nextDate }
        }),
        Conversation.aggregate([
          { $match: { createdAt: { $gte: date, $lt: nextDate } } },
          { $group: { _id: null, total: { $sum: '$messageCount' } } }
        ]),
        User.countDocuments({
          createdAt: { $gte: date, $lt: nextDate }
        })
      ]);

      result.push({
        date: date.toISOString().split('T')[0],
        conversations,
        messages: messages[0]?.total || 0,
        newUsers
      });
    }

    return result;
  } catch (error) {
    console.error('❌ 获取趋势数据失败:', error.message);
    throw error;
  }
}

/**
 * 获取热门智能体
 */
export async function getTopAgents(limit = 5) {
  try {
    const agents = await Agent.find({ isPublished: true })
      .sort({ usageCount: -1, userCount: -1 })
      .limit(limit)
      .select('name description avatar category usageCount userCount')
      .lean();

    return agents.map(agent => ({
      ...agent,
      id: agent._id.toString()
    }));
  } catch (error) {
    console.error('❌ 获取热门智能体失败:', error.message);
    throw error;
  }
}

/**
 * 获取分类统计
 */
export async function getCategoryStats() {
  try {
    const stats = await Agent.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return stats.map(item => ({
      category: item._id || '未分类',
      count: item.count
    }));
  } catch (error) {
    console.error('❌ 获取分类统计失败:', error.message);
    throw error;
  }
}

/**
 * 获取系统详细信息
 */
export async function getSystemDetails() {
  try {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    const loadAvg = os.loadavg();
    
    let diskUsage = null;
    try {
      if (process.platform === 'darwin' || process.platform === 'linux') {
        const dfOutput = execSync('df -k / 2>/dev/null | tail -1', { encoding: 'utf-8' });
        const parts = dfOutput.trim().split(/\s+/);
        if (parts.length >= 4) {
          const total = parseInt(parts[1], 10) * 1024;
          const used = parseInt(parts[2], 10) * 1024;
          const available = parseInt(parts[3], 10) * 1024;
          diskUsage = {
            total,
            used,
            available,
            usedPercent: total > 0 ? ((used / total) * 100).toFixed(1) : 0
          };
        }
      }
    } catch (e) {
      console.warn('无法获取磁盘信息:', e.message);
    }

    const uptimeSeconds = (() => { try { return os.uptime(); } catch(e) { return process.uptime(); } })();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    
    const processMemory = process.memoryUsage();
    
    return {
      cpu: {
        model: cpus[0]?.model || 'Unknown',
        cores: cpus.length,
        speed: cpus[0]?.speed || 0,
        loadAverage: {
          '1min': loadAvg[0]?.toFixed(2) || 0,
          '5min': loadAvg[1]?.toFixed(2) || 0,
          '15min': loadAvg[2]?.toFixed(2) || 0
        },
        usagePercent: loadAvg[0] > 0 ? Math.min(Math.round((loadAvg[0] / cpus.length) * 100), 100) : 0
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usedPercent: totalMemory > 0 ? ((usedMemory / totalMemory) * 100).toFixed(1) : 0,
        process: {
          heapTotal: processMemory.heapTotal,
          heapUsed: processMemory.heapUsed,
          rss: processMemory.rss
        }
      },
      disk: diskUsage,
      os: {
        platform: process.platform,
        arch: process.arch,
        hostname: os.hostname(),
        type: os.type(),
        release: os.release(),
        uptime: {
          seconds: uptimeSeconds,
          formatted: `${days}天 ${hours}小时 ${minutes}分钟`
        }
      },
      node: {
        version: process.version,
        uptime: Math.floor(process.uptime()),
        pid: process.pid
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ 获取系统详细信息失败:', error.message);
    throw error;
  }
}

export default {
  getDashboardStats,
  getTrendData,
  getTopAgents,
  getCategoryStats,
  getSystemDetails
};
