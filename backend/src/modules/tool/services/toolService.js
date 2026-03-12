import Tool from '../models/ToolSchema.js';
import ToolExecutor from './toolExecutor.js';

class ToolService {
  async createTool(userId, toolData) {
    const tool = new Tool({ userId, ...toolData });
    await tool.save();
    return tool;
  }

  async getUserTools(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const tools = await Tool.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Tool.countDocuments({ userId });
    return { tools, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getPublicTools(page = 1, limit = 10, category = null) {
    const skip = (page - 1) * limit;
    const query = { isPublic: true, published: true };
    if (category) query.category = category;
    const tools = await Tool.find(query).sort({ usageCount: -1 }).skip(skip).limit(limit);
    const total = await Tool.countDocuments(query);
    return { tools, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getTool(toolId) {
    const tool = await Tool.findById(toolId);
    if (!tool) throw new Error('工具不存在');
    return tool;
  }

  async updateTool(toolId, updates) {
    const tool = await Tool.findByIdAndUpdate(toolId, updates, { new: true });
    if (!tool) throw new Error('工具不存在');
    return tool;
  }

  async deleteTool(toolId) {
    const result = await Tool.findByIdAndDelete(toolId);
    if (!result) throw new Error('工具不存在');
    return result;
  }

  async publishTool(toolId) {
    const tool = await this.getTool(toolId);
    this.validateTool(tool);
    tool.published = true;
    await tool.save();
    return tool;
  }

  async unpublishTool(toolId) {
    const tool = await this.getTool(toolId);
    tool.published = false;
    await tool.save();
    return tool;
  }

  async executeTool(toolId, inputs = {}) {
    const tool = await this.getTool(toolId);
    const validation = ToolExecutor.validateInputs(tool, inputs);
    if (!validation.valid) throw new Error(`输入验证失败: ${validation.errors.join(', ')}`);
    const result = await ToolExecutor.execute(tool, inputs);
    tool.usageCount += 1;
    tool.lastUsedAt = new Date();
    await tool.save();
    return result;
  }

  validateTool(tool) {
    if (!tool.name) throw new Error('工具名称不能为空');
    if (!tool.type) throw new Error('工具类型不能为空');
    if (tool.type === 'http') {
      if (!tool.httpConfig?.url) throw new Error('HTTP 工具必须配置 URL');
      if (!tool.httpConfig?.method) throw new Error('HTTP 工具必须配置请求方法');
    }
    if (tool.type === 'function' && !tool.functionConfig?.code) {
      throw new Error('函数工具必须配置代码');
    }
    return true;
  }

  async getBuiltinTools() {
    return await Tool.find({ category: 'builtin', enabled: true });
  }

  async searchTools(query, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const filter = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [query] } },
      ],
      isPublic: true,
      published: true,
    };
    const tools = await Tool.find(filter).sort({ usageCount: -1 }).skip(skip).limit(limit);
    const total = await Tool.countDocuments(filter);
    return { tools, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getToolStats(toolId) {
    const tool = await this.getTool(toolId);
    return {
      name: tool.name,
      usageCount: tool.usageCount,
      lastUsedAt: tool.lastUsedAt,
      createdAt: tool.createdAt,
      updatedAt: tool.updatedAt,
    };
  }
}

export default new ToolService();
