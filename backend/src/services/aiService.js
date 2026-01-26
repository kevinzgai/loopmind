import OpenAI from 'openai';
import { DEFAULT_AI_PROVIDER } from '../config/config.js';
import { getRawConfigCached } from './configService.js';

async function getProviderConfig(provider) {
    const cfg = await getRawConfigCached();
    const p = provider || cfg.provider || DEFAULT_AI_PROVIDER;
    if (p === 'qwen') {
        const client = new OpenAI({ apiKey: cfg.qwen.apiKey, baseURL: cfg.qwen.baseURL });
        return { client, model: cfg.qwen.model || 'qwen-turbo', name: '通义千问' };
    }
    if (p === 'doubao') {
        const client = new OpenAI({ apiKey: cfg.doubao.apiKey, baseURL: cfg.doubao.baseURL });
        return { client, model: cfg.doubao.model || 'doubao-pro-4k', name: '火山引擎' };
    }
    if (p === 'glm') {
        const client = new OpenAI({ apiKey: cfg.glm.apiKey, baseURL: cfg.glm.baseURL });
        return { client, model: cfg.glm.model || 'glm-4-flash', name: '智谱GLM' };
    }
    if (p === 'moonshot') {
        const client = new OpenAI({ apiKey: cfg.moonshot.apiKey, baseURL: cfg.moonshot.baseURL });
        return { client, model: cfg.moonshot.model || 'moonshot-v1-8k', name: 'Kimi (Moonshot)' };
    }
    if (p === 'modelscope') {
        const client = new OpenAI({ apiKey: cfg.modelscope.apiKey, baseURL: cfg.modelscope.baseURL });
        return { client, model: cfg.modelscope.model || 'Qwen/Qwen2.5-72B-Instruct', name: 'ModelScope (魔搭)' };
    }
    if (p === 'minimax') {
        const client = new OpenAI({ apiKey: cfg.minimax.apiKey, baseURL: cfg.minimax.baseURL });
        return { client, model: cfg.minimax.model || 'abab6.5s-chat', name: 'MiniMax' };
    }
    const client = new OpenAI({ apiKey: cfg.deepseek.apiKey, baseURL: cfg.deepseek.baseURL });
    return { client, model: cfg.deepseek.model || 'deepseek-chat', name: 'DeepSeek' };
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
export function addMessageToHistory(userId, message, provider = DEFAULT_AI_PROVIDER) {
    const key = `${userId}_${provider}`;
    const history = getConversationHistory(userId, provider);
    history.push(message);
}

// 调用AI API（流式）
export async function callAIStream(conversationHistory, provider = DEFAULT_AI_PROVIDER) {
    const { client, model, name } = await getAIProvider(provider);
    console.log(`🤖 Using AI provider: ${name} (${model})`);
    
    return await client.chat.completions.create({
        messages: conversationHistory,
        model: model,
        stream: true,
    });
}

// 调用AI API（非流式）
export async function callAI(conversationHistory, provider = DEFAULT_AI_PROVIDER) {
    const { client, model, name } = await getAIProvider(provider);
    console.log(`🤖 Using AI provider: ${name} (${model})`);
    
    return await client.chat.completions.create({
        messages: conversationHistory,
        model: model,
    });
}

// 获取可用的 AI 提供商列表
export function getAvailableProviders() {
    return [
        { id: 'deepseek', name: 'DeepSeek', model: 'deepseek-chat' },
        { id: 'qwen', name: '通义千问', model: 'qwen-turbo' },
        { id: 'doubao', name: '火山引擎', model: 'doubao-pro-4k' },
        { id: 'glm', name: '智谱GLM', model: 'glm-4-flash' },
        { id: 'moonshot', name: 'Kimi (Moonshot)', model: 'moonshot-v1-8k' },
        { id: 'modelscope', name: 'ModelScope (魔搭)', model: 'Qwen/Qwen2.5-72B-Instruct' },
        { id: 'minimax', name: 'MiniMax', model: 'abab6.5s-chat' }
    ];
}
