import OpenAI from 'openai';
import { API_KEY, BASE_URL, MODEL } from '../config/config.js';

// 初始化OpenAI客户端
const openai = new OpenAI({ 
    apiKey: API_KEY, 
    baseURL: BASE_URL
});

// 存储对话历史的内存存储（在生产环境中，你可能想要使用数据库）
const conversationHistories = new Map();

// 获取或创建用户对话历史
export function getConversationHistory(userId) {
    if (!conversationHistories.has(userId)) {
        conversationHistories.set(userId, [
            { role: "system", content: "You are a helpful assistant." }
        ]);
    }
    return conversationHistories.get(userId);
}

// 添加消息到对话历史
export function addMessageToHistory(userId, message) {
    const history = getConversationHistory(userId);
    history.push(message);
}

// 调用AI API（流式）
export async function callAIStream(conversationHistory) {
    return await openai.chat.completions.create({
        messages: conversationHistory,
        model: MODEL,
        stream: true,
    });
}

// 调用AI API（非流式）
export async function callAI(conversationHistory) {
    return await openai.chat.completions.create({
        messages: conversationHistory,
        model: MODEL,
    });
}