import AgentVersion from '../models/AgentVersionSchema.js';
import Agent from '../models/AgentSchema.js';

class AgentVersionService {
  /**
   * 保存当前版本快照
   */
  async createSnapshot(agentId, userId, changelog = '配置更新') {
    const agent = await Agent.findById(agentId);
    if (!agent) throw new Error('智能体不存在');

    // 获取最新版本号
    const latest = await AgentVersion.findOne({ agentId }).sort({ versionNumber: -1 });
    const versionNumber = (latest?.versionNumber || 0) + 1;
    const version = `1.0.${versionNumber}`;

    // 将当前版本设为非激活
    await AgentVersion.updateMany({ agentId }, { isActive: false });

    const snapshot = new AgentVersion({
      agentId,
      userId,
      version,
      versionNumber,
      changelog,
      isActive: true,
      isPublished: agent.published || false,
      snapshot: {
        name: agent.name,
        description: agent.description,
        avatar: agent.avatar,
        category: agent.category,
        model: agent.model,
        personality: agent.personality,
        initialMemory: agent.initialMemory,
        voiceConfig: agent.voiceConfig,
        knowledgeBaseId: agent.knowledgeBaseId,
        systemPrompt: agent.systemPrompt,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        tools: agent.tools,
        tags: agent.tags,
        published: agent.published,
      },
    });

    await snapshot.save();
    return snapshot;
  }

  /**
   * 获取版本历史
   */
  async getVersionHistory(agentId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [versions, total] = await Promise.all([
      AgentVersion.find({ agentId })
        .populate('userId', 'username avatar')
        .sort({ versionNumber: -1 })
        .skip(skip)
        .limit(limit),
      AgentVersion.countDocuments({ agentId }),
    ]);

    return {
      versions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * 获取特定版本
   */
  async getVersion(agentId, versionNumber) {
    const version = await AgentVersion.findOne({ agentId, versionNumber });
    if (!version) throw new Error(`版本 ${versionNumber} 不存在`);
    return version;
  }

  /**
   * 对比两个版本
   */
  async compareVersions(agentId, versionA, versionB) {
    const [a, b] = await Promise.all([
      this.getVersion(agentId, versionA),
      this.getVersion(agentId, versionB),
    ]);

    const changes = [];
    const fields = Object.keys(a.snapshot.toObject ? a.snapshot.toObject() : a.snapshot);

    for (const field of fields) {
      const valA = a.snapshot[field];
      const valB = b.snapshot[field];
      const strA = JSON.stringify(valA);
      const strB = JSON.stringify(valB);

      if (strA !== strB) {
        changes.push({ field, from: valA, to: valB });
      }
    }

    return {
      versionA: { number: versionA, createdAt: a.createdAt },
      versionB: { number: versionB, createdAt: b.createdAt },
      changes,
      changedCount: changes.length,
    };
  }

  /**
   * 回滚到指定版本
   */
  async rollback(agentId, targetVersionNumber, userId) {
    const targetVersion = await this.getVersion(agentId, targetVersionNumber);
    const agent = await Agent.findById(agentId);
    if (!agent) throw new Error('智能体不存在');

    // 先保存当前状态为新版本（回滚前备份）
    await this.createSnapshot(agentId, userId, `回滚前自动备份`);

    // 应用目标版本的配置
    const snap = targetVersion.snapshot;
    Object.assign(agent, {
      name: snap.name,
      description: snap.description,
      avatar: snap.avatar,
      category: snap.category,
      model: snap.model,
      personality: snap.personality,
      initialMemory: snap.initialMemory,
      voiceConfig: snap.voiceConfig,
      knowledgeBaseId: snap.knowledgeBaseId,
      systemPrompt: snap.systemPrompt,
      temperature: snap.temperature,
      maxTokens: snap.maxTokens,
      tools: snap.tools,
      tags: snap.tags,
    });

    await agent.save();

    // 保存回滚后的快照
    const newSnapshot = await this.createSnapshot(
      agentId,
      userId,
      `回滚至版本 v${targetVersion.version}`
    );

    return { agent, newSnapshot };
  }

  /**
   * 删除版本（不允许删除已发布版本）
   */
  async deleteVersion(agentId, versionNumber) {
    const version = await this.getVersion(agentId, versionNumber);

    if (version.isPublished) {
      throw new Error('不能删除已发布的版本');
    }
    if (version.isActive) {
      throw new Error('不能删除当前激活版本');
    }

    await AgentVersion.findByIdAndDelete(version._id);
    return { deleted: true, versionNumber };
  }
}

export default new AgentVersionService();
