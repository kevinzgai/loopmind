<template>
  <div class="tts-stream-demo">
    <div class="demo-header">
      <h2>🎙️ 流式语音合成测试</h2>
      <p class="subtitle">实时文字转语音，边输入边播放</p>
    </div>

    <div class="demo-content">
      <!-- 配置区域 -->
      <div class="config-section">
        <div class="config-item">
          <label>音色选择：</label>
          <select v-model="selectedVoice" :disabled="isConnected">
            <option value="xiaoxian">小仙（亲切女声）</option>
            <option value="xiaoyun">小云（标准女声）</option>
            <option value="xiaogang">小刚（标准男声）</option>
            <option value="ruoxi">若兮（温柔女声）</option>
            <option value="siqi">思琪（温柔女声）</option>
            <option value="zhitian">知甜（甜美女声）</option>
          </select>
        </div>

        <div class="config-item">
          <label>语速：{{ speechRate }}</label>
          <input 
            type="range" 
            v-model.number="speechRate" 
            min="-500" 
            max="500" 
            step="50"
            :disabled="isConnected"
          />
        </div>

        <div class="config-item">
          <label>音量：{{ volume }}</label>
          <input 
            type="range" 
            v-model.number="volume" 
            min="0" 
            max="100" 
            step="10"
            :disabled="isConnected"
          />
        </div>
      </div>

      <!-- 文本输入区域 -->
      <div class="input-section">
        <textarea
          v-model="inputText"
          placeholder="输入要转换的文字..."
          rows="6"
          :disabled="!isConnected"
        ></textarea>
      </div>

      <!-- 控制按钮 -->
      <div class="control-section">
        <button 
          @click="connect" 
          :disabled="isConnected || isConnecting"
          class="btn btn-primary"
        >
          {{ isConnecting ? '连接中...' : '建立连接' }}
        </button>

        <button 
          @click="sendText" 
          :disabled="!isConnected || !inputText.trim() || isSending"
          class="btn btn-success"
        >
          {{ isSending ? '合成中...' : '开始合成' }}
        </button>

        <button 
          @click="stop" 
          :disabled="!isConnected"
          class="btn btn-warning"
        >
          停止合成
        </button>

        <button 
          @click="disconnect" 
          :disabled="!isConnected"
          class="btn btn-danger"
        >
          断开连接
        </button>
      </div>

      <!-- 状态显示 -->
      <div class="status-section">
        <div class="status-item">
          <span class="status-label">连接状态：</span>
          <span :class="['status-value', statusClass]">{{ statusText }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">音频状态：</span>
          <span class="status-value">{{ audioStatus }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">接收数据：</span>
          <span class="status-value">{{ receivedBytes }} bytes</span>
        </div>
      </div>

      <!-- 日志区域 -->
      <div class="log-section">
        <div class="log-header">
          <h3>📋 运行日志</h3>
          <button @click="clearLogs" class="btn-clear">清空</button>
        </div>
        <div class="log-content" ref="logContainer">
          <div 
            v-for="(log, index) in logs" 
            :key="index"
            :class="['log-item', `log-${log.type}`]"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const selectedVoice = ref('xiaoxian')
const speechRate = ref(150)
const volume = ref(50)
const inputText = ref('你好，这是一个流式语音合成测试。我会边接收数据边播放，让你感受到更流畅的语音体验。')

const isConnected = ref(false)
const isConnecting = ref(false)
const isSending = ref(false)
const audioStatus = ref('未播放')
const receivedBytes = ref(0)
const logs = ref([])
const logContainer = ref(null)

let ws = null
let audioContext = null
let audioQueue = []
let isPlaying = false
let sourceNode = null

const statusText = computed(() => {
  if (isConnecting.value) return '连接中...'
  if (isConnected.value) return '已连接'
  return '未连接'
})

const statusClass = computed(() => {
  if (isConnecting.value) return 'status-connecting'
  if (isConnected.value) return 'status-connected'
  return 'status-disconnected'
})

function addLog(message, type = 'info') {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  
  logs.value.push({ time, message, type })
  
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

function clearLogs() {
  logs.value = []
}

async function connect() {
  if (isConnected.value || isConnecting.value) return

  try {
    isConnecting.value = true
    addLog('正在建立 WebSocket 连接...', 'info')

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws-tts-stream?voice=${selectedVoice.value}&speechRate=${speechRate.value}&volume=${volume.value}`
    ws = new WebSocket(wsUrl)

    // 初始化音频上下文
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      addLog('音频上下文已初始化', 'success')
    }

    ws.binaryType = 'arraybuffer'

    ws.onopen = () => {
      addLog('✅ WebSocket 连接已建立', 'success')
      isConnected.value = true
      isConnecting.value = false
    }

    ws.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        // JSON 消息
        const message = JSON.parse(event.data)
        handleStatusMessage(message)
      } else {
        // 二进制音频数据
        receivedBytes.value += event.data.byteLength
        await playAudioChunk(event.data)
      }
    }

    ws.onerror = (error) => {
      addLog('❌ WebSocket 错误: ' + error.message, 'error')
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      addLog('🔌 WebSocket 连接已关闭', 'warning')
      isConnected.value = false
      isConnecting.value = false
    }

  } catch (error) {
    addLog('❌ 连接失败: ' + error.message, 'error')
    isConnecting.value = false
  }
}

function handleStatusMessage(message) {
  if (message.type === 'connected') {
    addLog('📡 ' + message.message, 'success')
  } else if (message.type === 'status') {
    addLog('📨 状态: ' + message.name, 'info')
    
    if (message.name === 'SynthesisStarted') {
      isSending.value = true
      audioStatus.value = '合成中...'
    } else if (message.name === 'SynthesisCompleted') {
      isSending.value = false
      audioStatus.value = '合成完成'
      addLog('✅ 语音合成完成', 'success')
    }
  } else if (message.type === 'error') {
    addLog('❌ 错误: ' + message.message, 'error')
    isSending.value = false
  } else if (message.type === 'closed') {
    addLog('🔌 服务端连接已关闭', 'warning')
  }
}

async function playAudioChunk(arrayBuffer) {
  try {
    // 解码音频数据
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // 添加到播放队列
    audioQueue.push(audioBuffer)
    
    // 如果没有正在播放，开始播放
    if (!isPlaying) {
      playNextChunk()
    }
  } catch (error) {
    console.error('解码音频失败:', error)
    addLog('❌ 音频解码失败', 'error')
  }
}

function playNextChunk() {
  if (audioQueue.length === 0) {
    isPlaying = false
    audioStatus.value = '播放完成'
    return
  }

  isPlaying = true
  audioStatus.value = '播放中...'

  const audioBuffer = audioQueue.shift()
  sourceNode = audioContext.createBufferSource()
  sourceNode.buffer = audioBuffer
  sourceNode.connect(audioContext.destination)

  sourceNode.onended = () => {
    playNextChunk()
  }

  sourceNode.start(0)
  addLog('🔊 播放音频片段', 'info')
}

function sendText() {
  if (!isConnected.value || !inputText.value.trim()) return

  try {
    ws.send(JSON.stringify({
      type: 'text',
      text: inputText.value
    }))

    addLog('📤 发送文本: ' + inputText.value.substring(0, 50) + '...', 'info')
    isSending.value = true
  } catch (error) {
    addLog('❌ 发送失败: ' + error.message, 'error')
  }
}

function stop() {
  if (!isConnected.value) return

  try {
    ws.send(JSON.stringify({
      type: 'stop'
    }))

    // 停止当前播放
    if (sourceNode) {
      sourceNode.stop()
      sourceNode = null
    }

    audioQueue = []
    isPlaying = false
    isSending.value = false
    audioStatus.value = '已停止'

    addLog('⏹️ 停止合成', 'warning')
  } catch (error) {
    addLog('❌ 停止失败: ' + error.message, 'error')
  }
}

function disconnect() {
  if (!isConnected.value) return

  stop()

  if (ws) {
    ws.close()
    ws = null
  }

  receivedBytes.value = 0
  addLog('🔌 断开连接', 'warning')
}
</script>

<style scoped>
.tts-stream-demo {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-header {
  text-align: center;
  margin-bottom: 2rem;
}

.demo-header h2 {
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #718096;
  font-size: 1rem;
}

.demo-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.config-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.config-item label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
}

.config-item select,
.config-item input[type="range"] {
  padding: 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 0.875rem;
}

.config-item input[type="range"] {
  cursor: pointer;
}

.input-section {
  margin-bottom: 1.5rem;
}

.input-section textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.input-section textarea:focus {
  outline: none;
  border-color: #4299e1;
}

.input-section textarea:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.control-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 120px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3182ce;
}

.btn-success {
  background: #48bb78;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #38a169;
}

.btn-warning {
  background: #ed8936;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #dd6b20;
}

.btn-danger {
  background: #f56565;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #e53e3e;
}

.status-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-label {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 600;
  text-transform: uppercase;
}

.status-value {
  font-size: 1rem;
  color: #2d3748;
  font-weight: 600;
}

.status-connected {
  color: #38a169;
}

.status-connecting {
  color: #ed8936;
}

.status-disconnected {
  color: #718096;
}

.log-section {
  border-top: 2px solid #e2e8f0;
  padding-top: 1.5rem;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.log-header h3 {
  font-size: 1.125rem;
  color: #2d3748;
  margin: 0;
}

.btn-clear {
  padding: 0.5rem 1rem;
  background: #edf2f7;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-clear:hover {
  background: #e2e8f0;
}

.log-content {
  max-height: 300px;
  overflow-y: auto;
  background: #1a202c;
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.log-item {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid #2d3748;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #718096;
  flex-shrink: 0;
}

.log-message {
  color: #e2e8f0;
  flex: 1;
}

.log-info .log-message {
  color: #63b3ed;
}

.log-success .log-message {
  color: #68d391;
}

.log-warning .log-message {
  color: #f6ad55;
}

.log-error .log-message {
  color: #fc8181;
}
</style>
