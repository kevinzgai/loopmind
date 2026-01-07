import { 
    getConversationHistory, 
    addMessageToHistory, 
    callAI 
} from '../services/aiService.js';
import { textToSpeech, checkConfig } from '../services/aliTtsService.js';

/**
 * 处理完整的语音对话流程
 * 流程：接收文字（来自 ASR）→ AI 处理 → TTS 转语音 → 返回音频
 */
export async function handleVoiceChat(req, res) {
    try {
        // 检查 TTS 配置
        if (!checkConfig()) {
            return res.status(500).json({ 
                error: 'TTS service not configured',
                message: '阿里云 TTS 服务未配置'
            });
        }

        const { message, userId, voice, volume, speechRate } = req.body;
        
        if (!message || !userId) {
            return res.status(400).json({ error: 'Missing message or userId' });
        }
        
        console.log('🎤 收到语音对话请求:', { userId, message: message.substring(0, 50) });
        
        // 1. 获取对话历史
        const conversationHistory = getConversationHistory(userId);
        
        // 2. 添加用户消息到历史
        addMessageToHistory(userId, { role: "user", content: message });
        
        // 3. 调用 AI 获取回复（非流式）
        console.log('🤖 正在调用 AI...');
        const aiResponse = await callAI(conversationHistory);
        const aiMessage = aiResponse.choices[0]?.message?.content || "";
        
        if (!aiMessage) {
            throw new Error('AI 返回空响应');
        }
        
        console.log('✅ AI 回复:', aiMessage.substring(0, 50));
        
        // 4. 添加 AI 回复到历史
        addMessageToHistory(userId, { role: "assistant", content: aiMessage });
        
        // 5. 将 AI 回复转为语音
        console.log('🔊 正在转换为语音...');
        const audioBuffer = await textToSpeech(aiMessage, { 
            voice, 
            volume,
            speechRate
        });
        
        // 6. 返回 JSON 响应（包含文字和音频）
        res.json({
            success: true,
            text: aiMessage,
            audio: audioBuffer.toString('base64'), // Base64 编码的音频
            audioSize: audioBuffer.length
        });
        
        console.log('✅ 语音对话完成');
    } catch (error) {
        console.error('❌ 语音对话失败:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Voice chat service error', 
            message: error.message 
        });
    }
}

/**
 * 处理语音对话（返回音频流）
 */
export async function handleVoiceChatStream(req, res) {
    try {
        // 检查 TTS 配置
        if (!checkConfig()) {
            return res.status(500).json({ 
                error: 'TTS service not configured',
                message: '阿里云 TTS 服务未配置'
            });
        }

        const { message, userId, voice, volume, speechRate } = req.body;
        
        if (!message || !userId) {
            return res.status(400).json({ error: 'Missing message or userId' });
        }
        
        console.log('🎤 收到语音对话流式请求');
        
        // 1. 获取对话历史并处理
        const conversationHistory = getConversationHistory(userId);
        addMessageToHistory(userId, { role: "user", content: message });
        
        // 2. 调用 AI
        const aiResponse = await callAI(conversationHistory);
        const aiMessage = aiResponse.choices[0]?.message?.content || "";
        
        if (!aiMessage) {
            throw new Error('AI 返回空响应');
        }
        
        addMessageToHistory(userId, { role: "assistant", content: aiMessage });
        
        // 3. 转为语音
        const audioBuffer = await textToSpeech(aiMessage, { 
            voice, 
            volume,
            speechRate
        });
        
        // 4. 设置响应头并发送音频流
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', audioBuffer.length);
        res.setHeader('X-AI-Response', encodeURIComponent(aiMessage)); // 在响应头中包含文字
        
        res.send(audioBuffer);
        
        console.log('✅ 语音对话流式响应完成');
    } catch (error) {
        console.error('❌ 语音对话流式失败:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                success: false, 
                error: 'Voice chat stream service error', 
                message: error.message 
            });
        }
    }
}
