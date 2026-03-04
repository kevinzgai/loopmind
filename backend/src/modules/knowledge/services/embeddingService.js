import { getRawConfigCached } from '../../../services/database/configService.js';
import { OpenAIEmbeddings } from '@langchain/openai';
import { AlibabaTongyiEmbeddings } from '@langchain/community/embeddings/alibaba_tongyi';

/**
 * 向量化服务
 */

async function getEmbeddingClient() {
  const cfg = await getRawConfigCached();
  
  // 1. 优先使用新格式的 Embedding 配置（多个提供商，默认提供商）
  if (cfg.embedding?.provider && cfg.embedding?.providers) {
    const defaultProviderId = cfg.embedding.provider;
    const defaultProvider = cfg.embedding.providers.find(p => p.id === defaultProviderId);
    
    if (defaultProvider && defaultProvider.apiKey) {
      console.log('🔌 使用新格式 Embedding 配置:', {
        provider: defaultProvider.name,
        baseURL: defaultProvider.baseURL || 'Default OpenAI',
        model: defaultProvider.model || 'text-embedding-3-small',
        apiKeyPrefix: defaultProvider.apiKey.substring(0, 8) + '...'
      });
      
      // 对于阿里云，使用 LangChain 的 AlibabaTongyiEmbeddings
      if (defaultProvider.type === 'aliyun' || defaultProvider.id === 'aliyun') {
        return new AlibabaTongyiEmbeddings({
          apiKey: defaultProvider.apiKey,
          modelName: defaultProvider.model || 'text-embedding-v4'
        });
      }
      
      // 对于其他提供商，使用 OpenAIEmbeddings
      return new OpenAIEmbeddings({
        apiKey: defaultProvider.apiKey,
        model: defaultProvider.model || 'text-embedding-3-small',
        configuration: defaultProvider.baseURL ? {
          baseURL: defaultProvider.baseURL
        } : undefined
      });
    }
  }

  // 2. 兼容旧格式：使用专门的 Embedding 配置
  if (cfg.embedding?.apiKey) {
    console.log('🔌 使用旧格式 Embedding 配置:', {
      baseURL: cfg.embedding.baseURL || 'Default OpenAI',
      model: cfg.embedding.model || 'text-embedding-3-small',
      apiKeyPrefix: cfg.embedding.apiKey.substring(0, 8) + '...'
    });
    
    // 检查是否为阿里云
    if (cfg.embedding.baseURL && cfg.embedding.baseURL.includes('dashscope.aliyuncs.com')) {
      return new AlibabaTongyiEmbeddings({
        apiKey: cfg.embedding.apiKey,
        modelName: cfg.embedding.model || 'text-embedding-v4'
      });
    }
    
    return new OpenAIEmbeddings({
      apiKey: cfg.embedding.apiKey,
      model: cfg.embedding.model || 'text-embedding-3-small',
      configuration: cfg.embedding.baseURL ? {
        baseURL: cfg.embedding.baseURL
      } : undefined
    });
  }

  // 3. 备选：复用 OpenAI 或其他兼容接口的配置
  const baseURL = cfg.openai?.baseURL || cfg.qwen?.baseURL;
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

  // 检查是否为阿里云
  if (baseURL && baseURL.includes('dashscope.aliyuncs.com')) {
    return new AlibabaTongyiEmbeddings({
      apiKey: apiKey,
      modelName: model
    });
  }

  return new OpenAIEmbeddings({
    apiKey: apiKey,
    model: model,
    configuration: baseURL ? {
      baseURL: baseURL
    } : undefined
  });
}

/**
 * 将文本转换为向量
 * @param {string|string[]} text 文本或文本数组
 * @returns {Promise<number[][]>} 向量数组
 */
export async function generateEmbeddings(text) {
  try {
    const embeddingClient = await getEmbeddingClient();
    const texts = Array.isArray(text) ? text : [text];
    
    console.log(`🚀 开始生成 Embedding (数量: ${texts.length})`);

    const BATCH_SIZE = 10;
    
    if (texts.length <= BATCH_SIZE) {
      const embeddings = await embeddingClient.embedDocuments(texts);
      console.log(`✅ Embedding 生成成功 (向量维度: ${embeddings[0]?.length || 0})`);
      return embeddings;
    }

    console.log(`📦 文本数量超过 ${BATCH_SIZE}，分批处理中...`);
    const allEmbeddings = [];
    
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(texts.length / BATCH_SIZE);
      
      console.log(`📦 处理第 ${batchNum}/${totalBatches} 批 (${batch.length} 个文本)`);
      
      const batchEmbeddings = await embeddingClient.embedDocuments(batch);
      allEmbeddings.push(...batchEmbeddings);
    }
    
    console.log(`✅ Embedding 生成成功 (总计: ${allEmbeddings.length}, 向量维度: ${allEmbeddings[0]?.length || 0})`);
    
    return allEmbeddings;
  } catch (error) {
    console.error('❌ Embedding 生成失败详情:', {
      message: error.message,
      type: error.type,
      code: error.code,
      status: error.status,
      response: error.response?.data || error.response
    });

    if (error.status === 403) {
      throw new Error(`Embedding 服务权限不足 (403)。请检查：1. 账号是否已完成实名认证？ 2. 账户余额是否充足？ 3. API Key 是否正确？`);
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
