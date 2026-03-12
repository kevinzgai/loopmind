/**
 * 智能体功能管理服务
 */

import Agent from '../models/AgentSchema.js';

// 敏感词库
const SENSITIVE_WORDS = ['违法', '色情', '暴力', '恐怖', '诈骗'];

/**
 * 内容审查
 */
export function filterContent(text) {
  let filtered = text;
  SENSITIVE_WORDS.forEach(word => {
    filtered = filtered.replace(new RegExp(word, 'g'), '*'.repeat(word.length));
  });
  return filtered;
}

/**
 * 检查内容是否包含敏感词
 */
export function hasSensitiveContent(text) {
  return SENSITIVE_WORDS.some(word => text.includes(word));
}

/**
 * 获取智能体的功能配置
 */
export async function getAgentFeatures(agentId) {
  try {
    const agent = await Agent.findById(agentId).select('features');
    if (!agent) throw new Error('智能体不存在');
    return agent.features || {};
  } catch (error) {
    console.error('❌ 获取功能配置失败:', error.message);
    throw error;
  }
}

/**
 * 更新智能体的功能配置
 */
export async function updateAgentFeatures(agentId, creatorId, features) {
  try {
    const agent = await Agent.findById(agentId);
    if (!agent) throw new Error('智能体不存在');
    if (agent.creatorId.toString() !== creatorId.toString()) {
      throw new Error('无权限修改此智能体');
    }

    agent.features = { ...agent.features, ...features };
    await agent.save();
    console.log(`✅ 功能配置更新成功: ${agent.name}`);
    return agent.features;
  } catch (error) {
    console.error('❌ 更新功能配置失败:', error.message);
    throw error;
  }
}

/**
 * 添加变量
 */
export async function addVariable(agentId, creatorId, variable) {
  try {
    const agent = await Agent.findById(agentId);
    if (!agent) throw new Error('智能体不存在');
    if (agent.creatorId.toString() !== creatorId.toString()) {
      throw new Error('无权限修改此智能体');
    }

    if (!agent.variables) agent.variables = [];
    agent.variables.push(variable);
    await agent.save();
    console.log(`✅ 变量添加成功: ${variable.name}`);
    return agent.variables;
  } catch (error) {
    console.error('❌ 添加变量失败:', error.message);
    throw error;
  }
}

/**
 * 删除变量
 */
export async function removeVariable(agentId, creatorId, variableName) {
  try {
    const agent = await Agent.findById(agentId);
    if (!agent) throw new Error('智能体不存在');
    if (agent.creatorId.toString() !== creatorId.toString()) {
      throw new Error('无权限修改此智能体');
    }

    agent.variables = agent.variables.filter(v => v.name !== variableName);
    await agent.save();
    console.log(`✅ 变量删除成功: ${variableName}`);
    return agent.variables;
  } catch (error) {
    console.error('❌ 删除变量失败:', error.message);
    throw error;
  }
}

/**
 * 添加工具
 */
export async function addTool(agentId, creatorId, tool) {
  try {
    const agent = await Agent.findById(agentId);
    if (!agent) throw new Error('智能体不存在');
    if (agent.creatorId.toString() !== creatorId.toString()) {
      throw new Error('无权限修改此智能体');
    }

    if (!agent.tools) agent.tools = [];
    if (!agent.tools.find(t => t._id.toString() === tool._id.toString())) {
      agent.tools.push(tool);
    }
    await agent.save();
    console.log(`✅ 工具添加成功: ${tool.name}`);
    return agent.tools;
  } catch (error) {
    console.error('❌ 添加工具失败:', error.message);
    throw error;
  }
}

/**
 * 删除工具
 */
export async function removeTool(agentId, creatorId, toolId) {
  try {
    const agent = await Agent.findById(agentId);
    if (!agent) throw new Error('智能体不存在');
    if (agent.creatorId.toString() !== creatorId.toString()) {
      throw new Error('无权限修改此智能体');
    }

    agent.tools = agent.tools.filter(t => t._id.toString() !== toolId.toString());
    await agent.save();
    console.log(`✅ 工具删除成功: ${toolId}`);
    return agent.tools;
  } catch (error) {
    console.error('❌ 删除工具失败:', error.message);
    throw error;
  }
}

/**
 * 获取智能体的变量列表
 */
export async function getAgentVariables(agentId) {
  try {
    const agent = await Agent.findById(agentId).select('variables');
    if (!agent) throw new Error('智能体不存在');
    return agent.variables || [];
  } catch (error) {
    console.error('❌ 获取变量列表失败:', error.message);
    throw error;
  }
}

/**
 * 获取智能体的工具列表
 */
export async function getAgentTools(agentId) {
  try {
    const agent = await Agent.findById(agentId).select('tools');
    if (!agent) throw new Error('智能体不存在');
    return agent.tools || [];
  } catch (error) {
    console.error('❌ 获取工具列表失败:', error.message);
    throw error;
  }
}
