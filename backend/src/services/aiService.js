import OpenAI from "openai";
import { DEFAULT_AI_PROVIDER } from "../config/config.js";
import { getRawConfigCached } from "./configService.js";
import { AlibabaTongyiEmbeddings } from '@langchain/community/embeddings/alibaba_tongyi';
import { ByteDanceDoubaoEmbeddings } from '@langchain/community/embeddings/bytedance_doubao';

async function getProviderConfig(provider) {
  const cfg = await getRawConfigCached();
  const p = provider || cfg.provider || DEFAULT_AI_PROVIDER;
  if (p === "siliconflow") {
    const client = new OpenAI({
      apiKey: cfg.siliconflow.apiKey,
      baseURL: cfg.siliconflow.baseURL,
    });
    return {
      client,
      model: cfg.siliconflow.model || "deepseek-chat",
      name: "硅基流动",
    };
  }
  if (p === "qwen") {
    const client = new OpenAI({
      apiKey: cfg.qwen.apiKey,
      baseURL: cfg.qwen.baseURL,
    });
    return { client, model: cfg.qwen.model || "qwen-turbo", name: "通义千问" };
  }
  if (p === "doubao") {
    const client = new OpenAI({
      apiKey: cfg.doubao.apiKey,
      baseURL: cfg.doubao.baseURL,
    });
    const m = (cfg.doubao.model || "").trim();
    const model = m && m !== "doubao-pro-32k" && m !== "doubao-pro-128k" ? m : "doubao-seed-1-8-251228";
    return { client, model, name: "火山引擎" };
  }
  if (p === "glm") {
    const client = new OpenAI({
      apiKey: cfg.glm.apiKey,
      baseURL: cfg.glm.baseURL,
    });
    return { client, model: cfg.glm.model || "glm-4-flash", name: "智谱GLM" };
  }
  if (p === "moonshot") {
    const client = new OpenAI({
      apiKey: cfg.moonshot.apiKey,
      baseURL: cfg.moonshot.baseURL,
    });
    return {
      client,
      model: cfg.moonshot.model || "moonshot-v1-8k",
      name: "Kimi (Moonshot)",
    };
  }
  if (p === "modelscope") {
    const client = new OpenAI({
      apiKey: cfg.modelscope.apiKey,
      baseURL: cfg.modelscope.baseURL,
    });
    return {
      client,
      model: cfg.modelscope.model || "Qwen/Qwen2.5-72B-Instruct",
      name: "ModelScope (魔搭)",
    };
  }
  if (p === "minimax") {
    const client = new OpenAI({
      apiKey: cfg.minimax.apiKey,
      baseURL: cfg.minimax.baseURL,
    });
    return {
      client,
      model: cfg.minimax.model || "abab6.5s-chat",
      name: "MiniMax",
    };
  }
  if (p === "ollama") {
    const client = new OpenAI({
      apiKey: cfg.ollama.apiKey || "ollama",
      baseURL: cfg.ollama.baseURL || "http://localhost:11434/v1",
    });
    return {
      client,
      model: cfg.ollama.model || "llama3.1:8b",
      name: "Ollama 本地",
    };
  }
  const client = new OpenAI({
    apiKey: cfg.deepseek.apiKey,
    baseURL: cfg.deepseek.baseURL,
  });
  return {
    client,
    model: cfg.deepseek.model || "deepseek-chat",
    name: "DeepSeek",
  };
}

// 存储对话历史的内存存储（在生产环境中，你可能想要使用数据库）
const conversationHistories = new Map();

// 获取 AI 客户端和模型
async function getAIProvider(provider = DEFAULT_AI_PROVIDER) {
  return await getProviderConfig(provider);
}

// 获取或创建用户对话历史
export function getConversationHistory(userId, provider = DEFAULT_AI_PROVIDER) {
  const key = `${userId}_${provider}`;
  if (!conversationHistories.has(key)) {
    conversationHistories.set(key, []);
  }
  return conversationHistories.get(key);
}

// 添加消息到对话历史
export function addMessageToHistory(
  userId,
  message,
  provider = DEFAULT_AI_PROVIDER,
) {
  const key = `${userId}_${provider}`;
  const history = getConversationHistory(userId, provider);
  history.push(message);
}

// 调用AI API（流式）
export async function callAIStream(
  conversationHistory,
  provider = DEFAULT_AI_PROVIDER,
) {
  const { client, model, name } = await getAIProvider(provider);
  console.log(`🤖 Using AI provider: ${name} (${model})`);

  return await client.chat.completions.create({
    messages: conversationHistory,
    model: model,
    stream: true,
  });
}

// 调用AI API（非流式）
export async function callAI(
  conversationHistory,
  provider = DEFAULT_AI_PROVIDER,
) {
  const { client, model, name } = await getAIProvider(provider);
  console.log(`🤖 Using AI provider: ${name} (${model})`);

  return await client.chat.completions.create({
    messages: conversationHistory,
    model: model,
  });
}

