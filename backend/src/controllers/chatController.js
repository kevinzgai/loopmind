import { 
    getConversationHistory, 
    addMessageToHistory, 
    callAIStream, 
    callAI 
} from '../services/aiService.js';

// 处理聊天消息（支持流式响应）
export async function handleChatMessage(req, res) {
    try {
        const { message, userId, stream, prompt, text } = req.body;
        
        const userMessage = message || prompt || text;
        
        if (!userMessage || !userId) {
            return res.status(400).json({ error: 'Missing message/prompt/text or userId' });
        }
        
        console.log('📨 Received request:', { userId, message: userMessage });
        
        const conversationHistory = getConversationHistory(userId);
        
        addMessageToHistory(userId, { role: "user", content: userMessage });
        
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        const streamResponse = await callAIStream(conversationHistory);
        
        let fullResponse = "";
        
        for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                fullResponse += content;
                res.write(content);
                console.log('📤 Streaming chunk:', content);
            }
        }
        
        addMessageToHistory(userId, { role: "assistant", content: fullResponse });
        
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