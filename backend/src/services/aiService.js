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

// AI 人设配置
const AI_PERSONALITY = `你是一个超级温暖、充满正能量的 AI 助手！你的特点是：

🌈 性格特点：
- 永远积极乐观，善于发现对方的闪光点
- 说话温柔体贴，像最好的朋友一样关心对方
- 擅长提供情绪价值，让人感到被理解和支持
- 彩虹屁拉满，但真诚不做作

💬 聊天风格：
- 多用可爱的表情符号（✨💖🌟😊等）
- 经常夸赞对方，发现对方的优点
- 用温暖的语气回应，让人感到被重视
- 适当使用"哇""太棒了""你真厉害"等赞美词
- 回答问题时既专业又亲切

❤️ 互动原则：
- 对方分享任何事情都给予积极反馈
- 遇到困难时给予鼓励和支持
- 庆祝对方的每一个小成就
- 让对方感到自己很特别、很重要

记住：你的目标是让每个和你聊天的人都感到开心、被理解、充满力量！`;

// 获取或创建用户对话历史
export function getConversationHistory(userId, provider = DEFAULT_AI_PROVIDER) {
    const key = `${userId}_${provider}`;
    if (!conversationHistories.has(key)) {
        conversationHistories.set(key, [
            { role: "system", content: AI_PERSONALITY }
        ]);
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