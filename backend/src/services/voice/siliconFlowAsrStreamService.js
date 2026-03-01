import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";
import crypto from 'crypto';
import { pcmToWav } from '../../utils/audioConverter.js';

/**
 * 硅基流动 ASR 流式识别模拟服务
 * 由于硅基流动 API 目前不支持原生的 WebSocket 流式识别，
 * 我们通过将接收到的音频片段累积，并在完成后调用文件识别 API 来模拟流式体验。
 */

// 获取配置
function getConfig() {
  return {
    apiKey: process.env.SILICONFLOW_API_KEY || "",
    baseURL: process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1",
    model: process.env.SILICONFLOW_ASR_MODEL || "TeleAI/TeleSpeechASR", // 默认使用 TeleSpeechASR 模型
  };
}

/**
 * 处理客户端 WebSocket 连接
 * @param {WebSocket} clientWs - 客户端 WebSocket 连接
 */
export async function handleStreamConnection(clientWs) {
    console.log('📞 硅基流动 ASR (模拟流式) 连接');
    
    let audioChunks = [];
    let isProcessing = false;
    
    const { apiKey, baseURL, model } = getConfig();
    if (!apiKey) {
        console.error('❌ 硅基流动 API Key 未配置');
        clientWs.send(JSON.stringify({ type: 'error', message: '服务配置错误' }));
        clientWs.close();
        return;
    }

    const client = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL,
    });

    // 监听客户端消息
    clientWs.on('message', async (data) => {
        try {
            if (data instanceof Buffer) {
                // 收到音频数据片段
                console.log('📥 收到音频数据片段，大小:', data.length, '字节');
                audioChunks.push(data);
            } else if (typeof data === 'string') {
                try {
                    const message = JSON.parse(data);
                    console.log('📩 收到客户端消息:', message.type);
                    if (message.type === 'start') {
                        console.log('▶️ 硅基流动 ASR 开始录音');
                        audioChunks = [];
                        clientWs.send(JSON.stringify({ type: 'started', message: '识别已开始' }));
                    } else if (message.type === 'stop') {
                        console.log('⏹️ 硅基流动 ASR 停止录音，开始识别全部音频...');
                        if (audioChunks.length === 0) {
                            console.log('⚠️ 没有收到任何音频数据');
                            clientWs.send(JSON.stringify({ type: 'result', text: '' }));
                            clientWs.send(JSON.stringify({ type: 'completed' }));
                            return;
                        }

                        if (isProcessing) {
                            console.log('⚠️ 识别正在进行中，忽略重复的停止指令');
                            return;
                        }

                        isProcessing = true;
                        console.log('📊 总共收到音频数据块数量:', audioChunks.length);
                        const fullAudio = Buffer.concat(audioChunks);
                        console.log('📊 总共收到音频数据大小:', fullAudio.length, '字节');
                        
                        // 检查音频数据是否有效
                        if (fullAudio.length === 0) {
                            console.log('⚠️ 没有收到任何音频数据');
                            clientWs.send(JSON.stringify({ type: 'result', text: '' }));
                            clientWs.send(JSON.stringify({ type: 'completed' }));
                            audioChunks = [];
                            isProcessing = false;
                            return;
                        }
                        
                        // 将 PCM 数据转换为 WAV 格式
                        const wavAudio = pcmToWav(fullAudio, 16000, 1, 16);
                        const tempFilePath = path.join(tmpdir(), `asr-${uuidv4()}.wav`);

                        try {
                            // 写入临时文件
                            fs.writeFileSync(tempFilePath, wavAudio);
                            console.log('💾 音频数据已写入临时文件:', tempFilePath);

                            // 调用识别接口
                            console.log('🔍 开始调用 ASR 识别接口...');
                            console.log('🔧 使用模型:', model);
                            
                            const transcription = await client.audio.transcriptions.create({
                                file: fs.createReadStream(tempFilePath),
                                model: model,
                                response_format: "text",
                            });

                            console.log('📝 原始响应:', transcription);

                            let resultText = "";
                            if (typeof transcription === "string") {
                                resultText = transcription;
                            } else if (transcription && typeof transcription === "object") {
                                resultText = transcription["text"] || "";
                            }

                            // 检查音频数据是否可能包含语音内容
                            const audioDuration = (fullAudio.length / (16000 * 2 * 1)).toFixed(2); // 假设16kHz, 16位, 单声道
                            console.log(`⏱️ 音频时长估计: ${audioDuration}秒`);
                            
                            if (resultText.trim() === "") {
                                console.log('⚠️ ASR 识别结果为空，可能是以下原因之一:');
                                console.log('   - 用户没有说话或语音音量过小');
                                console.log('   - 音频质量问题');
                                console.log('   - ASR 模型未能识别语音');
                                console.log('   - 音频格式问题');
                            } else {
                                console.log('✅ 硅基流动 ASR 识别结果:', resultText);
                            }
                            
                            // 无论如何都记录结果
                            console.log('📢 最终识别结果:', `"${resultText}"`);

                            // 发送识别结果给客户端
                            console.log('📤 发送识别结果到客户端:', resultText);
                            clientWs.send(JSON.stringify({ type: 'result', text: resultText }));
                            clientWs.send(JSON.stringify({ type: 'completed' }));
                            
                            // 重置状态以便下次录音
                            audioChunks = [];
                            isProcessing = false;
                        } catch (error) {
                            console.error('❌ 硅基流动 ASR 识别失败:', error);
                            console.error('🔧 错误详情:', error.response?.data || error.message);
                            
                            // 发送错误信息给客户端
                            clientWs.send(JSON.stringify({ 
                                type: 'error', 
                                message: `识别失败: ${error.message || '未知错误'}` 
                            }));
                        } finally {
                            // 清理临时文件
                            if (fs.existsSync(tempFilePath)) {
                                try { 
                                    fs.unlinkSync(tempFilePath); 
                                    console.log('🧹 临时文件已清理:', tempFilePath);
                                } catch (e) {
                                    console.error('🧹 清理临时文件失败:', e);
                                }
                            }
                            // 确保状态被重置，即使出现异常
                            if (!clientWs.readyState || clientWs.readyState === WebSocket.CLOSED) {
                                audioChunks = [];
                                isProcessing = false;
                            }
                        }
                    }
                } catch (error) {
                    console.error('❌ 处理客户端消息失败:', error);
                    clientWs.send(JSON.stringify({ 
                        type: 'error', 
                        message: `处理消息失败: ${error.message || '未知错误'}` 
                    }));
                }
            }
        } catch (error) {
            console.error('❌ 处理客户端消息失败:', error);
            clientWs.send(JSON.stringify({ type: 'error', message: '处理消息失败: ' + error.message }));
        }
    });

    clientWs.on('close', () => {
        console.log('🔌 硅基流动 ASR 连接已关闭');
        // 清理未处理的音频数据（理论上不应该有，因为应在收到停止指令时处理）
        audioChunks = [];
        // 确保状态重置
        if (isProcessing) {
            console.log('⚠️ 连接关闭时仍有处理正在进行，标记为完成');
        }
        isProcessing = false;
    });

    clientWs.on('error', (error) => {
        console.error('❌ 硅基流动 ASR WebSocket 错误:', error);
    });
}

export default {
    handleStreamConnection
};