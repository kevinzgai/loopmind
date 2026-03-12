import LongTermMemory from '../models/LongTermMemorySchema.js';
import UserProfile from '../models/UserProfileSchema.js';

/**
 * 高级记忆服务
 * 管理长期记忆、用户画像
 */
class AdvancedMemoryService {
  /**
   * 从对话中提取并保存长期记忆
   * 由 LLM 分析对话内容，提取重要信息
   */
  async extractAndSaveMemory(agentId, userId, conversationText, conversationId) {
    try {
      // 简单的规则提取（生产环境可用 LLM 提取）
      const memories = this.extractMemoriesFromText(conversationText);

      for (const memory of memories) {
        await this.saveMemory(agentId, userId, {
          ...memory,
          sourceConversationId: conversationId,
        });
      }

      return memories.length;
    } catch (error) {
      console.error('❌ 提取记忆失败:', error.message);
      return 0;
    }
  }

  /**
   * 简单规则提取记忆（基于关键词匹配）
   */
  extractMemoriesFromText(text) {
    const memories = [];

    // 提取用户偏好相关信息
    const preferencePatterns = [
      { pattern: /我(喜欢|偏好|习惯|爱)[：:]?([\u4e00-\u9fa5a-zA-Z0-9]+)/g, type: 'preference' },
      { pattern: /我(不喜欢|讨厌|厌恶)[：:]?([\u4e00-\u9fa5a-zA-Z0-9]+)/g, type: 'preference', sentiment: 'negative' },
      { pattern: /我(是|叫|名字是)[：:]?([\u4e00-\u9fa5a-zA-Z0-9]+)/g, type: 'fact' },
      { pattern: /我(在|住在|工作在)[：:]?([\u4e00-\u9fa5a-zA-Z0-9]+)/g, type: 'fact' },
      { pattern: /我(会|擅长|精通)[：:]?([\u4e00-\u9fa5a-zA-Z0-9]+)/g, type: 'skill' },
      { pattern: /我的目标是([\u4e00-\u9fa5a-zA-Z0-9，。！？]+)/g, type: 'goal' },
    ];

    for (const { pattern, type, sentiment = 'neutral' } of preferencePatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        if (match[0] && match[0].length > 3) {
          memories.push({
            content: match[0],
            memoryType: type,
            sentiment,
            importance: type === 'goal' ? 5 : type === 'fact' ? 4 : 3,
            tags: [type],
          });
        }
      }
    }

