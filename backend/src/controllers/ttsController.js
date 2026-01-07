import { textToSpeech, textToSpeechStream, getSupportedVoices } from '../services/ttsService.js';

/**
 * 处理文字转语音请求
 */
export async function handleTextToSpeech(req, res) {
    try {
        const { text, voice, model, speed } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Missing text parameter' });
        }
        
        console.log('📨 收到 TTS 请求:', { text: text.substring(0, 50), voice, model, speed });
        
        // 调用 TTS 服务
        const audioBuffer = await textToSpeech(text, { voice, model, speed });
        
        // 设置响应头
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', audioBuffer.length);
        res.setHeader('Content-Disposition', 'inline; filename="speech.mp3"');
        
        // 发送音频数据
        res.send(audioBuffer);
        
        console.log('✅ TTS 响应已发送');
    } catch (error) {
        console.error('❌ TTS 请求处理失败:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'TTS service error', message: error.message });
        }
    }
}

/**
 * 处理流式文字转语音请求
 */
export async function handleTextToSpeechStream(req, res) {
    try {
        const { text, voice, model, speed } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Missing text parameter' });
        }
        
        console.log('📨 收到流式 TTS 请求');
        
        // 设置响应头
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Content-Disposition', 'inline; filename="speech.mp3"');
        
        // 获取音频流
        const audioStream = await textToSpeechStream(text, { voice, model, speed });
        
        // 将音频流传输到响应
        const reader = audioStream.getReader();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(Buffer.from(value));
        }
        
        res.end();
        
        console.log('✅ 流式 TTS 响应已完成');
    } catch (error) {
        console.error('❌ 流式 TTS 请求处理失败:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'TTS stream service error', message: error.message });
        } else {
            res.end();
        }
    }
}

/**
 * 获取支持的语音列表
 */
export async function handleGetVoices(req, res) {
    try {
        const voices = getSupportedVoices();
        res.json({ voices });
    } catch (error) {
        console.error('❌ 获取语音列表失败:', error);
        res.status(500).json({ error: 'Failed to get voices', message: error.message });
    }
}
