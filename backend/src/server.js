import app from './app.js';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { PORT } from './config/config.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
// 使用完整版本
import { handleStreamConnection as handleAliAsrStream } from './services/voice/aliAsrStreamService.js';
import { handleStreamConnection as handleSiliconAsrStream } from './services/voice/siliconFlowAsrStreamService.js';
import { createTTSStream, sendTextWithStart, sendComplete, parseMessage } from './services/voice/aliTtsStreamService.js';
import { v4 as uuidv4 } from 'uuid';
import User from './models/UserSchema.js';
import crypto from 'crypto';

// 创建 HTTP 服务器
const httpServer = createServer(app);

// 使用单一 WebSocket 服务器处理所有连接
const wss = new WebSocketServer({ server: httpServer });

console.log('✅ WebSocket 服务器已创建');

wss.on('connection', async (ws, req) => {
    const path = req.url;
    console.log('📞 收到 WebSocket 连接请求，路径:', path);
    
    if (path === '/ws-asr-stream') {
        console.log('✅ 流式 ASR 客户端已连接');
        // 根据系统配置的 ASR 服务商来决定使用哪个服务
        try {
            const { getConfigUnmasked } = await import('./services/database/configService.js');
            const unmaskedConfig = await getConfigUnmasked();
            const asrProvider = unmaskedConfig.speech?.asrProvider || 'siliconflow';
            
            console.log(`📋 系统配置的 ASR 服务商: ${asrProvider}`);
            
            if (asrProvider === 'siliconflow') {
                console.log('🚀 使用硅基流动 ASR 服务');
                handleSiliconAsrStream(ws);
            } else if (asrProvider === 'aliyun') {
                console.log('🚀 使用阿里云 ASR 服务');
                handleAliAsrStream(ws);
            } else {
                console.log(`⚠️ 未知的 ASR 服务商: ${asrProvider}，使用默认硅基流动`);
                handleSiliconAsrStream(ws);
            }
        } catch (error) {
            console.error('❌ 获取系统配置失败，使用默认硅基流动:', error);
            handleSiliconAsrStream(ws);
        }
    } else if (path.startsWith('/ws-tts-stream')) {
        console.log('✅ 阿里云流式 TTS 客户端已连接');
        handleTTSStreamConnection(ws, req);
    } else {
        console.log('❌ 未知路径:', path);
        ws.close();
    }
});

// 处理流式 TTS WebSocket 连接
async function handleTTSStreamConnection(clientWs, req) {
    let aliTtsWs = null;
    const appKey = process.env.ALI_TTS_APP_KEY;

    try {
        // 解析查询参数
        const url = new URL(req.url, `http://${req.headers.host}`);
        const voice = url.searchParams.get('voice') || 'xiaoxian';
        const speechRate = parseInt(url.searchParams.get('speechRate')) || 0;
        const volume = parseInt(url.searchParams.get('volume')) || 50;

        console.log('🎤 TTS 参数:', { voice, speechRate, volume });

        // 创建到阿里云的 WebSocket 连接
        aliTtsWs = await createTTSStream({
            voice,
            speechRate,
            volume,
            format: 'mp3',
            sampleRate: 16000
        });

        // 监听阿里云返回的消息
        aliTtsWs.on('message', (data) => {
            const message = parseMessage(data);

            if (message.type === 'audio') {
                // 转发音频数据给客户端
                if (clientWs.readyState === 1) { // OPEN
                    clientWs.send(data);
                }
            } else if (message.type === 'json') {
                const jsonData = message.data;
                console.log('📨 阿里云 TTS 消息:', jsonData.header?.name);
                
                // 如果是错误消息，打印详细信息
                if (jsonData.header?.name === 'TaskFailed') {
                    console.error('❌ TTS 任务失败，详细信息:', JSON.stringify(jsonData, null, 2));
                }

                // 转发状态消息给客户端
                if (clientWs.readyState === 1) {
                    clientWs.send(JSON.stringify({
                        type: 'status',
                        name: jsonData.header?.name,
                        message: jsonData
                    }));
                }

                // 如果是完成消息，关闭连接
                if (jsonData.header?.name === 'SynthesisCompleted') {
                    console.log('✅ TTS 合成完成');
                    setTimeout(() => {
                        if (aliTtsWs) {
                            aliTtsWs.close();
                        }
                    }, 1000);
                }
            }
        });

        aliTtsWs.on('error', (error) => {
            console.error('❌ 阿里云 TTS WebSocket 错误:', error);
            if (clientWs.readyState === 1) {
                clientWs.send(JSON.stringify({
                    type: 'error',
                    message: error.message
                }));
            }
        });

        aliTtsWs.on('close', () => {
            console.log('🔌 阿里云 TTS WebSocket 连接已关闭');
            if (clientWs.readyState === 1) {
                clientWs.send(JSON.stringify({
                    type: 'closed'
                }));
                clientWs.close();
            }
        });

        // 监听客户端消息
        clientWs.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                console.log('📨 客户端消息:', message.type);

                if (message.type === 'text') {
                    // 发送文本到阿里云进行合成（包含 StartSynthesis）
                    sendTextWithStart(aliTtsWs, message.text, appKey, {
                        voice,
                        speechRate,
                        volume,
                        format: 'mp3',
                        sampleRate: 16000
                    });
                } else if (message.type === 'stop') {
                    // 发送停止指令
                    sendComplete(aliTtsWs, appKey);
                }
            } catch (error) {
                console.error('❌ 处理客户端消息失败:', error);
            }
        });

        clientWs.on('close', () => {
            console.log('🔌 客户端 WebSocket 连接已关闭');
            if (aliTtsWs && aliTtsWs.readyState === 1) {
                sendComplete(aliTtsWs, appKey);
                aliTtsWs.close();
            }
        });

        clientWs.on('error', (error) => {
            console.error('❌ 客户端 WebSocket 错误:', error);
        });

        // 发送连接成功消息
        clientWs.send(JSON.stringify({
            type: 'connected',
            message: '流式 TTS 连接已建立'
        }));

    } catch (error) {
        console.error('❌ 处理 TTS 流式连接失败:', error);
        if (clientWs.readyState === 1) {
            clientWs.send(JSON.stringify({
                type: 'error',
                message: error.message
            }));
            clientWs.close();
        }
    }
}

wss.on('error', (error) => {
    console.error('❌ WebSocket 服务器错误:', error);
});

// 启动服务器
httpServer.listen(PORT, async () => {
    try {
        // 连接数据库
        await connectDatabase();

        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const username = process.env.ADMIN_USERNAME || 'admin';
            const email = process.env.ADMIN_EMAIL || 'admin@example.com';
            const password = process.env.ADMIN_PASSWORD || 'admin@123';
            const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
            const user = new User({ username, email, passwordHash, role: 'admin' });
            await user.save();
            console.log('✅ 默认管理员已创建');
        }

        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`WebSocket server is running on the same port`);
        console.log(`Seed-ASR WebSocket service: ws://localhost:${PORT}/ws-seed-asr`);
        console.log(`Ali ASR Stream WebSocket service: ws://localhost:${PORT}/ws-asr-stream`);
        console.log(`Ali TTS Stream WebSocket service: ws://localhost:${PORT}/ws-tts-stream`);
    } catch (error) {
        console.error('❌ 启动服务器失败:', error);
        process.exit(1);
    }
});

// 处理服务器关闭
process.on('SIGINT', async () => {
    console.log('正在关闭服务器...');
    seedAsrService.closeAllConnections();
    
    try {
        await disconnectDatabase();
    } catch (error) {
        console.error('❌ 断开数据库连接失败:', error);
    }
    
    httpServer.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});