    return memories;
  }

  /**
   * 保存单条长期记忆
   */
  async saveMemory(agentId, userId, memoryData) {
    try {
      // 检查是否已存在相似记忆（避免重复）
      const existing = await LongTermMemory.findOne({
        agentId,
        userId,
        content: memoryData.content,
        expired: false,
      });

      if (existing) {
        // 更新访问计数
        existing.accessCount += 1;
        existing.lastAccessedAt = new Date();
        await existing.save();
        return existing;
      }

      const memory = new LongTermMemory({
        agentId,
        userId,
        ...memoryData,
      });

      await memory.save();
      return memory;
    } catch (error) {
      console.error('❌ 保存记忆失败:', error.message);
      return null;
    }
  }

  /**
   * 获取用户的长期记忆
   */
  async getMemories(agentId, userId, options = {}) {
    const {
      memoryType,
      limit = 20,
      minImportance = 1,
      sortBy = 'importance',
    } = options;

    const query = {
      agentId,
      userId,
      expired: false,
      importance: { $gte: minImportance },
    };

    if (memoryType) {
      query.memoryType = memoryType;
    }

    const sortOptions = {};
    if (sortBy === 'importance') sortOptions.importance = -1;
    else if (sortBy === 'recent') sortOptions.updatedAt = -1;
    else if (sortBy === 'access') sortOptions.accessCount = -1;

    const memories = await LongTermMemory.find(query)
      .sort(sortOptions)
      .limit(limit);

    return memories;
  }

  /**
   * 搜索相关记忆（基于文本匹配）
   */
  async searchMemories(agentId, userId, queryText, limit = 5) {
    const memories = await LongTermMemory.find({
      agentId,
      userId,
      expired: false,
      $or: [
        { content: { $regex: queryText, $options: 'i' } },
        { tags: { $in: [queryText] } },
      ],
    })
      .sort({ importance: -1, accessCount: -1 })
      .limit(limit);

    return memories;
  }

  /**
   * 构建记忆上下文（用于注入到 Prompt）
   */
  async buildMemoryContext(agentId, userId, currentMessage = '') {
    try {
      // 获取高重要度记忆
      const importantMemories = await this.getMemories(agentId, userId, {
        minImportance: 3,
        limit: 10,
        sortBy: 'importance',
      });

      // 搜索相关记忆
      const relevantMemories = currentMessage
        ? await this.searchMemories(agentId, userId, currentMessage, 5)
        : [];

      // 合并去重
      const allMemories = [
        ...importantMemories,
        ...relevantMemories.filter(
          (rm) => !importantMemories.find((im) => im._id.toString() === rm._id.toString())
        ),
      ];

      if (allMemories.length === 0) return '';

      const memoryLines = allMemories.map((m) => `- [${m.memoryType}] ${m.content}`).join('\n');

      return `\n\n## 关于用户的记忆:\n${memoryLines}\n`;
    } catch (error) {
      console.error('❌ 构建记忆上下文失败:', error.message);
      return '';
    }
  }

  /**
   * 删除记忆
   */
  async deleteMemory(memoryId) {
    return await LongTermMemory.findByIdAndUpdate(memoryId, { expired: true });
  }

  /**
   * 清除用户的所有记忆
   */
  async clearMemories(agentId, userId) {
    return await LongTermMemory.updateMany(
      { agentId, userId },
      { expired: true }
    );
  }

  // ─── 用户画像 ────────────────────────────────────────────────────────────

  /**
   * 获取用户画像（不存在则创建）
   */
  async getUserProfile(userId) {
    let profile = await UserProfile.findOne({ userId });

    if (!profile) {
      profile = new UserProfile({
        userId,
        stats: { firstSeenAt: new Date(), lastSeenAt: new Date() },
      });
      await profile.save();
    }

    return profile;
  }

  /**
   * 更新用户画像统计
   */
  async updateProfileStats(userId, updates = {}) {
    const profile = await this.getUserProfile(userId);

    profile.stats.lastSeenAt = new Date();
    if (updates.newConversation) profile.stats.totalConversations += 1;
    if (updates.newMessage) profile.stats.totalMessages += 1;

    await profile.save();
    return profile;
  }

  /**
   * 更新用户偏好
   */
  async updateUserPreferences(userId, preferences) {
    const profile = await this.getUserProfile(userId);
    Object.assign(profile.preferences, preferences);
    await profile.save();
    return profile;
  }

  /**
   * 从对话中提取用户信息并更新画像
   */
  async updateProfileFromConversation(userId, conversationText) {
    try {
      const profile = await this.getUserProfile(userId);

      // 提取姓名
      const nameMatch = conversationText.match(/我(叫|是|名字是)[：:]?([\u4e00-\u9fa5]{2,4})/);
      if (nameMatch && !profile.basicInfo.name) {
        profile.basicInfo.name = nameMatch[2];
      }

      // 提取职业
      const occupationMatch = conversationText.match(
        /我(是|做|从事)([\u4e00-\u9fa5]{2,8})(工作|职业|行业|的)?/
      );
      if (occupationMatch && !profile.basicInfo.occupation) {
        profile.basicInfo.occupation = occupationMatch[2];
      }

      // 更新最后活跃时间
      profile.stats.lastSeenAt = new Date();
      profile.stats.totalMessages += 1;

      await profile.save();
      return profile;
    } catch (error) {
      console.error('❌ 更新用户画像失败:', error.message);
      return null;
    }
  }

  /**
   * 获取记忆摘要（用于显示给用户）
   */
  async getMemorySummary(agentId, userId) {
    const memories = await LongTermMemory.find({ agentId, userId, expired: false });

    const byType = {};
    for (const m of memories) {
      if (!byType[m.memoryType]) byType[m.memoryType] = [];
      byType[m.memoryType].push(m.content);
    }

    return {
      total: memories.length,
      byType,
      topImportant: memories
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 5)
        .map((m) => ({ content: m.content, type: m.memoryType, importance: m.importance })),
    };
  }
}

export default new AdvancedMemoryService();
