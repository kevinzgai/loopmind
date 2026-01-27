import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '..', '..', '.env') });
// 端口配置
export const PORT = process.env.PORT || 3001;

// DeepSeek 配置
export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
export const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

// 通义千问配置
export const QWEN_API_KEY = process.env.QWEN_API_KEY;
export const QWEN_BASE_URL = process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
export const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen-turbo';

// 火山引擎 (豆包) 配置
export const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY;
export const DOUBAO_BASE_URL = process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
export const DOUBAO_MODEL = process.env.DOUBAO_MODEL || 'doubao-pro-4k';

// 智谱 (GLM) 配置
export const GLM_API_KEY = process.env.GLM_API_KEY;
export const GLM_BASE_URL = process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
export const GLM_MODEL = process.env.GLM_MODEL || 'glm-4-flash';

// Moonshot (Kimi) 配置
export const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY;
export const MOONSHOT_BASE_URL = process.env.MOONSHOT_BASE_URL || 'https://api.moonshot.cn/v1';
export const MOONSHOT_MODEL = process.env.MOONSHOT_MODEL || 'moonshot-v1-8k';

// ModelScope (魔搭) 配置
export const MODELSCOPE_API_KEY = process.env.MODELSCOPE_API_KEY;
export const MODELSCOPE_BASE_URL = process.env.MODELSCOPE_BASE_URL || 'https://api-inference.modelscope.cn/v1';
export const MODELSCOPE_MODEL = process.env.MODELSCOPE_MODEL || 'Qwen/Qwen2.5-72B-Instruct';

// MiniMax 配置
export const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
export const MINIMAX_BASE_URL = process.env.MINIMAX_BASE_URL || 'https://api.minimax.chat/v1';
export const MINIMAX_MODEL = process.env.MINIMAX_MODEL || 'abab6.5s-chat';

// Ollama 本地模型配置
export const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '';
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

// 默认 AI 提供商
export const DEFAULT_AI_PROVIDER = process.env.DEFAULT_AI_PROVIDER || 'deepseek';

// 向后兼容
export const API_KEY = process.env.API_KEY || DEEPSEEK_API_KEY;
export const BASE_URL = process.env.BASE_URL || DEEPSEEK_BASE_URL;
export const MODEL = process.env.MODEL || DEEPSEEK_MODEL;
