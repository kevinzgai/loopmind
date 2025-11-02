import { 
    getConversationHistory, 
    addMessageToHistory, 
    callAIStream, 
    callAI 
} from '../services/aiService.js';

// 处理聊天消息（支持流式响应）
export async function handleChatMessage(req, res) {
    try {
        const { message, userId, stream } = req.body;
        
        if (!message || !userId) {
            return res.status(400).json({ error: 'Missing message or userId' });
        }
        
        // 获取用户的对话历史
        const conversationHistory = getConversationHistory(userId);
        
        // 将用户消息添加到历史记录
        addMessageToHistory(userId, { role: "user", content: message });
        
        if (stream) {
            // 流式响应
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            // 调用AI API（流式）
            const streamResponse = await callAIStream(conversationHistory);
            
            // 收集完整响应以保存到历史记录
            let fullResponse = "";
            
            // 处理流式响应
            for await (const chunk of streamResponse) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                    fullResponse += content;
                    // 确保写入成功
                    const writeSuccess = res.write(content);
                    // 如果写入不成功，可能需要等待
                    if (!writeSuccess) {
                        await new Promise(resolve => res.once('drain', resolve));
                    }
                }
            }
            
            // 将AI回复添加到历史记录
            addMessageToHistory(userId, { role: "assistant", content: fullResponse });
            
            // 结束响应
            res.end();
        } else {
            // 非流式响应（保持向后兼容）
            const completion = await callAI(conversationHistory);
            
            // 获取AI回复
            const aiResponse = completion.choices[0].message.content;
            
            // 将AI回复添加到历史记录
            addMessageToHistory(userId, { role: "assistant", content: aiResponse });
            
            // 返回AI回复
            res.json({ message: aiResponse });
        }
    } catch (error) {
        console.error('Error:', error);
        // 对于流式响应，我们需要特殊处理错误
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.end();
        }
    }
}