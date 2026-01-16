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

// 默认 AI 提供商
export const DEFAULT_AI_PROVIDER = process.env.DEFAULT_AI_PROVIDER || 'deepseek';

// 向后兼容
export const API_KEY = process.env.API_KEY || DEEPSEEK_API_KEY;
export const BASE_URL = process.env.BASE_URL || DEEPSEEK_BASE_URL;
export const MODEL = process.env.MODEL || DEEPSEEK_MODEL;

export const SEED_ASR_CONFIG = {
  appId: process.env.SEED_ASR_APPID || '',
  apiKey: process.env.SEED_ASR_API_KEY || '',
  apiSecret: process.env.SEED_ASR_API_SECRET || '',
  apiUrl: process.env.SEED_ASR_API_URL || 'https://openspeech.bytedance.com/api/v3/auc/bigmodel/submit',
  resourceId: process.env.SEED_ASR_RESOURCE_ID || 'volc.seedasr.auc',
  audioConfig: {
    format: 'wav',
    codec: 'raw',
    rate: 16000,
    bits: 16,
    channel: 1
  }
};
