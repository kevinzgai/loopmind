import OpenAI from 'openai';
import { 
    DEEPSEEK_API_KEY, 
    DEEPSEEK_BASE_URL, 
    DEEPSEEK_MODEL,
    QWEN_API_KEY,
    QWEN_BASE_URL,
    QWEN_MODEL,
    DEFAULT_AI_PROVIDER
} from '../config/config.js';

// 初始化 DeepSeek 客户端
const deepseekClient = new OpenAI({ 
    apiKey: DEEPSEEK_API_KEY, 
    baseURL: DEEPSEEK_BASE_URL
});

// 初始化通义千问客户端
const qwenClient = new OpenAI({ 
    apiKey: QWEN_API_KEY, 
    baseURL: QWEN_BASE_URL
});

// 打印配置信息（仅用于调试）
console.log('🔧 AI 服务配置:');
console.log(`  DeepSeek API Key: ${DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.substring(0, 10) + '...' + DEEPSEEK_API_KEY.slice(-4) : '未配置'}`);
console.log(`  DeepSeek Base URL: ${DEEPSEEK_BASE_URL}`);
console.log(`  DeepSeek Model: ${DEEPSEEK_MODEL}`);
console.log(`  Qwen API Key: ${QWEN_API_KEY ? QWEN_API_KEY.substring(0, 10) + '...' + QWEN_API_KEY.slice(-4) : '未配置'}`);
console.log(`  Qwen Base URL: ${QWEN_BASE_URL}`);
console.log(`  Qwen Model: ${QWEN_MODEL}`);
console.log(`  Default Provider: ${DEFAULT_AI_PROVIDER}`);
console.log('');

// AI 提供商配置
const AI_PROVIDERS = {
    deepseek: {
        client: deepseekClient,
        model: DEEPSEEK_MODEL,
        name: 'DeepSeek'
    },
    qwen: {
        client: qwenClient,
        model: QWEN_MODEL,
        name: '通义千问'
    }
};

// 存储对话历史的内存存储（在生产环境中，你可能想要使用数据库）
const conversationHistories = new Map();

// 获取 AI 客户端和模型
function getAIProvider(provider = DEFAULT_AI_PROVIDER) {
    const providerConfig = AI_PROVIDERS[provider];
    if (!providerConfig) {
        console.warn(`⚠️ Unknown AI provider: ${provider}, falling back to ${DEFAULT_AI_PROVIDER}`);
        return AI_PROVIDERS[DEFAULT_AI_PROVIDER];
    }
    return providerConfig;
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
    const { client, model, name } = getAIProvider(provider);
    console.log(`🤖 Using AI provider: ${name} (${model})`);
    
    return await client.chat.completions.create({
        messages: conversationHistory,
        model: model,
        stream: true,
    });
}

// 调用AI API（非流式）
export async function callAI(conversationHistory, provider = DEFAULT_AI_PROVIDER) {
    const { client, model, name } = getAIProvider(provider);
    console.log(`🤖 Using AI provider: ${name} (${model})`);
    
    return await client.chat.completions.create({
        messages: conversationHistory,
        model: model,
    });
}

// 获取可用的 AI 提供商列表
export function getAvailableProviders() {
    return Object.keys(AI_PROVIDERS).map(key => ({
        id: key,
        name: AI_PROVIDERS[key].name,
        model: AI_PROVIDERS[key].model
    }));
}