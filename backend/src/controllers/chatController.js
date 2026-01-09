import { 
    getConversationHistory, 
    addMessageToHistory, 
    callAIStream, 
    callAI,
    getAvailableProviders
} from '../services/aiService.js';

// 处理聊天消息（支持流式响应）
export async function handleChatMessage(req, res) {
    try {
        const { message, userId, stream, prompt, text, provider, systemPrompt } = req.body;
        
        const userMessage = message || prompt || text;
        const aiProvider = provider || 'deepseek'; // 默认使用 DeepSeek
        
        if (!userMessage || !userId) {
            return res.status(400).json({ error: 'Missing message/prompt/text or userId' });
        }
        
        console.log('📨 Received request:', { userId, message: userMessage, provider: aiProvider, hasSystemPrompt: !!systemPrompt });
        
        const conversationHistory = getConversationHistory(userId, aiProvider);
        
        // 如果有系统提示词且对话历史为空，添加系统消息
        if (systemPrompt && conversationHistory.length === 0) {
            addMessageToHistory(userId, { role: "system", content: systemPrompt }, aiProvider);
        }
        
        addMessageToHistory(userId, { role: "user", content: userMessage }, aiProvider);
        
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
                // console.log('📤 Streaming chunk:', content);
            }
        }
        
        addMessageToHistory(userId, { role: "assistant", content: fullResponse }, aiProvider);
        
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

// 获取可用的 AI 提供商列表
export async function getProviders(req, res) {
    try {
        const providers = getAvailableProviders();
        res.json({ providers });
    } catch (error) {
        console.error('❌ Error getting providers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}