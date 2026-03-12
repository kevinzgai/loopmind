/**
 * 智能体功能管理控制器
 */

import {
  getAgentFeatures,
  updateAgentFeatures,
  addVariable,
  removeVariable,
  addTool,
  removeTool,
  getAgentVariables,
  getAgentTools
} from '../services/agentFeaturesService.js';

/**
 * 获取功能配置
 * GET /api/agent/:agentId/features
 */
export async function handleGetFeatures(req, res, next) {
  try {
    const { agentId } = req.params;
    const features = await getAgentFeatures(agentId);
    res.json({ code: 0, data: features, message: '获取功能配置成功' });
  } catch (error) {
    next(error);
  }
}

/**
 * 更新功能配置
 * PUT /api/agent/:agentId/features
 */
export async function handleUpdateFeatures(req, res, next) {
  try {
    const userId = req.user.userId;
    const { agentId } = req.params;
    const features = req.body;
    const result = await updateAgentFeatures(agentId, userId, features);
    res.json({ code: 0, data: result, message: '功能配置更新成功' });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取变量列表
 * GET /api/agent/:agentId/variables
 */
export async function handleGetVariables(req, res, next) {
  try {
    const { agentId } = req.params;
    const variables = await getAgentVariables(agentId);
    res.json({ code: 0, data: variables, message: '获取变量列表成功' });
  } catch (error) {
    next(error);
  }
}

/**
 * 添加变量
 * POST /api/agent/:agentId/variables
 */
export async function handleAddVariable(req, res, next) {
  try {
    const userId = req.user.userId;
    const { agentId } = req.params;
    const variable = req.body;
    const result = await addVariable(agentId, userId, variable);
    res.status(201).json({ code: 0, data: result, message: '变量添加成功' });
  } catch (error) {
    next(error);
  }
}

/**
 * 删除变量
 * DELETE /api/agent/:agentId/variables/:variableName
 */
export async function handleRemoveVariable(req, res, next) {
  try {
    const userId = req.user.userId;
    const { agentId, variableName } = req.params;
    const result = await removeVariable(agentId, userId, variableName);
    res.json({ code: 0, data: result, message: '变量删除成功' });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取工具列表
 * GET /api/agent/:agentId/tools
 */
export async function handleGetTools(req, res, next) {
  try {
    const { agentId } = req.params;
    const tools = await getAgentTools(agentId);
    res.json({ code: 0, data: tools, message: '获取工具列表成功' });
  } catch (error) {
    next(error);
  }
}

/**
 * 添加工具
 * POST /api/agent/:agentId/tools
 */
export async function handleAddTool(req, res, next) {
  try {
    const userId = req.user.userId;
    const { agentId } = req.params;
    const tool = req.body;
    const result = await addTool(agentId, userId, tool);
    res.status(201).json({ code: 0, data: result, message: '工具添加成功' });
  } catch (error) {
    next(error);
  }
}

/**
 * 删除工具
 * DELETE /api/agent/:agentId/tools/:toolId
 */
export async function handleRemoveTool(req, res, next) {
  try {
    const userId = req.user.userId;
    const { agentId, toolId } = req.params;
    const result = await removeTool(agentId, userId, toolId);
    res.json({ code: 0, data: result, message: '工具删除成功' });
  } catch (error) {
    next(error);
  }
}
