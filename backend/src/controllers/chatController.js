import {
    getConversationHistory,
    addMessageToHistory,
    callAIStream,
    callAI
} from '../services/ai/aiService.js';
import { getConfigMasked, getRawConfigCached } from '../services/database/configService.js';
import {
    appendConversationMessages,
    createConversation,
    getConversationMessages,
    getConversations
} from '../services/database/conversationService.js';

// 处理聊天消息（支持流式响应）
export async function handleChatMessage(req, res) {
    try {
        const { message, userId, stream, prompt, text, provider, systemPrompt, conversationId } = req.body;

        const userMessage = message || prompt || text;
        const aiProvider = provider || 'deepseek';

        if (!userMessage || !userId) {
            return res.status(400).json({ error: 'Missing message/prompt/text or userId' });
        }

        const dbUserId = req.user && req.user.userId ? req.user.userId : null;

        console.log('📨 Received request:', { userId, dbUserId, message: userMessage, provider: aiProvider, hasSystemPrompt: !!systemPrompt, conversationId });

        let conversationHistory;
        let newMessages = [];
        let currentConversationId = conversationId;

        if (dbUserId) {
            // 如果是已登录用户
            if (!currentConversationId) {
                // 如果没有提供 conversationId，创建一个新会话
                const conv = await createConversation(dbUserId, aiProvider);
                currentConversationId = conv._id.toString();
            }

            // 获取历史消息
            const persistedMessages = await getConversationMessages(dbUserId, aiProvider, currentConversationId);
            conversationHistory = [...persistedMessages];

            if (systemPrompt && conversationHistory.length === 0) {
                const systemMessage = { role: "system", content: systemPrompt };
                conversationHistory.push(systemMessage);
                newMessages.push(systemMessage);
            }

            const userChatMessage = { role: "user", content: userMessage };
            conversationHistory.push(userChatMessage);
            newMessages.push(userChatMessage);
            
            // 保存用户消息
            await appendConversationMessages(dbUserId, aiProvider, newMessages, currentConversationId);
            newMessages = []; // 清空，准备存 AI 回复

        } else {
            // 匿名用户 (内存存储，暂不支持持久化)
            conversationHistory = getConversationHistory(userId, aiProvider);

            if (systemPrompt && conversationHistory.length === 0) {
                addMessageToHistory(userId, { role: "system", content: systemPrompt }, aiProvider);
            }

            addMessageToHistory(userId, { role: "user", content: userMessage }, aiProvider);
        }

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        // 返回 conversationId 给前端，以便下次使用
        res.setHeader('X-Conversation-Id', currentConversationId || '');

        const streamResponse = await callAIStream(conversationHistory, aiProvider);

        let fullResponse = "";

        for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                fullResponse += content;
                res.write(content);
            }
        }

        if (dbUserId && currentConversationId) {
            const assistantMessage = { role: "assistant", content: fullResponse };
            newMessages.push(assistantMessage);
            await appendConversationMessages(dbUserId, aiProvider, newMessages, currentConversationId);
        } else {
            addMessageToHistory(userId, { role: "assistant", content: fullResponse }, aiProvider);
        }

        console.log('✅ Streaming response completed');
        res.end();
    } catch (error) {
        console.error('❌ Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.end();
        }
    }
}

export async function getChatHistory(req, res) {
    try {
        const { provider, userId, conversationId } = req.query;
        const aiProvider = provider || 'deepseek';
        const dbUserId = req.user && req.user.userId ? req.user.userId : null;

        let messages;

        if (dbUserId) {
             // 如果已登录，优先使用 conversationId 获取，如果没传则获取最近的一个
            messages = await getConversationMessages(dbUserId, aiProvider, conversationId);
        } else if (userId) {
            messages = getConversationHistory(userId, aiProvider);
        } else {
            messages = [];
        }

        res.json({ provider: aiProvider, messages });
    } catch (error) {
        console.error('❌ Error getting chat history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getUserConversations(req, res) {
    try {
        const dbUserId = req.user && req.user.userId;
        if (!dbUserId) {
             return res.status(401).json({ error: 'Unauthorized' });
        }
        const { provider } = req.query;
        const conversations = await getConversations(dbUserId, provider);
        res.json({ conversations });
    } catch (error) {
        console.error('❌ Error getting conversations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getProviders(req, res) {
    try {
        const cfg = await getRawConfigCached();
        
        const allProviders = [
            { id: "siliconflow", name: "硅基流动", model: "deepseek-chat", config: cfg.siliconflow },
            { id: "deepseek", name: "DeepSeek", model: "deepseek-chat", config: cfg.deepseek },
            { id: "qwen", name: "通义千问", model: "qwen-turbo", config: cfg.qwen },
            { id: "doubao", name: "火山引擎", model: "doubao-seed-1-8-251228", config: cfg.doubao },
            { id: "glm", name: "智谱GLM", model: "glm-4-flash", config: cfg.glm },
            { id: "moonshot", name: "Kimi (Moonshot)", model: "moonshot-v1-8k", config: cfg.moonshot },
            { id: "modelscope", name: "ModelScope (魔搭)", model: "Qwen/Qwen2.5-72B-Instruct", config: cfg.modelscope },
            { id: "minimax", name: "MiniMax", model: "abab6.5s-chat", config: cfg.minimax },
            { id: "ollama", name: "Ollama 本地", model: "llama3.1:8b", config: cfg.ollama },
        ];
        
        const providers = allProviders
            .filter(p => p.config && p.config.apiKey && p.config.apiKey.trim() !== '')
            .map(({ id, name, model, config }) => ({
                id,
                name,
                apiKey: config.apiKey,
                baseURL: config.baseURL,
                model: config.model || model,
                type: id
            }));
        
        res.json({ providers, defaultProvider: cfg.provider });
    } catch (error) {
        console.error('❌ Error getting providers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
