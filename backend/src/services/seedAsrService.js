import { v4 as uuidv4 } from 'uuid';

class SeedASRService {
  constructor(config) {
    this.config = {
      appId: config.appId,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      apiUrl: config.apiUrl || 'https://openspeech.bytedance.com/api/v3/auc/bigmodel/submit',
      resourceId: config.resourceId || 'volc.seedasr.auc',
      audioConfig: config.audioConfig || {
        format: 'wav',
        codec: 'raw',
        rate: 16000,
        bits: 16,
        channel: 1
      },
      requestConfig: {
        model_name: 'bigmodel',
        enable_itn: true,
        enable_punc: false,
        enable_ddc: false,
        enable_speaker_info: false,
        enable_channel_split: false,
        show_utterances: false,
        vad_segment: false,
        sensitive_words_filter: ''
      }
    };
    
    this.connections = new Map();
  }

  async handleConnection(clientWs, clientId) {
    try {
      console.log(`客户端已连接，ID: ${clientId}`);
      
      this.connections.set(clientId, {
        clientWs,
        audioBuffer: [],
        isRecording: false
      });
      
      clientWs.on('message', (data) => {
        const connection = this.connections.get(clientId);
        if (!connection) return;

        if (Buffer.isBuffer(data)) {
          this.handleAudioData(clientWs, clientId, data);
        } else {
          this.handleControlMessage(clientWs, clientId, data.toString());
        }
      });
      
      clientWs.on('close', (code, reason) => {
        console.log(`客户端连接已关闭，客户端 ID: ${clientId}，代码: ${code}，原因: ${reason}`);
        this.connections.delete(clientId);
      });
      
      clientWs.on('error', (error) => {
        console.error(`客户端连接错误，客户端 ID: ${clientId}，错误:`, error);
        this.connections.delete(clientId);
      });
      
    } catch (error) {
      console.error(`处理客户端连接时出错，客户端 ID: ${clientId}，错误:`, error);
      if (clientWs.readyState === 1) {
        clientWs.send(JSON.stringify({ type: 'error', message: `连接 ASR 服务失败：${error.message}` }));
        clientWs.close(1011, '服务端连接错误');
      }
      this.connections.delete(clientId);
    }
  }

  handleAudioData(clientWs, clientId, audioData) {
    const connection = this.connections.get(clientId);
    if (!connection) return;

    if (connection.isRecording) {
      connection.audioBuffer.push(audioData);
      console.log(`收到音频数据，客户端 ID: ${clientId}，当前缓冲区大小: ${connection.audioBuffer.length}，数据大小: ${audioData.length} 字节`);
    } else {
      console.log(`收到音频数据但未在录音中，客户端 ID: ${clientId}，数据大小: ${audioData.length} 字节`);
    }
  }

  handleControlMessage(clientWs, clientId, message) {
    try {
      console.log(`收到控制消息，客户端 ID: ${clientId}，消息: ${message}`);
      const data = JSON.parse(message);
      
      if (data.type === 'start_recording') {
        this.startRecording(clientWs, clientId);
      } else if (data.type === 'stop_recording') {
        this.stopRecording(clientWs, clientId);
      } else {
        console.log(`未知的消息类型，客户端 ID: ${clientId}，类型: ${data.type}`);
      }
    } catch (error) {
      console.error(`解析控制消息时出错，客户端 ID: ${clientId}，错误:`, error);
    }
  }

  startRecording(clientWs, clientId) {
    const connection = this.connections.get(clientId);
    if (!connection) return;

    connection.isRecording = true;
    connection.audioBuffer = [];
    
    this.sendMessage(clientWs, {
      type: 'recording_started',
      message: '开始录音'
    });
    
    console.log(`开始录音，客户端 ID: ${clientId}`);
  }

  async stopRecording(clientWs, clientId) {
    const connection = this.connections.get(clientId);
    if (!connection) return;

    connection.isRecording = false;
    
    const audioData = Buffer.concat(connection.audioBuffer);
    console.log(`停止录音，客户端 ID: ${clientId}，音频大小: ${audioData.length} 字节`);
    
    this.sendMessage(clientWs, {
      type: 'recording_stopped',
      message: '正在识别...'
    });
    
    await this.submitAudioForRecognition(clientWs, clientId, audioData);
  }

  async submitAudioForRecognition(clientWs, clientId, audioData) {
    try {
      console.log(`提交音频进行识别，客户端 ID: ${clientId}，音频大小: ${audioData.length} 字节`);
      console.log(`API URL: ${this.config.apiUrl}`);
      console.log(`API Key: ${this.config.apiKey ? '已设置' : '未设置'}`);
      console.log(`Resource ID: ${this.config.resourceId}`);
      
      const requestId = uuidv4();
      const requestBody = {
        user: {
          uid: clientId
        },
        audio: {
          data: audioData.toString('base64'),
          format: this.config.audioConfig.format,
          codec: this.config.audioConfig.codec,
          rate: this.config.audioConfig.rate,
          bits: this.config.audioConfig.bits,
          channel: this.config.audioConfig.channel
        },
        request: {
          ...this.config.requestConfig
        }
      };
      
      console.log('请求体:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'X-Api-Resource-Id': this.config.resourceId,
          'X-Api-Request-Id': requestId,
          'X-Api-Sequence': '-1'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log(`API 响应状态: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API 请求失败: ${response.status} ${errorText}`);
        throw new Error(`API 请求失败: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`识别结果，客户端 ID: ${clientId}:`, result);
      
      this.sendMessage(clientWs, {
        type: 'recognition_result',
        data: result
      });
      
    } catch (error) {
      console.error(`提交音频识别时出错，客户端 ID: ${clientId}，错误:`, error);
      this.sendError(clientWs, `识别失败：${error.message}`);
    }
  }

  sendMessage(clientWs, message) {
    if (clientWs.readyState === 1) {
      clientWs.send(JSON.stringify(message));
    }
  }

  sendError(clientWs, errorMessage) {
    this.sendMessage(clientWs, {
      type: 'error',
      message: errorMessage
    });
  }

  closeAllConnections() {
    for (const [clientId, { clientWs }] of this.connections.entries()) {
      if (clientWs.readyState === 1) {
        clientWs.close(1000, '服务关闭');
      }
      this.connections.delete(clientId);
    }
  }
}

export default SeedASRService;
