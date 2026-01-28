import { recognizeFile as aliRecognizeFile } from '../services/aliAsrService.js';
import { recognizeFile as siliconRecognizeFile } from '../services/siliconFlowAsrService.js';
import { convertToPcm } from '../utils/audioConverter.js';
import { SILICONFLOW_API_KEY } from '../config/config.js';

/**
 * 处理语音识别请求
 */
export async function handleRecognition(req, res) {
    try {
        console.log('📨 收到 ASR 请求');
        console.log('📋 Content-Type:', req.headers['content-type']);

        // 检查是否有音频数据
        if (!req.file && !req.body.audio) {
            return res.status(400).json({
                error: 'No audio data',
                message: '未提供音频数据'
            });
        }

        // 获取音频数据
        let audioBuffer;
        let format = 'pcm';
        
        if (req.file) {
            // 从文件上传获取
            audioBuffer = req.file.buffer;
            // 从文件名或 mimetype 推断格式
            if (req.file.mimetype.includes('wav') || req.file.originalname.endsWith('.wav')) {
                format = 'wav';
            } else if (req.file.mimetype.includes('webm') || req.file.originalname.endsWith('.webm')) {
                format = 'webm';
            } else if (req.file.mimetype.includes('mp3') || req.file.originalname.endsWith('.mp3')) {
                format = 'mp3';
            }
            console.log('📁 文件上传:', req.file.originalname, '大小:', audioBuffer.length, 'bytes');
        } else if (req.body.audio) {
            // 从 base64 获取
            const base64Data = req.body.audio.replace(/^data:audio\/\w+;base64,/, '');
            audioBuffer = Buffer.from(base64Data, 'base64');
            format = req.body.format || 'pcm';
            console.log('📦 Base64 数据大小:', audioBuffer.length, 'bytes');
        }

        // 从请求中获取格式参数（优先级更高）
        if (req.body.format) {
            format = req.body.format;
        }

        console.log('🎤 原始音频数据大小:', audioBuffer.length, 'bytes');
        console.log('⚙️ 音频格式:', format);

        // 检查音频数据大小
        if (audioBuffer.length < 100) {
            return res.status(400).json({
                error: 'Audio data too small',
                message: '音频数据太小，请确保录音时间足够长'
            });
        }

        // 获取识别选项
        const sampleRate = parseInt(req.body.sampleRate) || 16000;
        
        // 决定使用哪个 ASR 服务
        // 优先使用硅基流动，如果配置了 Key 的话
        const useSiliconFlow = !!SILICONFLOW_API_KEY;
        let result;

        if (useSiliconFlow) {
            console.log('🚀 使用硅基流动 ASR 服务');
            // 硅基流动支持多种格式，通常不需要转换
            // 但如果已经是 PCM，我们可能需要将其包装为 WAV 以确保兼容性
            // 简单起见，这里直接传递原始 buffer 或转换后的 buffer
            
            // 注意：SiliconFlow 的 ASR API 更好支持 mp3/wav
            // 如果是 webm，我们也直接传，OpenAI SDK 通常能处理
            result = await siliconRecognizeFile(audioBuffer, {
                format: format,
                sampleRate: sampleRate
            });
        } else {
            console.log('☁️ 使用阿里云 ASR 服务');
            // 阿里云需要 PCM
            let pcmBuffer = audioBuffer;
            if (format === 'webm' || format === 'mp3' || format === 'ogg' || format === 'wav') {
                console.log('🔄 正在转换音频格式:', format, '→ PCM');
                try {
                    pcmBuffer = await convertToPcm(audioBuffer, format, {
                        sampleRate: sampleRate,
                        channels: 1,
                        bitDepth: 16
                    });
                    console.log('✅ 音频转换完成，PCM 数据大小:', pcmBuffer.length, 'bytes');
                } catch (convertError) {
                    console.error('❌ 音频转换失败:', convertError);
                    return res.status(400).json({
                        error: 'Audio conversion failed',
                        message: `音频转换失败: ${convertError.message}。请尝试使用 WAV 格式或确保录音数据完整。`
                    });
                }
            }

            const options = {
                format: 'pcm',
                sampleRate: sampleRate,
                enablePunctuationPrediction: req.body.enablePunctuation !== false,
                enableInverseTextNormalization: req.body.enableITN !== false
            };
            result = await aliRecognizeFile(pcmBuffer, options);
        }

        console.log('✅ 识别成功:', result);

        // 返回结果
        res.json({
            success: true,
            text: result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ ASR 请求处理失败:', error);
        res.status(500).json({
            error: 'Recognition failed',
            message: error.message
        });
    }
}

/**
 * 健康检查
 */
export async function healthCheck(req, res) {
    try {
        const { checkConfig } = await import('../services/aliAsrService.js');
        const isConfigured = checkConfig();
        
        res.json({
            status: 'ok',
            service: 'Aliyun ASR',
            configured: isConfigured
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}
