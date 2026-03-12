import toolService from '../services/toolService.js';
import { success, error } from '../../../utils/response.js';

class ToolController {
  async createTool(req, res) {
    try {
      const userId = req.user.id;
      const tool = await toolService.createTool(userId, req.body);
      return success(res, tool, '工具创建成功');
    } catch (err) {
      console.error('❌ 创建工具失败:', err.message);
      return error(res, err.message, -1, 500);
    }
  }

  async getTools(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const result = await toolService.getUserTools(userId, parseInt(page), parseInt(limit));
      return success(res, result, '获取工具列表成功');
    } catch (err) {
      console.error('❌ 获取工具列表失败:', err.message);
      return error(res, '获取工具列表失败', -1, 500);
    }
  }

  async getPublicTools(req, res) {
    try {
      const { page = 1, limit = 10, category } = req.query;
      const result = await toolService.getPublicTools(parseInt(page), parseInt(limit), category);
      return success(res, result, '获取公开工具列表成功');
    } catch (err) {
      console.error('❌ 获取公开工具失败:', err.message);
      return error(res, '获取公开工具列表失败', -1, 500);
    }
  }

  async getTool(req, res) {
    try {
      const { toolId } = req.params;
      const tool = await toolService.getTool(toolId);
      return success(res, tool, '获取工具成功');
    } catch (err) {
      console.error('❌ 获取工具失败:', err.message);
      return error(res, err.message, -1, 404);
    }
  }

  async updateTool(req, res) {
    try {
      const { toolId } = req.params;
      const tool = await toolService.updateTool(toolId, req.body);
      return success(res, tool, '工具更新成功');
    } catch (err) {
      console.error('❌ 更新工具失败:', err.message);
      return error(res, err.message, -1, 500);
    }
  }

  async deleteTool(req, res) {
    try {
      const { toolId } = req.params;
      await toolService.deleteTool(toolId);
      return success(res, null, '工具删除成功');
    } catch (err) {
      console.error('❌ 删除工具失败:', err.message);
      return error(res, err.message, -1, 500);
    }
  }

  async publishTool(req, res) {
    try {
      const { toolId } = req.params;
      const tool = await toolService.publishTool(toolId);
      return success(res, tool, '工具发布成功');
    } catch (err) {
      console.error('❌ 发布工具失败:', err.message);
      return error(res, err.message, -1, 500);
    }
  }

  async executeTool(req, res) {
    try {
      const { toolId } = req.params;
      const { inputs } = req.body;
      const result = await toolService.executeTool(toolId, inputs);
      return success(res, result, '工具执行成功');
    } catch (err) {
      console.error('❌ 执行工具失败:', err.message);
      return error(res, err.message, -1, 500);
    }
  }

  async searchTools(req, res) {
    try {
      const { q, page = 1, limit = 10 } = req.query;
      if (!q) return error(res, '搜索关键词不能为空', -1, 400);
      const result = await toolService.searchTools(q, parseInt(page), parseInt(limit));
      return success(res, result, '搜索工具成功');
    } catch (err) {
      console.error('❌ 搜索工具失败:', err.message);
      return error(res, '搜索工具失败', -1, 500);
    }
  }

  async getBuiltinTools(req, res) {
    try {
      const tools = await toolService.getBuiltinTools();
      return success(res, tools, '获取内置工具成功');
    } catch (err) {
      console.error('❌ 获取内置工具失败:', err.message);
      return error(res, '获取内置工具失败', -1, 500);
    }
  }

  async getToolStats(req, res) {
    try {
      const { toolId } = req.params;
      const stats = await toolService.getToolStats(toolId);
      return success(res, stats, '获取工具统计成功');
    } catch (err) {
      console.error('❌ 获取工具统计失败:', err.message);
      return error(res, err.message, -1, 500);
    }
  }
}

export default new ToolController();
