import axios from 'axios';
import vm from 'vm';

/**
 * 工具执行引擎
 * 支持 HTTP、函数、Webhook 等多种工具类型
 */
class ToolExecutor {
  /**
   * 执行工具
   */
  static async execute(tool, inputs = {}) {
    try {
      switch (tool.type) {
        case 'http':
          return await this.executeHttpTool(tool, inputs);
        case 'function':
          return await this.executeFunctionTool(tool, inputs);
        case 'webhook':
          return await this.executeWebhookTool(tool, inputs);
        case 'database':
          return await this.executeDatabaseTool(tool, inputs);
        default:
          throw new Error(`不支持的工具类型: ${tool.type}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 执行 HTTP 工具
   */
  static async executeHttpTool(tool, inputs) {
    const { httpConfig } = tool;

    try {
      // 构建请求 URL，替换参数
      let url = httpConfig.url;
      for (const [key, value] of Object.entries(inputs)) {
        url = url.replace(`{${key}}`, value);
      }

      // 构建请求头
      const headers = { ...httpConfig.headers };

      // 构建请求体
      let data = null;
      if (['POST', 'PUT'].includes(httpConfig.method)) {
        data = inputs;
      }

      // 发送请求
      const response = await axios({
        method: httpConfig.method,
        url,
        headers,
        data,
        timeout: httpConfig.timeout,
      });

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
      };
    }
  }

  /**
   * 执行函数工具
   */
  static async executeFunctionTool(tool, inputs) {
    try {
      const { functionConfig } = tool;

      // 创建沙箱环境
      const sandbox = {
        inputs,
        console,
        Math,
        JSON,
        Date,
        Array,
        Object,
        String,
        Number,
        Boolean,
      };

      // 创建虚拟机上下文
      const context = vm.createContext(sandbox);

      // 将代码包装在函数中执行，支持 return 语句
      const wrappedCode = `(function() { ${functionConfig.code} })()`;
      const script = new vm.Script(wrappedCode);
      const result = script.runInContext(context, { timeout: 5000 });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 执行 Webhook 工具
   */
  static async executeWebhookTool(tool, inputs) {
    // Webhook 工具的实现
    // 这里可以触发外部 Webhook
    return {
      success: true,
      data: { webhook: 'triggered' },
    };
  }

  /**
   * 执行数据库工具
   */
  static async executeDatabaseTool(tool, inputs) {
    // 数据库工具的实现
    // 这里可以执行数据库查询
    return {
      success: true,
      data: { database: 'query_executed' },
    };
  }

  /**
   * 验证工具输入
   */
  static validateInputs(tool, inputs) {
    const errors = [];

    for (const inputDef of tool.inputs) {
      const value = inputs[inputDef.name];

      // 检查必填字段
      if (inputDef.required && (value === undefined || value === null)) {
        errors.push(`缺少必填参数: ${inputDef.name}`);
      }

      // 检查类型
      if (value !== undefined && value !== null) {
        const actualType = typeof value;
        if (actualType !== inputDef.type) {
          errors.push(
            `参数 ${inputDef.name} 类型错误: 期望 ${inputDef.type}，实际 ${actualType}`
          );
        }
      }

      // 检查枚举值
      if (inputDef.enum && inputDef.enum.length > 0) {
        if (!inputDef.enum.includes(value)) {
          errors.push(
            `参数 ${inputDef.name} 值不在允许范围内: ${inputDef.enum.join(', ')}`
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default ToolExecutor;
