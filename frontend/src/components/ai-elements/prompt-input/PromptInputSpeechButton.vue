<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { MicIcon, MicOffIcon } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { usePromptInput } from './context'
import PromptInputButton from './PromptInputButton.vue'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const { textInput, setTextInput } = usePromptInput()

const isRecording = ref(false)
const isConnecting = ref(false)
const recognitionStatus = ref('')
const ws = ref<WebSocket | null>(null)
let audioContext: AudioContext | null = null
let processor: ScriptProcessorNode | null = null
let mediaStream: MediaStream | null = null

// 计算按钮状态文本
const buttonTitle = computed(() => {
  if (isRecording.value) return '🎤 正在录音... 松开结束'
  if (isConnecting.value) return '⏳ 正在连接...'
  return '🎤 按住录音，松开识别'
})

// 处理 WebSocket 消息
function handleWebSocketMessage(event: MessageEvent) {
  try {
    const data = JSON.parse(event.data)
    console.log('📨 收到消息:', data)
    
    if (data.type === 'started') {
      console.log('✅ 识别已开始')
      isConnecting.value = false
      isRecording.value = true
      recognitionStatus.value = '正在识别...'
    } else if (data.type === 'intermediate') {
      // 中间结果 - 显示在状态中
      recognitionStatus.value = `识别中: ${data.text}`
      console.log('📝 中间结果:', data.text)
    } else if (data.type === 'result') {
      // 最终结果 - 添加到输入框
      if (data.text) {
        const currentText = textInput.value || ''
        const newText = currentText + (currentText ? ' ' : '') + data.text
        setTextInput(newText)
        recognitionStatus.value = `✅ 已添加: ${data.text}`
        console.log('✅ 识别完成:', data.text)
        
        // 3秒后清除状态
        setTimeout(() => {
          if (recognitionStatus.value.startsWith('✅')) {
            recognitionStatus.value = ''
          }
        }, 3000)
      }
    } else if (data.type === 'error') {
      console.error('❌ 识别错误:', data.message)
      recognitionStatus.value = `❌ 错误: ${data.message}`
      stopRecording()
    } else if (data.type === 'completed') {
      console.log('🎉 识别完成')
      recognitionStatus.value = '识别完成'
    }
  } catch (error) {
    console.error('❌ 解析消息失败:', error)
  }
}

// 开始录音
async function startRecording() {
  if (isRecording.value || isConnecting.value) return
  
  try {
    isConnecting.value = true
    recognitionStatus.value = '正在连接...'
    
    // 请求麦克风权限
    mediaStream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    })
    
    // 创建音频上下文
    audioContext = new AudioContext({ sampleRate: 16000 })
    const source = audioContext.createMediaStreamSource(mediaStream)
    
    // 建立 WebSocket 连接
    const wsUrl = 'ws://localhost:3000/ws-asr-stream'
    ws.value = new WebSocket(wsUrl)
    
    ws.value.onopen = () => {
      console.log('✅ WebSocket 连接已建立')
      recognitionStatus.value = '已连接，开始说话...'
    }
    
    ws.value.onmessage = handleWebSocketMessage
    
    ws.value.onerror = (error) => {
      console.error('❌ WebSocket 错误:', error)
      recognitionStatus.value = '❌ 连接失败'
      stopRecording()
      isConnecting.value = false
    }
    
    ws.value.onclose = () => {
      console.log('🔌 WebSocket 连接已关闭')
      isRecording.value = false
      isConnecting.value = false
      if (!recognitionStatus.value.startsWith('✅')) {
        recognitionStatus.value = ''
      }
    }
    
    // 创建音频处理器
    processor = audioContext.createScriptProcessor(4096, 1, 1)
    
    processor.onaudioprocess = (e) => {
      if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        const inputData = e.inputBuffer.getChannelData(0)
        
        // 转换为 16-bit PCM
        const pcmData = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]))
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
        }
        
        // 发送 PCM 数据
        ws.value.send(pcmData.buffer)
      }
    }
    
    source.connect(processor)
    processor.connect(audioContext.destination)
    
    console.log('🎤 开始录音')
    
  } catch (error) {
    console.error('❌ 启动录音失败:', error)
    isConnecting.value = false
    recognitionStatus.value = '❌ 无法访问麦克风'
    alert('无法访问麦克风：' + (error as Error).message)
  }
}

// 停止录音
function stopRecording() {
  console.log('🛑 停止录音')
  
  // 发送停止指令
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    ws.value.send(JSON.stringify({ type: 'stop' }))
    recognitionStatus.value = '正在处理...'
    
    // 延迟关闭连接，确保停止消息发送成功
    setTimeout(() => {
      if (ws.value) {
        ws.value.close()
        ws.value = null
      }
    }, 500)
  }
  
  // 停止音频处理
  if (processor) {
    processor.disconnect()
    processor = null
  }
  
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
  
  // 停止媒体流
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  
  isRecording.value = false
  isConnecting.value = false
}

function handleRecordStart(event: Event) {
  event.preventDefault()
  startRecording()
}

function handleRecordEnd(event: Event) {
  event.preventDefault()
  stopRecording()
}

onUnmounted(() => {
  stopRecording()
})
</script>

<template>
  <div class="relative inline-flex items-center gap-2">
    <PromptInputButton
      :class="cn(
        'relative transition-all duration-200',
        isRecording && 'animate-pulse bg-red-500 text-white hover:bg-red-600',
        isConnecting && 'bg-yellow-500 text-white cursor-wait',
        !isRecording && !isConnecting && 'hover:bg-accent hover:text-accent-foreground',
        props.class,
      )"
      v-bind="props"
      @mousedown="handleRecordStart"
      @mouseup="handleRecordEnd"
      @mouseleave="stopRecording"
      @touchstart="handleRecordStart"
      @touchend="handleRecordEnd"
      :title="buttonTitle"
    >
      <MicIcon v-if="!isRecording" class="size-4" />
      <MicIcon v-else class="size-4 animate-bounce" />
    </PromptInputButton>
    
    <!-- 状态提示 -->
    <transition name="fade">
      <span 
        v-if="recognitionStatus" 
        class="absolute left-full ml-2 whitespace-nowrap text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm"
      >
        {{ recognitionStatus }}
      </span>
    </transition>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-bounce {
  animation: bounce 0.5s ease-in-out infinite;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
