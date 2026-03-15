import Conversation from '../../models/ConversationSchema.js';
import Agent from '../../modules/agent/models/AgentSchema.js';
import User from '../../models/UserSchema.js';

/**
 * 对话数据分析服务
 * 提供丰富的统计、热词分析、趋势数据
 */
class AnalyticsService {
  /**
   * 获取 Token 消耗统计（按时段）
   */
  async getTokenUsage(userId = null, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const matchStage = { createdAt: { $gte: since }, 'tokenUsage.total': { $gt: 0 } };
    if (userId) matchStage.userId = userId;

    // 按天聚合
    const daily = await Conversation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          promptTokens: { $sum: '$tokenUsage.prompt' },
          completionTokens: { $sum: '$tokenUsage.completion' },
          totalTokens: { $sum: '$tokenUsage.total' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          date: { $dateFromParts: { year: '$_id.year', month: '$_id.month', day: '$_id.day' } },
          promptTokens: 1,
          completionTokens: 1,
          totalTokens: 1,
          _id: 0,
        },
      },
    ]);

    // 汇总
    const totalPrompt = daily.reduce((s, d) => s + d.promptTokens, 0);
    const totalCompletion = daily.reduce((s, d) => s + d.completionTokens, 0);
    const totalAll = daily.reduce((s, d) => s + d.totalTokens, 0);

    return { daily, totalPrompt, totalCompletion, totalAll, period: `${days}天` };
  }

  /**
   * 获取全局概览统计
   */
  async getOverviewStats(userId = null, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const baseQuery = userId ? { userId } : {};
    const timeQuery = { ...baseQuery, createdAt: { $gte: since } };

    const [totalConversations, totalMessages, activeAgents, newUsers] = await Promise.all([
      Conversation.countDocuments(baseQuery),
      Conversation.aggregate([
        { $match: baseQuery },
        { $project: { msgCount: { $size: { $ifNull: ['$messages', []] } } } },
        { $group: { _id: null, total: { $sum: '$msgCount' } } },
      ]),
      Conversation.distinct('agentId', timeQuery).then((ids) => ids.length),
      userId ? 0 : User.countDocuments({ createdAt: { $gte: since } }),
    ]);

    return {
      totalConversations,
      totalMessages: totalMessages[0]?.total || 0,
      activeAgents,
      newUsers,
      period: `${days}天`,
    };
  }

  /**
   * 获取每日对话趋势
   */
  async getDailyTrend(userId = null, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const matchStage = { createdAt: { $gte: since } };
    if (userId) matchStage.userId = userId;

    const trend = await Conversation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
          messages: {
            $sum: { $size: { $ifNull: ['$messages', []] } },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          count: 1,
          messages: 1,
          _id: 0,
        },
      },
    ]);

    return trend;
  }

  /**
   * 获取最活跃的智能体
   */
  async getTopAgents(userId = null, limit = 10, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const matchStage = { createdAt: { $gte: since } };
    if (userId) matchStage.userId = userId;

    const topAgents = await Conversation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$agentId',
          conversationCount: { $sum: 1 },
          messageCount: {
            $sum: { $size: { $ifNull: ['$messages', []] } },
          },
        },
      },
      { $sort: { conversationCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'agents',
          localField: '_id',
          foreignField: '_id',
          as: 'agent',
        },
      },
      { $unwind: { path: '$agent', preserveNullAndEmpty: true } },
      {
        $project: {
          agentId: '$_id',
          agentName: '$agent.name',
          agentAvatar: '$agent.avatar',
          conversationCount: 1,
          messageCount: 1,
          _id: 0,
        },
      },
    ]);

    return topAgents;
  }

  /**
   * 获取热词分析（用户消息中的高频词汇）
   */
  async getHotWords(userId = null, limit = 30, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const matchStage = { createdAt: { $gte: since } };
    if (userId) matchStage.userId = userId;

    const conversations = await Conversation.find(matchStage, 'messages').lean();

    // 统计词频
    const wordCount = {};
    const stopWords = new Set([
      '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
      '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
      '自己', '这', '那', '什么', '怎么', '可以', '吗', '吧', '啊', '哦', '嗯',
    ]);

    for (const conv of conversations) {
      for (const msg of conv.messages || []) {
        if (msg.role !== 'user') continue;

        // 提取中文词语（2-6字）
        const words = msg.content?.match(/[\u4e00-\u9fa5]{2,6}/g) || [];
        for (const word of words) {
          if (stopWords.has(word)) continue;
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      }
    }

    // 排序并返回 top N
    const hotWords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([word, count]) => ({ word, count }));

    return hotWords;
  }

  /**
   * 获取按小时分布的活跃时段
   */
  async getActivityByHour(userId = null, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const matchStage = { createdAt: { $gte: since } };
    if (userId) matchStage.userId = userId;

    const hourly = await Conversation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { hour: '$_id', count: 1, _id: 0 } },
    ]);

    // 补全 0-23 小时
    const result = Array.from({ length: 24 }, (_, h) => {
      const found = hourly.find((item) => item.hour === h);
      return { hour: h, count: found?.count || 0 };
    });

    return result;
  }

  /**
   * 获取平均对话长度趋势
   */
  async getAvgConversationLength(userId = null, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const matchStage = { createdAt: { $gte: since } };
    if (userId) matchStage.userId = userId;

    const result = await Conversation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          avgLength: {
            $avg: { $size: { $ifNull: ['$messages', []] } },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          avgLength: { $round: ['$avgLength', 1] },
          _id: 0,
        },
      },
    ]);

    return result;
  }

  /**
   * 获取用户增长趋势（管理员专用）
   */
  async getUserGrowthTrend(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const trend = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          count: 1,
          _id: 0,
        },
      },
    ]);

    return trend;
  }

  /**
   * 获取单个智能体的详细统计
   */
  async getAgentAnalytics(agentId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalConversations, trend, hourly] = await Promise.all([
      Conversation.countDocuments({ agentId }),
      this.getDailyTrend(null, days),
      this.getActivityByHour(null, days),
    ]);

    const avgMessages = await Conversation.aggregate([
      { $match: { agentId: agentId } },
      {
        $group: {
          _id: null,
          avg: { $avg: { $size: { $ifNull: ['$messages', []] } } },
        },
      },
    ]);

    return {
      totalConversations,
      avgMessagesPerConversation: avgMessages[0]?.avg?.toFixed(1) || 0,
      dailyTrend: trend,
      activityByHour: hourly,
    };
  }
}

export default new AnalyticsService();
