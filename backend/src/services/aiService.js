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
        { id: 'qwen', name: '通义千问', model: 'qwen-turbo' }
    ];
}
