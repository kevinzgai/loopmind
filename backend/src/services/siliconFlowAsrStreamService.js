import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";
import crypto from 'crypto';

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
    model: process.env.SILICONFLOW_ASR_MODEL || "FunAudioLLM/SenseVoiceSmall",
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
                audioChunks.push(data);
            } else if (typeof data === 'string') {
                const message = JSON.parse(data);
                if (message.type === 'start') {
                    console.log('▶️ 硅基流动 ASR 开始录音');
                    audioChunks = [];
                    clientWs.send(JSON.stringify({ type: 'started', message: '识别已开始' }));
                } else if (message.type === 'stop') {
                    console.log('⏹️ 硅基流动 ASR 停止录音，开始识别全部音频...');
                    if (audioChunks.length === 0) {
                        clientWs.send(JSON.stringify({ type: 'result', text: '' }));
                        clientWs.send(JSON.stringify({ type: 'completed' }));
                        return;
                    }

                    isProcessing = true;
                    const fullAudio = Buffer.concat(audioChunks);
                    const tempFilePath = path.join(tmpdir(), `asr-${uuidv4()}.wav`);

                    try {
                        // 写入临时文件
                        fs.writeFileSync(tempFilePath, fullAudio);

                        // 调用识别接口
                        const transcription = await client.audio.transcriptions.create({
                            file: fs.createReadStream(tempFilePath),
                            model: model,
                            response_format: "text",
                        });

                        let resultText = "";
                        if (typeof transcription === "string") {
                            resultText = transcription;
                        } else if (transcription && typeof transcription === "object") {
                            resultText = transcription["text"] || "";
                        }

                        console.log('✅ 硅基流动 ASR 识别结果:', resultText);

                        // 发送识别结果给客户端
                        clientWs.send(JSON.stringify({ type: 'result', text: resultText }));
                        clientWs.send(JSON.stringify({ type: 'completed' }));
                    } catch (error) {
                        console.error('❌ 硅基流动 ASR 识别失败:', error);
                        clientWs.send(JSON.stringify({ type: 'error', message: '识别失败: ' + error.message }));
                    } finally {
                        // 清理临时文件
                        if (fs.existsSync(tempFilePath)) {
                            try { fs.unlinkSync(tempFilePath); } catch (e) {}
                        }
                        audioChunks = [];
                        isProcessing = false;
                    }
                }
            }
        } catch (error) {
            console.error('❌ 处理客户端消息失败:', error);
        }
    });

    clientWs.on('close', () => {
        console.log('🔌 硅基流动 ASR 连接已关闭');
        audioChunks = [];
    });

    clientWs.on('error', (error) => {
        console.error('❌ 硅基流动 ASR WebSocket 错误:', error);
    });
}

export default {
    handleStreamConnection
};
