interface SeedASROptions {
  appId: string;
  apiKey: string;
  apiSecret: string;
  language?: string;
  model?: string;
  format?: string;
  sampleRate?: number;
  channel?: number;
}

interface SeedASREvent {
  type: 'result' | 'error' | 'connect' | 'disconnect' | 'recording_started' | 'recording_stopped' | 'recognition_result';
  data?: any;
  error?: string;
  message?: string;
}

export class SeedASRClient {
  private options: SeedASROptions;
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private audioSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private bufferSize: number = 4096;
  private listeners: Array<(event: SeedASREvent) => void> = [];
  private _isConnected: boolean = false;
  private _isRecording: boolean = false;
  private audioInterval: number | null = null;

  constructor(options: SeedASROptions) {
    this.options = {
      language: 'zh-CN',
      model: 'bigmodel',
      format: 'pcm',
      sampleRate: 16000,
      channel: 1,
      ...options
    };
  }

  on(event: (event: SeedASREvent) => void): void {
    this.listeners.push(event);
  }

  off(event: (event: SeedASREvent) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== event);
  }

  private emit(event: SeedASREvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  async connect(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.audioContext = new AudioContext({ sampleRate: this.options.sampleRate || 16000 });
      this.audioSource = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.processor = this.audioContext.createScriptProcessor(this.bufferSize, this.options.channel || 1, this.options.channel || 1);

      let wsUrl = '';
      if (typeof window !== 'undefined') {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${protocol}//${window.location.host}/seed-asr`;
      } else {
        wsUrl = 'ws://localhost:3000/seed-asr';
      }
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => { 
        this._isConnected = true;
        this.setupAudioProcessor();
        this.emit({ type: 'connect' });
      };
      
      this.ws.onmessage = (event) => {
        try {
          const result = JSON.parse(event.data);
          
          switch (result.type) {
            case 'result':
              this.emit({ type: 'result', data: result.data });
              break;
            case 'recognition_result':
              this.emit({ type: 'recognition_result', data: result.data });
              break;
            case 'recording_started':
              this.emit({ type: 'recording_started', message: result.message });
              break;
            case 'recording_stopped':
              this.emit({ type: 'recording_stopped', message: result.message });
              break;
            case 'error':
              this.emit({ type: 'error', error: result.message });
              break;
            default:
              console.log('未知消息类型:', result.type);
          }
        } catch (error) {
          this.emit({ type: 'error', error: `解析结果失败: ${error}` });
        }
      };
      
      this.ws.onerror = (error) => {
        this.emit({ type: 'error', error: `WebSocket 错误: ${error}` });
      };
      
      this.ws.onclose = () => {
        this._isConnected = false;
        this._isRecording = false;
        this.emit({ type: 'disconnect' });
        this.cleanup();
      };
      
    } catch (error) {
      this.emit({ type: 'error', error: `连接失败: ${error instanceof Error ? error.message : String(error)}` });
      this.cleanup();
      throw error;
    }
  }

  async startRecording(): Promise<void> {
    if (!this._isConnected || !this.ws) {
      throw new Error('WebSocket 未连接');
    }

    if (this._isRecording) {
      throw new Error('已经在录音中');
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('发送 start_recording 消息到服务器');
      this.ws.send(JSON.stringify({ type: 'start_recording' }));
      this._isRecording = true;
      console.log('录音状态已设置为 true');
    }
  }

  private setupAudioProcessor(): void {
    if (!this.processor || !this.audioSource || !this.audioContext) {
      return;
    }

    this.processor.onaudioprocess = (e) => {
      if (this._isRecording && this.ws && this.ws.readyState === WebSocket.OPEN) {
        const audioData = e.inputBuffer.getChannelData(0);
        const pcm16Data = this.float32ToInt16(audioData);
        this.ws.send(pcm16Data);
      }
    };

    this.audioSource.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  async stopRecording(): Promise<void> {
    if (!this._isRecording) {
      throw new Error('没有在录音中');
    }

    console.log('停止录音，当前录音状态:', this._isRecording);
    this._isRecording = false;
    
    if (this.processor) {
      this.processor.disconnect();
    }
    
    if (this.audioSource) {
      this.audioSource.disconnect();
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('发送 stop_recording 消息到服务器');
      this.ws.send(JSON.stringify({ type: 'stop_recording' }));
    }
  }

  disconnect(): void {
    this._isConnected = false;
    this._isRecording = false;
    this.cleanup();
  }

  private cleanup(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.audioSource) {
      this.audioSource.disconnect();
      this.audioSource = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  private float32ToInt16(float32Data: Float32Array): Int16Array {
    const int16Data = new Int16Array(float32Data.length);
    for (let i = 0; i < float32Data.length; i++) {
      const sample = Math.max(-1, Math.min(1, float32Data[i]));
      int16Data[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    return int16Data;
  }

  isConnected(): boolean {
    return this._isConnected;
  }

  isRecording(): boolean {
    return this._isRecording;
  }
}

export const defaultSeedASROptions: SeedASROptions = {
  appId: '',
  apiKey: '',
  apiSecret: ''
};
