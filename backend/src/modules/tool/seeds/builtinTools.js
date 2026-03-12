import Tool from '../models/ToolSchema.js';

/**
 * 内置工具列表
 * 包含常用的系统工具
 */
const builtinTools = [
  {
    name: 'web_search',
    description: '搜索互联网获取最新信息',
    category: 'builtin',
    icon: '🔍',
    type: 'http',
    isPublic: true,
    published: true,
    httpConfig: {
      method: 'GET',
      url: 'https://api.duckduckgo.com/?q={query}&format=json',
      timeout: 10000,
    },
    inputs: [
      {
        name: 'query',
        type: 'string',
        description: '搜索关键词',
        required: true,
      },
    ],
    outputs: [{ name: 'results', type: 'array', description: '搜索结果列表' }],
    tags: ['搜索', '互联网', '信息'],
  },
  {
    name: 'calculator',
    description: '执行数学计算',
    category: 'builtin',
    icon: '🧮',
    type: 'function',
    isPublic: true,
    published: true,
    functionConfig: {
      code: `
        try {
          const result = eval(inputs.expression);
          return { result, expression: inputs.expression };
        } catch (e) {
          return { error: e.message };
        }
      `,
    },
    inputs: [
      {
        name: 'expression',
        type: 'string',
        description: '数学表达式，例如: 2 + 2 * 3',
        required: true,
      },
    ],
    outputs: [{ name: 'result', type: 'number', description: '计算结果' }],
    tags: ['计算', '数学'],
  },
  {
    name: 'text_formatter',
    description: '格式化文本（大小写转换、截断等）',
    category: 'builtin',
    icon: '📝',
    type: 'function',
    isPublic: true,
    published: true,
    functionConfig: {
      code: `
        const { text, operation } = inputs;
        switch (operation) {
          case 'uppercase': return { result: text.toUpperCase() };
          case 'lowercase': return { result: text.toLowerCase() };
          case 'trim': return { result: text.trim() };
          case 'length': return { result: text.length };
          case 'reverse': return { result: text.split('').reverse().join('') };
          default: return { result: text };
        }
      `,
    },
    inputs: [
      { name: 'text', type: 'string', description: '输入文本', required: true },
      {
        name: 'operation',
        type: 'string',
        description: '操作类型',
        required: true,
        enum: ['uppercase', 'lowercase', 'trim', 'length', 'reverse'],
      },
    ],
    outputs: [{ name: 'result', type: 'string', description: '处理后的文本' }],
    tags: ['文本', '格式化'],
  },
  {
    name: 'json_parser',
    description: '解析和格式化 JSON 数据',
    category: 'builtin',
    icon: '{}',
    type: 'function',
    isPublic: true,
    published: true,
    functionConfig: {
      code: `
        try {
          const parsed = JSON.parse(inputs.jsonString);
          return { result: parsed, formatted: JSON.stringify(parsed, null, 2) };
        } catch (e) {
          return { error: 'JSON 解析失败: ' + e.message };
        }
      `,
    },
    inputs: [
      {
        name: 'jsonString',
        type: 'string',
        description: 'JSON 字符串',
        required: true,
      },
    ],
    outputs: [{ name: 'result', type: 'object', description: '解析后的对象' }],
    tags: ['JSON', '数据处理'],
  },
  {
    name: 'date_formatter',
    description: '日期时间格式化和计算',
    category: 'builtin',
    icon: '📅',
    type: 'function',
    isPublic: true,
    published: true,
    functionConfig: {
      code: `
        const now = new Date();
        const target = inputs.date ? new Date(inputs.date) : now;
        const operation = inputs.operation || 'format';
        switch (operation) {
          case 'now': return { result: now.toISOString() };
          case 'format': return { result: target.toLocaleString('zh-CN') };
          case 'timestamp': return { result: target.getTime() };
          case 'diff': {
            const diff = Math.abs(now - target);
            const days = Math.floor(diff / 86400000);
            return { result: days, unit: 'days' };
          }
          default: return { result: target.toISOString() };
        }
      `,
    },
    inputs: [
      { name: 'date', type: 'string', description: '日期字符串（可选，默认当前时间）' },
      {
        name: 'operation',
        type: 'string',
        description: '操作类型',
        enum: ['now', 'format', 'timestamp', 'diff'],
      },
    ],
    outputs: [{ name: 'result', type: 'string', description: '处理结果' }],
    tags: ['日期', '时间', '格式化'],
  },
  {
    name: 'http_request',
    description: '发送自定义 HTTP 请求',
    category: 'builtin',
    icon: '🌐',
    type: 'http',
    isPublic: true,
    published: true,
    httpConfig: {
      method: 'GET',
      url: '{url}',
      timeout: 30000,
    },
    inputs: [
      { name: 'url', type: 'string', description: '请求 URL', required: true },
      { name: 'method', type: 'string', description: 'HTTP 方法', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
    ],
    outputs: [{ name: 'data', type: 'object', description: '响应数据' }],
    tags: ['HTTP', 'API', '网络'],
  },
];

/**
 * 初始化内置工具
 * 在应用启动时调用，将内置工具写入数据库
 */
export async function initBuiltinTools() {
  try {
    for (const toolData of builtinTools) {
      const exists = await Tool.findOne({ name: toolData.name, category: 'builtin' });

      if (!exists) {
        const tool = new Tool(toolData);
        await tool.save();
        console.log(`✅ 内置工具已创建: ${toolData.name}`);
      }
    }

    console.log('✅ 内置工具初始化完成');
  } catch (error) {
    console.error('❌ 内置工具初始化失败:', error.message);
  }
}

export default builtinTools;
