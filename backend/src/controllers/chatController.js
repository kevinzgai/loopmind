import {
    getConversationHistory,
    addMessageToHistory,
    callAIStream,
    callAI,
    getAvailableProviders
} from '../services/aiService.js';
import {
    getConversationMessages,
    appendConversationMessages
} from '../services/conversationService.js';

// 处理聊天消息（支持流式响应）
export async function handleChatMessage(req, res) {
    try {
        const { message, userId, stream, prompt, text, provider, systemPrompt } = req.body;

        const userMessage = message || prompt || text;
        const aiProvider = provider || 'deepseek';

        if (!userMessage || !userId) {
            return res.status(400).json({ error: 'Missing message/prompt/text or userId' });
        }

        const dbUserId = req.user && req.user.userId ? req.user.userId : null;

        console.log('📨 Received request:', { userId, dbUserId, message: userMessage, provider: aiProvider, hasSystemPrompt: !!systemPrompt });

        let conversationHistory;
        let newMessages = [];

        if (dbUserId) {
            const persistedMessages = await getConversationMessages(dbUserId, aiProvider);
            conversationHistory = [...persistedMessages];

            if (systemPrompt && conversationHistory.length === 0) {
                const systemMessage = { role: "system", content: systemPrompt };
                conversationHistory.push(systemMessage);
                newMessages.push(systemMessage);
            }

            const userChatMessage = { role: "user", content: userMessage };
            conversationHistory.push(userChatMessage);
            newMessages.push(userChatMessage);
        } else {
            conversationHistory = getConversationHistory(userId, aiProvider);

            if (systemPrompt && conversationHistory.length === 0) {
                addMessageToHistory(userId, { role: "system", content: systemPrompt }, aiProvider);
            }

            addMessageToHistory(userId, { role: "user", content: userMessage }, aiProvider);
        }

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const streamResponse = await callAIStream(conversationHistory, aiProvider);

        let fullResponse = "";

        for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                fullResponse += content;
                res.write(content);
            }
        }

        if (dbUserId) {
            const assistantMessage = { role: "assistant", content: fullResponse };
            newMessages.push(assistantMessage);
            await appendConversationMessages(dbUserId, aiProvider, newMessages);
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
        const { provider, userId } = req.query;
        const aiProvider = provider || 'deepseek';
        const dbUserId = req.user && req.user.userId ? req.user.userId : null;

        let messages;

        if (dbUserId) {
            messages = await getConversationMessages(dbUserId, aiProvider);
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

export async function getProviders(req, res) {
    try {
        const providers = getAvailableProviders();
        res.json({ providers });
    } catch (error) {
        console.error('❌ Error getting providers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
