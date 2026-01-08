import WebSocket from 'ws';
import crypto from 'crypto';
import { getToken } from './aliTokenService.js';

/**
 * 阿里云实时语音合成（流式 TTS）服务
 * 使用 WebSocket 协议
 * 文档: https://help.aliyun.com/document_detail/84435.html
 */

// 从环境变量获取配置
function getConfig() {
    return {
        appKey: process.env.ALI_TTS_APP_KEY || ''
    };
}

/**
 * 创建流式 TTS WebSocket 连接
 * @param {Object} options - 配置选项
 * @returns {Promise<WebSocket>} WebSocket 连接
 */
export async function createTTSStream(options = {}) {
    try {
        const { appKey } = getConfig();
        const { token } = await getToken();

        const {
            voice = 'xiaoxian',
            format = 'mp3',
            sampleRate = 16000,
            volume = 50,
            speechRate = 0,
            pitchRate = 0
        } = options;

        // 构建 WebSocket URL（使用 token 认证）
        const url = `wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1?token=${encodeURIComponent(token)}`;
        
        console.log('🔗 连接阿里云流式 TTS...');
        
        // 创建 WebSocket 连接
        const ws = new WebSocket(url);

        // 等待连接建立
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('WebSocket 连接超时'));
            }, 10000);

            ws.on('open', () => {
                clearTimeout(timeout);
                console.log('✅ 阿里云流式 TTS WebSocket 连接已建立');
                console.log('⏳ 等待文本输入...');
                resolve();
            });

            ws.on('error', (error) => {
                clearTimeout(timeout);
                console.error('❌ WebSocket 连接错误:', error);
                reject(error);
            });
        });

        return ws;
    } catch (error) {
        console.error('❌ 创建流式 TTS 连接失败:', error);
        throw error;
    }
}

/**
 * 发送文本进行合成（包含 StartSynthesis）
 * @param {WebSocket} ws - WebSocket 连接
 * @param {string} text - 要合成的文本
 * @param {string} appKey - AppKey
 * @param {Object} options - 配置选项
 */
export function sendTextWithStart(ws, text, appKey, options = {}) {
    if (ws.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket 连接未就绪');
    }

    const {
        voice = 'xiaoxian',
        format = 'mp3',
        sampleRate = 16000,
        volume = 50,
        speechRate = 0,
        pitchRate = 0
    } = options;

    const taskId = generateTaskId();

    // 发送 StartSynthesis（带文本和配置）
    const startMessage = {
        header: {
            message_id: generateMessageId(),
            task_id: taskId,
            namespace: 'SpeechSynthesizer',
            name: 'StartSynthesis',
            appkey: appKey
        },
        payload: {
            text: text,
            voice: voice,
            format: format,
            sample_rate: sampleRate,
            volume: volume,
            speech_rate: speechRate,
            pitch_rate: pitchRate
        }
    };

    ws.send(JSON.stringify(startMessage));
    console.log('📤 发送 StartSynthesis（带文本）:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));

    return taskId;
}

/**
 * 发送结束指令
 * @param {WebSocket} ws - WebSocket 连接
 * @param {string} appKey - AppKey
 */
export function sendComplete(ws, appKey) {
    if (ws.readyState !== WebSocket.OPEN) {
        return;
    }

    const message = {
        header: {
            message_id: generateMessageId(),
            task_id: generateTaskId(),
            namespace: 'SpeechSynthesizer',
            name: 'StopSynthesis',
            appkey: appKey
        }
    };

    ws.send(JSON.stringify(message));
    console.log('📤 发送 StopSynthesis 指令');
}

/**
 * 生成消息 ID（阿里云要求特定格式）
 */
function generateMessageId() {
    // 阿里云要求 message_id 格式：32位十六进制字符串（无连字符）
    return crypto.randomBytes(16).toString('hex');
}

/**
 * 生成任务 ID（阿里云要求特定格式）
 */
function generateTaskId() {
    // 阿里云要求 task_id 格式：32位十六进制字符串（无连字符）
    return crypto.randomBytes(16).toString('hex');
}

/**
 * 处理 WebSocket 消息
 * @param {Buffer} data - 消息数据
 * @returns {Object} 解析后的消息
 */
export function parseMessage(data) {
    try {
        // 检查是否是二进制音频数据
        if (data instanceof Buffer) {
            // 尝试解析 JSON
            const text = data.toString('utf-8');
            if (text.startsWith('{')) {
                return {
                    type: 'json',
                    data: JSON.parse(text)
                };
            } else {
                // 二进制音频数据
                return {
                    type: 'audio',
                    data: data
                };
            }
        }

        // 字符串消息
        if (typeof data === 'string') {
            return {
                type: 'json',
                data: JSON.parse(data)
            };
        }

        return {
            type: 'unknown',
            data: data
        };
    } catch (error) {
        console.error('❌ 解析消息失败:', error);
        return {
            type: 'error',
            error: error
        };
    }
}

/**
 * 检查配置是否完整
 */
export function checkConfig() {
    const { appKey } = getConfig();
    const accessKeyId = process.env.ALI_TTS_ACCESS_KEY_ID || '';
    const accessKeySecret = process.env.ALI_TTS_ACCESS_KEY_SECRET || '';
    
    return !!(appKey && accessKeyId && accessKeySecret);
}

export default {
    createTTSStream,
    sendTextWithStart,
    sendComplete,
    parseMessage,
    checkConfig
};
