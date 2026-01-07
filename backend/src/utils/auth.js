// 认证工具：获取 Seed-ASR Token

// 使用 ES 模块语法导入配置
import { SEED_ASR_CONFIG } from '../config/config.js';

/**
 * 获取 Seed-ASR Token
 * @returns {Promise<string>} ASR Token
 */
export async function getAsrToken() {
  // 这里需要根据豆包语音识别文档实现获取 Token 的逻辑
  // 目前直接返回环境变量中的 API Key
  // 实际使用时需要调用豆包 API 获取真实 Token
  
  // 验证配置是否存在
  if (!SEED_ASR_CONFIG.apiKey) {
    throw new Error('缺少 SEED_ASR_API_KEY 配置');
  }
  
  // 实际项目中，这里应该是调用豆包 API 获取 Token
  // 例如：
  // const response = await fetch('https://api.doubao.com/v1/token', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${SEED_ASR_CONFIG.apiKey}`
  //   },
  //   body: JSON.stringify({
  //     grant_type: 'client_credentials',
  //     client_id: SEED_ASR_CONFIG.appId,
  //     client_secret: SEED_ASR_CONFIG.apiSecret
  //   })
  // });
  // const data = await response.json();
  // return data.access_token;
  
  // 目前直接返回 API Key 作为临时方案
  return SEED_ASR_CONFIG.apiKey;
}