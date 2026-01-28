import { DEFAULT_AI_PROVIDER } from '../config/config.js';
import { getRawConfigCached } from './configService.js';
import { callLangChainStream } from './langchainService.js';

// 存储对话历史的内存存储（在生产环境中，你可能想要使用数据库）
const conversationHistories = new Map();

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
    console.log(`🦜 Using LangChain for provider: ${provider}`);
    const stream = await callLangChainStream(conversationHistory, provider);
    
    // 适配 OpenAI 的流输出格式，以便控制器不感知变化
    return (async function* () {
        for await (const chunk of stream) {
            yield {
                choices: [{
                    delta: {
                        content: chunk
                    }
                }]
            };
        }
    })();
}

// 调用AI API（非流式）
export async function callAI(conversationHistory, provider = DEFAULT_AI_PROVIDER) {
    const { getModel } = await import('./langchainService.js');
    const model = await getModel(provider);
    
    const langChainMessages = conversationHistory.map(msg => {
        if (msg.role === 'system') return ["system", msg.content];
        if (msg.role === 'user') return ["user", msg.content];
        if (msg.role === 'assistant') return ["assistant", msg.content];
        return ["user", msg.content];
    });

    console.log(`🦜 Using LangChain (invoke) for provider: ${provider}`);
    const response = await model.invoke(langChainMessages);
    
    // 适配 OpenAI 的返回格式
    return {
        choices: [{
            message: {
                content: response.content
            }
        }]
    };
}

// 获取可用的 AI 提供商列表
export function getAvailableProviders() {
    return [
        { id: 'deepseek', name: 'DeepSeek', model: 'deepseek-chat' },
        { id: 'qwen', name: '通义千问', model: 'qwen-turbo' },
        { id: 'doubao', name: '火山引擎', model: 'doubao-seed-1-8-251228' },
        { id: 'glm', name: '智谱GLM', model: 'glm-4-flash' },
        { id: 'moonshot', name: 'Kimi (Moonshot)', model: 'moonshot-v1-8k' },
        { id: 'modelscope', name: 'ModelScope (魔搭)', model: 'Qwen/Qwen2.5-72B-Instruct' },
        { id: 'minimax', name: 'MiniMax', model: 'abab6.5s-chat' },
        { id: 'ollama', name: 'Ollama 本地', model: 'llama3.1:8b' }
    ];
}
