import { ChatOpenAI } from "@langchain/openai";
import { ChatAlibabaTongyi } from "@langchain/community/chat_models/alibaba_tongyi";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { 
  ChatPromptTemplate, 
  MessagesPlaceholder 
} from "@langchain/core/prompts";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { getRawConfigCached } from './configService.js';

/**
 * LangChain 服务
 * 提供基于 LangChain 的模型调用、Chain 构建和 RAG 支持
 */

// 模型实例缓存
const modelCache = new Map();

/**
 * 获取模型实例
 */
export async function getModel(provider = 'deepseek') {
  // 获取最新配置
  const cfg = await getRawConfigCached();
  const p = provider || cfg.provider || 'deepseek';
  const cacheKey = `${p}_${JSON.stringify(cfg[p])}`;

  if (modelCache.has(cacheKey)) {
    return modelCache.get(cacheKey);
  }

  let model;
  
  // 基础 OpenAI 兼容配置
  const openAIConfig = {
    apiKey: cfg[p]?.apiKey || process.env[`${p.toUpperCase()}_API_KEY`],
    configuration: {
      baseURL: cfg[p]?.baseURL,
    },
    modelName: cfg[p]?.model,
    streaming: true,
    temperature: 0.7,
  };

  if (p === 'qwen') {
    model = new ChatAlibabaTongyi({
      alibabaApiKey: cfg.qwen.apiKey || process.env.QWEN_API_KEY,
      modelName: cfg.qwen.model || "qwen-turbo",
      streaming: true,
    });
  } else if (p === 'doubao') {
    const m = (cfg.doubao.model || '').trim();
    model = new ChatOpenAI({
      ...openAIConfig,
      modelName: m && m !== 'doubao-pro-4k' ? m : 'doubao-seed-1-8-251228',
    });
  } else if (p === 'glm') {
    model = new ChatOpenAI({
      ...openAIConfig,
      modelName: cfg.glm.model || 'glm-4-flash',
    });
  } else if (p === 'moonshot') {
    model = new ChatOpenAI({
      ...openAIConfig,
      modelName: cfg.moonshot.model || 'moonshot-v1-8k',
    });
  } else if (p === 'modelscope') {
    model = new ChatOpenAI({
      ...openAIConfig,
      modelName: cfg.modelscope.model || 'Qwen/Qwen2.5-72B-Instruct',
    });
  } else if (p === 'minimax') {
    model = new ChatOpenAI({
      ...openAIConfig,
      modelName: cfg.minimax.model || 'abab6.5s-chat',
    });
  } else if (p === 'ollama') {
    model = new ChatOpenAI({
      apiKey: cfg.ollama.apiKey || 'ollama',
      configuration: {
        baseURL: cfg.ollama.baseURL || 'http://localhost:11434/v1',
      },
      modelName: cfg.ollama.model || 'llama3.1:8b',
    });
  } else {
    // 默认 DeepSeek
    model = new ChatOpenAI({
      apiKey: cfg.deepseek.apiKey || process.env.DEEPSEEK_API_KEY,
      configuration: {
        baseURL: cfg.deepseek.baseURL || "https://api.deepseek.com",
      },
      modelName: cfg.deepseek.model || "deepseek-chat",
      streaming: true,
      temperature: 0.7,
    });
  }

  // 清除旧缓存并存入新实例
  modelCache.clear(); 
  modelCache.set(cacheKey, model);
  return model;
}

/**
 * 基础流式调用
 */
export async function callLangChainStream(messages, provider = 'deepseek') {
  const model = await getModel(provider);
  
  // 将通用消息格式转换为 LangChain 消息格式
  const langChainMessages = messages.map(msg => {
    if (msg.role === 'system') return ["system", msg.content];
    if (msg.role === 'user') return ["user", msg.content];
    if (msg.role === 'assistant') return ["assistant", msg.content];
    return ["user", msg.content];
  });

  const prompt = ChatPromptTemplate.fromMessages(langChainMessages);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  return await chain.stream({});
}

/**
 * 带有 RAG 检索的 Chain 调用 (示例结构)
 */
export async function createRAGChain(modelProvider, retriever) {
  const model = await getModel(modelProvider);
  
  const qaPrompt = ChatPromptTemplate.fromMessages([
    ["system", "你是一个专业的 AI 助手。请根据以下提供的上下文来回答用户的问题。如果你不知道答案，就说你不知道，不要编造答案。\n\n上下文：\n{context}"],
    new MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
  ]);

  const ragChain = RunnableSequence.from([
    {
      context: retriever,
      input: new RunnablePassthrough(),
      chat_history: new RunnablePassthrough(),
    },
    qaPrompt,
    model,
    new StringOutputParser(),
  ]);

  return ragChain;
}

export default {
  getModel,
  callLangChainStream,
  createRAGChain
};
