import WebSocket from 'ws';
import crypto from 'crypto';
import { getToken } from './aliTokenService.js';
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
    let isConnecting = false;
    let audioBuffer = []; // 缓冲音频数据，等待连接建立
    let currentTaskId = null;
    
    const { appKey } = getConfig();
    if (!appKey) {
        console.error('❌ 阿里云 ASR AppKey 未配置');
        clientWs.send(JSON.stringify({ type: 'error', message: '服务配置错误' }));
        clientWs.close();
        return;
    }

    // 启动阿里云会话
    const startAliSession = async () => {
        if (aliWs || isConnecting) return;
        isConnecting = true;
        console.log('🔄 正在启动阿里云 ASR 会话...');

        try {
            // 获取 Token
            const { token } = await getToken();
            
            // 连接到阿里云 ASR WebSocket
            const url = `wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1`;
            
            aliWs = new WebSocket(url, {
                headers: { 'X-NLS-Token': token }
            });

            currentTaskId = generateTaskId();

            aliWs.on('open', () => {
                console.log('✅ 阿里云 ASR WebSocket 连接已建立');
                isConnecting = false;
                
                // 发送开始识别指令
                const startMessage = {
                    header: {
                        message_id: generateMessageId(),
                        task_id: currentTaskId,
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
                if (clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({
                        type: 'started',
                        message: '识别已开始'
                    }));
                }

                // 发送缓冲区中的数据
                if (audioBuffer.length > 0) {
                    console.log(`📦 发送缓冲数据: ${audioBuffer.length} 包`);
                    audioBuffer.forEach(chunk => {
                        if (aliWs.readyState === WebSocket.OPEN) {
                            aliWs.send(chunk);
                        }
                    });
                    audioBuffer = [];
                }
            });

            aliWs.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    // console.log('📨 收到阿里云消息:', message.header.name);
                    
                    if (message.header.name === 'TranscriptionResultChanged') {
                        const text = message.payload.result;
                        if (clientWs.readyState === WebSocket.OPEN) {
                            clientWs.send(JSON.stringify({ type: 'intermediate', text: text }));
                        }
                    } else if (message.header.name === 'SentenceEnd') {
                        const text = message.payload.result;
                        console.log('✅ 句子完成:', text);
                        if (clientWs.readyState === WebSocket.OPEN) {
                            clientWs.send(JSON.stringify({ type: 'result', text: text }));
                        }
                    } else if (message.header.name === 'TranscriptionCompleted') {
                        console.log('🎉 识别完成');
                        if (clientWs.readyState === WebSocket.OPEN) {
                            clientWs.send(JSON.stringify({ type: 'completed', message: '识别完成' }));
                        }
                        aliWs = null; // 清理引用
                    } else if (message.header.name === 'TaskFailed') {
                        console.error('❌ 识别失败:', message.header.status_text);
                        if (clientWs.readyState === WebSocket.OPEN) {
                            clientWs.send(JSON.stringify({ type: 'error', message: message.header.status_text }));
                        }
                        aliWs = null;
                    }
                } catch (error) {
                    console.error('❌ 解析阿里云消息失败:', error);
                }
            });

            aliWs.on('error', (error) => {
                console.error('❌ 阿里云 WebSocket 错误:', error);
                if (clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: 'error', message: '识别服务错误' }));
                }
                aliWs = null;
                isConnecting = false;
            });

            aliWs.on('close', () => {
                console.log('🔌 阿里云 WebSocket 连接已关闭');
                aliWs = null;
                isConnecting = false;
            });

        } catch (error) {
            console.error('❌ 启动阿里云会话失败:', error);
            if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'error', message: error.message }));
            }
            isConnecting = false;
        }
    };

    // 停止阿里云会话
    const stopAliSession = () => {
        if (aliWs && aliWs.readyState === WebSocket.OPEN) {
            console.log('🛑 发送停止指令到阿里云');
            const stopMessage = {
                header: {
                    message_id: generateMessageId(),
                    task_id: currentTaskId,
                    namespace: 'SpeechTranscriber',
                    name: 'StopTranscription',
                    appkey: appKey
                }
            };
            aliWs.send(JSON.stringify(stopMessage));
        } else {
            console.log('⚠️ 尝试停止，但阿里云连接未打开');
        }
    };

    // 监听客户端消息
    clientWs.on('message', async (data) => {
        try {
            if (data instanceof Buffer) {
                // 收到音频数据
                if (aliWs && aliWs.readyState === WebSocket.OPEN) {
                    aliWs.send(data);
                } else {
                    // 缓冲数据
                    // console.log('⏳ 缓冲音频数据...');
                    audioBuffer.push(data);
                    
                    // 如果没有连接且未在连接中，尝试自动连接（兼容旧版客户端）
                    if (!aliWs && !isConnecting) {
                        await startAliSession();
                    }
                }
            } else if (typeof data === 'string') {
                const message = JSON.parse(data);
                if (message.type === 'start') {
                    console.log('▶️ 收到客户端开始指令');
                    await startAliSession();
                } else if (message.type === 'stop') {
                    console.log('⏹️ 收到客户端停止指令');
                    stopAliSession();
                }
            }
        } catch (error) {
            console.error('❌ 处理客户端消息失败:', error);
        }
    });

    clientWs.on('close', () => {
        console.log('🔌 客户端连接已关闭');
        if (aliWs) {
            stopAliSession();
            // 强制清理
            setTimeout(() => {
                if (aliWs) aliWs.terminate();
            }, 1000);
        }
    });

    clientWs.on('error', (error) => {
        console.error('❌ 客户端 WebSocket 错误:', error);
    });
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
