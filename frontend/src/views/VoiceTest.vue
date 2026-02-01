<template>
  <div class="voice-test-container">
    <h1 class="voice-test-title">🎤 语音识别测试</h1>
    
    <div class="status-card">
      <h3>状态</h3>
      <p>{{ status }}</p>
    </div>
    
    <div class="result-card">
      <h3>识别结果</h3>
      <p class="result-text">{{ recognizedText || '点击下方按钮开始录音' }}</p>
    </div>
    
    <div class="button-container">
      <button 
        class="record-button" 
        :class="{ recording: isRecording }"
        @click="toggleRecording"
      >
        {{ isRecording ? '⏹️ 停止录音' : '🎤 开始录音' }}
      </button>
    </div>
    
    <div class="logs-card">
      <h3>日志</h3>
      <div class="logs-content">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 状态变量
const isRecording = ref(false)
const status = ref('就绪')
const recognizedText = ref('')
const logs = ref([])

// 音频变量
let mediaRecorder = null
let audioChunks = []
let mediaStream = null
let audioContext = null
let analyser = null

// 添加日志
const addLog = (message) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push({ time: timestamp, message })
  // 限制日志数量
  if (logs.value.length > 50) {
    logs.value.shift()
  }
}

// 更新状态
const updateStatus = (newStatus) => {
  status.value = newStatus
  addLog(`状态更新: ${newStatus}`)
}

// 更新识别结果
const updateResult = (text) => {
  recognizedText.value = text
  addLog(`识别结果: ${text}`)
}

// 开始录音
const startRecording = async () => {
  addLog('开始录音')
  updateStatus('正在录音...')
  isRecording.value = true
  audioChunks = []
  
  try {
    // 请求麦克风权限
    addLog('请求麦克风权限')
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })
    
    // 创建音频上下文用于可视化
    audioContext = new AudioContext()
    const source = audioContext.createMediaStreamSource(mediaStream)
    
    // 创建分析器用于可视化
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    
    // 创建 MediaRecorder 实例
    mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType: 'audio/webm'
    })
    
    // 处理录音数据
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }
    
    // 处理录音结束
    mediaRecorder.onstop = async () => {
      addLog('录音结束，开始处理音频文件')
      updateStatus('处理中...')
      
      try {
        // 创建完整的音频文件
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        addLog(`音频文件大小: ${audioBlob.size} 字节`)
        
        // 创建 FormData 发送文件
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.webm')
        
        // 发送到后端处理
        addLog('发送音频文件到后端')
        const response = await fetch('http://localhost:3002/api/asr', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        addLog(`后端处理完成，结果: ${result.text}`)
        
        if (result.text) {
          updateResult(result.text)
        } else {
          addLog('错误: 没有识别到文本')
          updateStatus('错误: 没有识别到文本')
        }
      } catch (error) {
        addLog(`错误: 处理音频文件失败 - ${error.message}`)
        updateStatus(`错误: 处理音频文件失败`)
      } finally {
        // 清理资源
        cleanupRecording()
      }
    }
    
    // 开始录音
    mediaRecorder.start()
    addLog('录音已开始')
    updateStatus('录音中...')
  } catch (error) {
    addLog(`错误: 启动录音失败 - ${error.message}`)
    updateStatus('错误: 启动录音失败')
    cleanupRecording()
  }
}

// 清理录音资源
const cleanupRecording = () => {
  isRecording.value = false
  updateStatus('就绪')
  
  // 停止媒体流
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  
  // 关闭音频上下文
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
  
  // 重置分析器
  analyser = null
}

// 可视化音频
const visualizeAudio = () => {
  if (!analyser || !isRecording.value) return
  
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  
  const draw = () => {
    if (!analyser || !isRecording.value) return
    
    analyser.getByteFrequencyData(dataArray)
    
    // 计算平均音量
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i]
    }
    const average = sum / dataArray.length
    
    // 这里可以添加可视化逻辑
    
    requestAnimationFrame(draw)
  }
  
  draw()
}

// 停止录音
const stopRecording = () => {
  if (!isRecording.value) return
  
  addLog('停止录音')
  
  // 停止 MediaRecorder
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  } else {
    addLog('警告: MediaRecorder 不存在或未在录音')
    cleanupRecording()
  }
}

// 切换录音状态
const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// 组件挂载时
onMounted(() => {
  addLog('页面已加载，准备就绪')
  updateStatus('就绪')
})

// 组件卸载时
onUnmounted(() => {
  if (isRecording.value) {
    stopRecording()
  }
  if (ws) {
    ws.close()
  }
})
</script>

<style scoped>
.voice-test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.voice-test-title {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-size: 28px;
}

.status-card,
.result-card,
.logs-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.status-card h3,
.result-card h3,
.logs-card h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 18px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.status-card p {
  font-size: 16px;
  color: #666;
}

.result-text {
  font-size: 18px;
  line-height: 1.5;
  color: #333;
  min-height: 80px;
  display: flex;
  align-items: center;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.button-container {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.record-button {
  font-size: 20px;
  padding: 15px 40px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.record-button:not(.recording) {
  background: #3498db;
  color: white;
}

.record-button.recording {
  background: #e74c3c;
  color: white;
}

.record-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.logs-card {
  max-height: 300px;
}

.logs-content {
  max-height: 200px;
  overflow-y: auto;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  font-family: monospace;
  font-size: 14px;
}

.log-item {
  margin-bottom: 8px;
  display: flex;
}

.log-time {
  color: #999;
  margin-right: 10px;
  min-width: 100px;
}

.log-message {
  color: #333;
}

@media (max-width: 768px) {
  .voice-test-container {
    padding: 20px 15px;
  }
  
  .voice-test-title {
    font-size: 24px;
  }
  
  .record-button {
    font-size: 18px;
    padding: 12px 30px;
  }
}
</style>