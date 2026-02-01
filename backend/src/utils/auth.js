// 认证工具：获取 Seed-ASR Token

// 使用 ES 模块语法导入配置
import { SEED_ASR_CONFIG } from '../config/config.js';

/**
 * 获取 Seed-ASR Token
 * @returns {Promise<string>} ASR Token
 */
export async function getAsrToken() {
  // 验证配置是否存在
  if (!SEED_ASR_CONFIG.apiKey) {
    throw new Error('缺少 SEED_ASR_API_KEY 配置');
  }
  
  // 目前直接返回 API Key 作为临时方案
  return SEED_ASR_CONFIG.apiKey;
}