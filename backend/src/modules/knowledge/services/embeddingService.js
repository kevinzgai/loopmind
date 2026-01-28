import { getRawConfigCached } from '../../../services/configService.js';
import OpenAI from 'openai';

/**
 * 向量化服务
 */

async function getEmbeddingClient() {
  const cfg = await getRawConfigCached();
  
  // 1. 优先使用专门的 Embedding 配置
  if (cfg.embedding?.apiKey) {
    console.log('🔌 使用专用 Embedding 配置:', {
      baseURL: cfg.embedding.baseURL || 'Default OpenAI',
      model: cfg.embedding.model || 'text-embedding-3-small',
      apiKeyPrefix: cfg.embedding.apiKey.substring(0, 8) + '...'
    });
    return {
      client: new OpenAI({
        baseURL: cfg.embedding.baseURL || undefined, // 如果为空则使用 OpenAI 默认
        apiKey: cfg.embedding.apiKey
      }),
      model: cfg.embedding.model || 'text-embedding-3-small'
    };
  }

  // 2. 备选：复用 OpenAI 或其他兼容接口的配置
  const baseURL = cfg.openai?.baseURL || cfg.qwen?.baseURL; // DeepSeek 不支持 Embedding，移除它作为默认
  const apiKey = cfg.openai?.apiKey || cfg.qwen?.apiKey;
  const model = cfg.openai?.model || 'text-embedding-3-small';
  
  if (!apiKey) {
    throw new Error('未配置 Embedding API Key。请在系统设置中配置 Embedding 专用密钥。');
  }

  console.log('🔌 使用备选 Embedding 配置:', {
    baseURL: baseURL || 'Default OpenAI',
    model: model,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'undefined'
  });

  return {
    client: new OpenAI({
      baseURL: baseURL || undefined,
      apiKey: apiKey
    }),
    model: model
  };
}

/**
 * 将文本转换为向量
 * @param {string|string[]} text 文本或文本数组
 * @returns {Promise<number[][]>} 向量数组
 */
export async function generateEmbeddings(text) {
  try {
    const { client, model } = await getEmbeddingClient();
    const texts = Array.isArray(text) ? text : [text];
    
    // console.log(`🚀 开始生成 Embedding (模型: ${model}, 数量: ${texts.length})`);

    const response = await client.embeddings.create({
      model,
      input: texts,
      encoding_format: 'float',
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('❌ Embedding 生成失败详情:', {
      message: error.message,
      type: error.type,
      code: error.code,
      status: error.status,
      response: error.response?.data || error.response
    });

    if (error.status === 403) {
      throw new Error(`Embedding 服务权限不足 (403)。请检查：1. 硅基流动账号是否已完成实名认证？ 2. 账户余额是否充足？ 3. API Key 是否正确？`);
    }

    throw error;
  }
}

/**
 * 生成单个文本的向量
 */
export async function generateEmbedding(text) {
  const embeddings = await generateEmbeddings(text);
  return embeddings[0];
}
