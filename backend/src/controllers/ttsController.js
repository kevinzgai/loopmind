import { textToSpeech, getSupportedVoices, checkConfig } from '../services/aliTtsService.js';

/**
 * 处理文字转语音请求
 */
export async function handleTextToSpeech(req, res) {
    try {
        // 检查配置
        if (!checkConfig()) {
            return res.status(500).json({ 
                error: 'TTS service not configured',
                message: '阿里云 TTS 服务未配置，请在 .env 文件中添加配置'
            });
        }

        const { text, voice, format, volume, speechRate, pitchRate } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Missing text parameter' });
        }
        
        console.log('📨 收到 TTS 请求:', { 
            text: text.substring(0, 50), 
            voice, 
            format 
        });
        
        // 调用阿里云 TTS 服务
        const audioBuffer = await textToSpeech(text, { 
            voice, 
            format: format || 'mp3',
            volume,
            speechRate,
            pitchRate
        });
        
        // 设置响应头
        const contentType = format === 'wav' ? 'audio/wav' : 'audio/mpeg';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', audioBuffer.length);
        res.setHeader('Content-Disposition', `inline; filename="speech.${format || 'mp3'}"`);
        
        // 发送音频数据
        res.send(audioBuffer);
        
        console.log('✅ TTS 响应已发送');
    } catch (error) {
        console.error('❌ TTS 请求处理失败:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'TTS service error', 
                message: error.message 
            });
        }
    }
}

/**
 * 处理流式文字转语音请求
 */
export async function handleTextToSpeechStream(req, res) {
    try {
        // 检查配置
        if (!checkConfig()) {
            return res.status(500).json({ 
                error: 'TTS service not configured',
                message: '阿里云 TTS 服务未配置'
            });
        }

        const { text, voice, format, volume, speechRate, pitchRate } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Missing text parameter' });
        }
        
        console.log('📨 收到流式 TTS 请求');
        
        // 阿里云 TTS 不支持真正的流式，但我们可以快速返回
        const audioBuffer = await textToSpeech(text, { 
            voice, 
            format: format || 'mp3',
            volume,
            speechRate,
            pitchRate
        });
        
        // 设置响应头
        const contentType = format === 'wav' ? 'audio/wav' : 'audio/mpeg';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', audioBuffer.length);
        res.setHeader('Content-Disposition', `inline; filename="speech.${format || 'mp3'}"`);
        
        // 发送音频数据
        res.send(audioBuffer);
        
        console.log('✅ 流式 TTS 响应已完成');
    } catch (error) {
        console.error('❌ 流式 TTS 请求处理失败:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'TTS stream service error', 
                message: error.message 
            });
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
