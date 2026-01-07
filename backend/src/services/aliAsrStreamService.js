import WebSocket from 'ws';
import crypto from 'crypto';
import { getToken } from './aliTokenService.js';
import { convertToPcm } from '../utils/audioConverter.js';
// 确保环境变量已加载
import '../config/config.js';

/**
 * 阿里云 ASR 流式识别服务
 * 支持实时语音识别，边说边识别
 */

// 从环境变量获取配置
function getConfig() {
    return {
        appKey: process.env.ALI_ASR_APP_KEY || process.env.ALI_TTS_APP_KEY || ''
    };
}

/**
 * 处理客户端 WebSocket 连接
 * @param {WebSocket} clientWs - 客户端 WebSocket 连接
 */
export async function handleStreamConnection(clientWs) {
    console.log('📞 新的流式识别连接');
    
    let aliWs = null;
    
    try {
        const { appKey } = getConfig();
        
        if (!appKey) {
            throw new Error('阿里云 ASR AppKey 未配置');
        }

        // 获取 Token
        const { token } = await getToken();
        
        // 连接到阿里云 ASR WebSocket
        const url = `wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1`;
        
        console.log('🔗 连接到阿里云 ASR...');
        
        aliWs = new WebSocket(url, {
            headers: {
                'X-NLS-Token': token
            }
        });

        // 生成 task_id 并保存
        const taskId = generateTaskId();

        aliWs.on('open', () => {
            console.log('✅ 阿里云 ASR WebSocket 连接已建立');
            
            // 发送开始识别指令
            const startMessage = {
                header: {
                    message_id: generateMessageId(),
                    task_id: taskId,
                    namespace: 'SpeechTranscriber',
                    name: 'StartTranscription',
                    appkey: appKey
                },
                payload: {
                    format: 'pcm',
                    sample_rate: 16000,
                    enable_intermediate_result: true,
                    enable_punctuation_prediction: true,
                    enable_inverse_text_normalization: true
                }
            };
            
            aliWs.send(JSON.stringify(startMessage));
            console.log('📤 已发送开始识别指令');
            
            // 通知客户端已开始
            clientWs.send(JSON.stringify({
                type: 'started',
                message: '识别已开始'
            }));
        });

        aliWs.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                console.log('📨 收到阿里云消息:', message.header.name);
                
                if (message.header.name === 'TranscriptionStarted') {
                    console.log('✅ 识别已开始');
                } else if (message.header.name === 'SentenceBegin') {
                    console.log('📝 句子开始');
                } else if (message.header.name === 'TranscriptionResultChanged') {
                    // 中间结果 - 实时发送给客户端
                    const text = message.payload.result;
                    console.log('📝 中间结果:', text);
                    clientWs.send(JSON.stringify({
                        type: 'intermediate',
                        text: text
                    }));
                } else if (message.header.name === 'SentenceEnd') {
                    // 句子结束 - 最终结果
                    const text = message.payload.result;
                    console.log('✅ 句子完成:', text);
                    clientWs.send(JSON.stringify({
                        type: 'result',
                        text: text
                    }));
                } else if (message.header.name === 'TranscriptionCompleted') {
                    console.log('🎉 识别完成');
                    clientWs.send(JSON.stringify({
                        type: 'completed',
                        message: '识别完成'
                    }));
                } else if (message.header.name === 'TaskFailed') {
                    console.error('❌ 识别失败:', message.header.status_text);
                    clientWs.send(JSON.stringify({
                        type: 'error',
                        message: message.header.status_text || '识别失败'
                    }));
                }
            } catch (error) {
                console.error('❌ 解析阿里云消息失败:', error);
            }
        });

        aliWs.on('error', (error) => {
            console.error('❌ 阿里云 WebSocket 错误:', error);
            clientWs.send(JSON.stringify({
                type: 'error',
                message: '识别服务错误'
            }));
        });

        aliWs.on('close', () => {
            console.log('🔌 阿里云 WebSocket 连接已关闭');
        });

        // 处理客户端消息（音频数据）
        clientWs.on('message', async (data) => {
            try {
                if (data instanceof Buffer) {
                    // 收到 PCM 音频数据（前端已经转换好了）
                    console.log('📦 收到 PCM 数据:', data.length, 'bytes');
                    
                    // 直接发送到阿里云（不需要转换）
                    if (aliWs && aliWs.readyState === WebSocket.OPEN) {
                        aliWs.send(data);
                    }
                } else if (typeof data === 'string') {
                    // 收到控制消息
                    const message = JSON.parse(data);
                    if (message.type === 'stop') {
                        console.log('🛑 收到停止指令');
                        
                        // 发送停止识别指令
                        if (aliWs && aliWs.readyState === WebSocket.OPEN) {
                            const stopMessage = {
                                header: {
                                    message_id: generateMessageId(),
                                    task_id: taskId,
                                    namespace: 'SpeechTranscriber',
                                    name: 'StopTranscription',
                                    appkey: appKey
                                }
                            };
                            aliWs.send(JSON.stringify(stopMessage));
                            console.log('📤 已发送停止识别指令');
                        }
                    }
                }
            } catch (error) {
                console.error('❌ 处理客户端消息失败:', error);
            }
        });

        clientWs.on('close', () => {
            console.log('🔌 客户端连接已关闭');
            if (aliWs && aliWs.readyState === WebSocket.OPEN) {
                // 发送停止识别指令
                const stopMessage = {
                    header: {
                        message_id: generateMessageId(),
                        task_id: taskId,
                        namespace: 'SpeechTranscriber',
                        name: 'StopTranscription',
                        appkey: appKey
                    }
                };
                aliWs.send(JSON.stringify(stopMessage));
                
                // 延迟关闭，确保停止消息发送成功
                setTimeout(() => {
                    aliWs.close();
                }, 500);
            }
        });

        clientWs.on('error', (error) => {
            console.error('❌ 客户端 WebSocket 错误:', error);
        });

    } catch (error) {
        console.error('❌ 流式识别初始化失败:', error);
        clientWs.send(JSON.stringify({
            type: 'error',
            message: error.message
        }));
        clientWs.close();
    }
}

/**
 * 生成消息 ID
 */
function generateMessageId() {
    return crypto.randomBytes(16).toString('hex');
}

/**
 * 生成任务 ID
 */
function generateTaskId() {
    return crypto.randomBytes(16).toString('hex');
}

export default {
    handleStreamConnection
};
