import {
    getConversationHistory,
    addMessageToHistory,
    callAIStream,
    callAI,
    getAvailableProviders
} from '../services/aiService.js';
import { getConfigMasked } from '../services/configService.js';
import {
    appendConversationMessages,
    createConversation,
    getConversations
} from '../services/conversationService.js';

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
        const providers = getAvailableProviders();
        const cfg = await getConfigMasked();
        res.json({ providers, defaultProvider: cfg.provider });
    } catch (error) {
        console.error('❌ Error getting providers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
