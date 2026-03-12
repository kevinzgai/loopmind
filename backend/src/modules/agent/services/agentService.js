import Agent from '../models/AgentSchema.js';
import AgentMemory from '../models/AgentMemorySchema.js';

/**
 * 智能体服务
 */

/**
 * 创建智能体
 */
export async function createAgent(creatorId, creatorName, agentData) {
  try {
    const agent = new Agent({
      ...agentData,
      creatorId,
      creatorName
    });

    await agent.save();
    console.log(`✅ 智能体创建成功: ${agent.name}`);
    return agent.toJSON();
  } catch (error) {
    console.error('❌ 创建智能体失败:', error.message);
    throw error;
  }
}

/**
 * 获取用户的智能体列表
 */
export async function getUserAgents(userId, options = {}) {
  try {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const agents = await Agent.find({ creatorId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Agent.countDocuments({ creatorId: userId });

    return {
      agents: agents.map(agent => ({
        ...agent,
        id: agent._id.toString()
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('❌ 获取用户智能体列表失败:', error.message);
    throw error;
  }
}

/**
 * 获取已发布的智能体列表（广场）
 */
export async function getPublishedAgents(options = {}) {
  try {
    const { page = 1, limit = 10, category, search } = options;
    const skip = (page - 1) * limit;

    const query = { isPublished: true };
    if (category && category !== '全部') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const agents = await Agent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Agent.countDocuments(query);

    return {
      agents: agents.map(agent => ({
        ...agent,
        id: agent._id.toString()
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('❌ 获取已发布智能体列表失败:', error.message);
    throw error;
  }
}

/**
 * 获取智能体详情
 */
export async function getAgent(agentId) {
  try {
    const agent = await Agent.findById(agentId).populate('knowledgeBaseId', 'name');

    if (!agent) {
      throw new Error('智能体不存在');
    }

    return agent.toJSON();
  } catch (error) {
    console.error('❌ 获取智能体详情失败:', error.message);
    throw error;
  }
}

/**
 * 更新智能体
 */
export async function updateAgent(agentId, creatorId, updateData) {
  try {
    const agent = await Agent.findById(agentId);

    if (!agent) {
      throw new Error('智能体不存在');
    }

    if (agent.creatorId.toString() !== creatorId.toString()) {
      throw new Error('无权限修改此智能体');
    }

    // 不允许修改已发布的智能体的名称
    // 其他配置均允许修改
    // 过滤掉空字符串的 ObjectId 字段，避免 Mongoose cast 报错
    const safeData = { ...updateData };
    if (safeData.knowledgeBaseId === '' || safeData.knowledgeBaseId === null) {
      delete safeData.knowledgeBaseId;
    }
    if (Array.isArray(safeData.knowledgeBaseIds)) {
      safeData.knowledgeBaseIds = safeData.knowledgeBaseIds.filter(id => id && id.toString().length === 24);
    }
    Object.assign(agent, safeData);
    agent.updatedAt = new Date();

    await agent.save();
    console.log(`✅ 智能体更新成功: ${agent.name}`);
    return agent.toJSON();
  } catch (error) {
    console.error('❌ 更新智能体失败:', error.message);
    throw error;
  }
}

/**
 * 发布智能体
 */
export async function publishAgent(agentId, creatorId) {
  try {
    const agent = await Agent.findById(agentId);

    if (!agent) {
      throw new Error('智能体不存在');
    }

    if (agent.creatorId.toString() !== creatorId.toString()) {
      throw new Error('无权限发布此智能体');
    }

    if (agent.isPublished) {
      throw new Error('智能体已发布');
    }

    agent.isPublished = true;
    agent.publishedAt = new Date();

    await agent.save();
    console.log(`✅ 智能体发布成功: ${agent.name}`);
    return agent.toJSON();
  } catch (error) {
    console.error('❌ 发布智能体失败:', error.message);
    throw error;
  }
}

/**
 * 下架智能体
 */
export async function unpublishAgent(agentId, creatorId) {
  try {
    const agent = await Agent.findById(agentId);

    if (!agent) {
      throw new Error('智能体不存在');
    }

    if (agent.creatorId.toString() !== creatorId.toString()) {
      throw new Error('无权限下架此智能体');
    }

    if (!agent.isPublished) {
      throw new Error('智能体未发布');
    }

    agent.isPublished = false;
    agent.publishedAt = null;

    await agent.save();
    console.log(`✅ 智能体下架成功: ${agent.name}`);
    return agent.toJSON();
  } catch (error) {
    console.error('❌ 下架智能体失败:', error.message);
    throw error;
  }
}
export async function deleteAgent(agentId, creatorId) {
  try {
    const agent = await Agent.findById(agentId);

    if (!agent) {
      throw new Error('智能体不存在');
    }

    if (agent.creatorId.toString() !== creatorId.toString()) {
      throw new Error('无权限删除此智能体');
    }

    if (agent.isPublished) {
      throw new Error('已发布的智能体不能删除');
    }

    await Agent.deleteOne({ _id: agentId });
    await AgentMemory.deleteMany({ agentId });

    console.log(`✅ 智能体删除成功: ${agent.name}`);
    return { message: '智能体已删除' };
  } catch (error) {
    console.error('❌ 删除智能体失败:', error.message);
    throw error;
  }
}

/**
 * 获取或创建用户与智能体的记忆
 */
export async function getOrCreateMemory(agentId, userId) {
  try {
    let memory = await AgentMemory.findOne({ agentId, userId });

    if (!memory) {
      memory = new AgentMemory({
        agentId,
        userId,
        content: '',
        contentLength: 0
      });
      await memory.save();
    }

    return memory.toJSON();
  } catch (error) {
    console.error('❌ 获取或创建记忆失败:', error.message);
    throw error;
  }
}

/**
 * 更新记忆内容
 */
export async function updateMemory(agentId, userId, newContent) {
  try {
    let memory = await AgentMemory.findOne({ agentId, userId });

    if (!memory) {
      memory = new AgentMemory({
        agentId,
        userId,
        content: newContent,
        contentLength: newContent.length
      });
    } else {
      memory.content = newContent;
      memory.contentLength = newContent.length;
    }

    memory.conversationCount += 1;
    memory.lastUpdatedAt = new Date();
    memory.updatedAt = new Date();

    await memory.save();
    return memory.toJSON();
  } catch (error) {
    console.error('❌ 更新记忆失败:', error.message);
    throw error;
  }
}

/**
 * 获取用户的记忆
 */
export async function getUserMemory(agentId, userId) {
  try {
    const memory = await AgentMemory.findOne({ agentId, userId });

    if (!memory) {
      return null;
    }

    return memory.toJSON();
  } catch (error) {
    console.error('❌ 获取用户记忆失败:', error.message);
    throw error;
  }
}

/**
 * 增加智能体使用次数
 */
export async function incrementUsageCount(agentId) {
  try {
    await Agent.updateOne(
      { _id: agentId },
      { $inc: { usageCount: 1 } }
    );
    console.log(`📊 智能体使用次数 +1: ${agentId}`);
  } catch (error) {
    console.error('❌ 增加使用次数失败:', error.message);
  }
}

/**
 * 更新智能体用户数
 */
export async function updateUserCount(agentId) {
  try {
    const userCount = await AgentMemory.countDocuments({ agentId });
    await Agent.updateOne(
      { _id: agentId },
      { userCount }
    );
  } catch (error) {
    console.error('❌ 更新用户数失败:', error.message);
  }
}
