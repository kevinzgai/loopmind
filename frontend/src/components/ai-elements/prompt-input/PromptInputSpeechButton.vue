<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { MicIcon } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'
import { usePromptInput } from './context'
import PromptInputButton from './PromptInputButton.vue'
import { SeedASRClient, defaultSeedASROptions } from '@/services/seedAsrService'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const { textInput, setTextInput } = usePromptInput()

const isRecording = ref(false)
const isConnecting = ref(false)
const recognition = ref<SeedASRClient | null>(null)

function handleRecognition(event: any) {
  switch (event.type) {
    case 'connect':
      console.log('✅ Seed-ASR 连接成功')
      isConnecting.value = false
      break
    case 'recording_started':
      isRecording.value = true
      break
    case 'recording_stopped':
      console.log('🎤 录音停止，正在识别...')
      break
    case 'recognition_result':
      handleRecognitionResult(event.data)
      break
    case 'error':
      console.error('❌ Seed-ASR 错误:', event.error)
      isRecording.value = false
      isConnecting.value = false
      alert('❌ Seed-ASR 服务错误: ' + event.error)
      break
    case 'disconnect':
      console.log('🎤 Seed-ASR 连接已断开')
      isRecording.value = false
      isConnecting.value = false
      break
  }
}

function handleRecognitionResult(data: any) {
  if (!data) return
  
  console.log('🎤 识别结果:', data)
  
  if (data.error) {
    alert('❌ 识别失败: ' + data.error)
    return
  }
  
  const recognizedText = data.result?.text || data.text || ''
  if (recognizedText) {
    const currentText = textInput.value || ''
    setTextInput(currentText + (currentText ? ' ' : '') + recognizedText)
  }
}

function startRecording() {
  if (!recognition.value || isRecording.value || isConnecting.value) return
  
  isConnecting.value = true
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(() => recognition.value!.connect())
    .catch((error) => {
      console.error('❌ 无法访问麦克风:', error)
      isConnecting.value = false
      alert('❌ 无法访问麦克风：' + error.message)
    })
}

function stopRecording() {
  if (!recognition.value || !isRecording.value) return
  recognition.value.stopRecording()
}

function handleRecordStart(event: Event) {
  event.preventDefault()
  startRecording()
}

function handleRecordEnd(event: Event) {
  event.preventDefault()
  stopRecording()
}

onMounted(() => {
  try {
    const seedAsrClient = new SeedASRClient(defaultSeedASROptions)
    seedAsrClient.on(handleRecognition)
    recognition.value = seedAsrClient
  } catch (error) {
    console.error('❌ Seed-ASR 初始化失败:', error)
  }
})

onUnmounted(() => {
  recognition.value?.disconnect()
  recognition.value = null
})
</script>

<template>
  <PromptInputButton
    :disabled="!recognition"
    :class="cn(
      'relative transition-all duration-200',
      isRecording && 'animate-pulse bg-accent text-accent-foreground',
      isConnecting && 'opacity-50 cursor-wait',
      props.class,
    )"
    v-bind="props"
    @mousedown="handleRecordStart"
    @mouseup="handleRecordEnd"
    @mouseleave="stopRecording"
    @touchstart="handleRecordStart"
    @touchend="handleRecordEnd"
    title="按住录音，松开识别"
  >
    <MicIcon class="size-4" />
  </PromptInputButton>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

.animate-pulse {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