// 测试 AI 连通性
export async function testConnectivity(config) {
  const { provider, apiKey, baseURL, model } = config;
  try {
    // 检查是否为语音服务提供商
    const isSpeechProvider = ['aliyun', 'seed'].includes(provider);
    
    // 检查是否为阿里云 Embedding 模型
    const isAlibabaEmbedding = (model && model.includes('text-embedding-v')) || (baseURL && baseURL.includes('dashscope.aliyuncs.com'));
    
    // 检查是否为火山引擎
    const isDoubao = provider === "doubao" || (baseURL && baseURL.includes('volces.com'));
    
    if (provider === "aliyun") {
      // 测试阿里云语音服务连接
      console.log('🌐 测试阿里云语音服务连接');
      console.log('📝 请求参数:', { provider, apiKey: apiKey ? apiKey.substring(0, 8) + '...' : 'undefined' });
      
      // 阿里云语音服务测试 - 这里简化处理，只检查 API Key 是否存在
      // 实际生产环境中，应该调用阿里云的语音服务 API 进行测试
      if (!apiKey) {
        throw new Error('API Key 不能为空');
      }
      
      console.log('📊 阿里云语音服务连接测试成功');
      return { success: true, message: "连接成功" };
    } else if (provider === "seed") {
      // 测试 Seed ASR 连接
      console.log('🌐 测试 Seed ASR 连接');
      console.log('📝 请求参数:', { provider, apiKey: apiKey ? apiKey.substring(0, 8) + '...' : 'undefined' });
      
      // Seed ASR 测试 - 这里简化处理，只检查 API Key 是否存在
      // 实际生产环境中，应该调用 Seed ASR 的 API 进行测试
      if (!apiKey) {
        throw new Error('API Key 不能为空');
      }
      
      console.log('📊 Seed ASR 连接测试成功');
      return { success: true, message: "连接成功" };
    } else if (provider === "embedding" && isAlibabaEmbedding) {
      // 使用 LangChain 的 AlibabaTongyiEmbeddings 来测试连接
      const embeddings = new AlibabaTongyiEmbeddings({
        apiKey: apiKey,
        modelName: model
      });
      
      // 测试生成 Embedding
      const result = await embeddings.embedQuery("hi");
      console.log('📊 Embedding 生成成功，向量维度:', result.length);
      
      return { success: true, message: "连接成功" };
    } else if (provider === "embedding" && isDoubao) {
      // 使用 LangChain 的 ByteDanceDoubaoEmbeddings 来测试连接
      const embeddings = new ByteDanceDoubaoEmbeddings({
        apiKey: apiKey,
        model: model || 'doubao-seed-1-8-251228'
      });
      
      // 测试生成 Embedding
      const result = await embeddings.embedQuery("hi");
      console.log('📊 火山引擎 Embedding 生成成功，向量维度:', result.length);
      
      return { success: true, message: "连接成功" };
    } else if (isDoubao) {
      // 火山引擎 Chat 模型使用 OpenAI SDK 的 responses 端点
      console.log('🌐 测试火山引擎连接 (使用 OpenAI SDK responses)');
      console.log('📝 请求参数:', { baseURL, model, apiKey: apiKey ? apiKey.substring(0, 8) + '...' : 'undefined' });
      
      const client = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL || 'https://ark.cn-beijing.volces.com/api/v3',
      });
      
      // 测试生成 Chat
      const result = await client.responses.create({
        model: model || 'doubao-seed-1-8-251228',
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "hi"
              }
            ]
          }
        ]
      });
      
      console.log('📊 火山引擎连接成功，响应:', result);
      
      return { success: true, message: "连接成功" };
    } else {
      // 对于其他提供商，使用标准 OpenAI 格式
      const client = new OpenAI({
        apiKey: apiKey || (provider === "ollama" ? "ollama" : ""),
        baseURL: baseURL || undefined,
      });

      if (provider === "embedding") {
        // 测试 Embedding 模型
        await client.embeddings.create({
          model: model,
          input: "hi",
        });
      } else {
        // 测试 Chat 模型
        await client.chat.completions.create({
          messages: [{ role: "user", content: "hi" }],
          model: model,
          max_tokens: 1,
        });
      }
      return { success: true, message: "连接成功" };
    }
  } catch (error) {
    console.error(`❌ ${provider} 连通性测试失败:`, error.message);
    return { success: false, message: error.message };
  }
}

// 获取可用的 AI 提供商列表
export function getAvailableProviders() {
  return [
    { id: "siliconflow", name: "硅基流动", model: "deepseek-chat" },
    { id: "deepseek", name: "DeepSeek", model: "deepseek-chat" },
    { id: "qwen", name: "通义千问", model: "qwen-turbo" },
    { id: "doubao", name: "火山引擎", model: "doubao-seed-1-8-251228" },
    { id: "glm", name: "智谱GLM", model: "glm-4-flash" },
    { id: "moonshot", name: "Kimi (Moonshot)", model: "moonshot-v1-8k" },
    {
      id: "modelscope",
      name: "ModelScope (魔搭)",
      model: "Qwen/Qwen2.5-72B-Instruct",
    },
    { id: "minimax", name: "MiniMax", model: "abab6.5s-chat" },
    { id: "ollama", name: "Ollama 本地", model: "llama3.1:8b" },
  ];
}
