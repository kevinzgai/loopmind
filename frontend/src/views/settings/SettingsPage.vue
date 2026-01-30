<template>
  <div class="w-full space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">系统设置</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">管理您的账户偏好和应用配置</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <aside class="md:col-span-1 space-y-2">
        <div class="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">个人设置</div>
        <nav class="space-y-1">
          <button v-for="section in personalSections" :key="section.id" @click="activeSection = section.id" :class="[
            'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3',
            activeSection === section.id
              ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          ]">
            <component :is="section.icon" class="w-4 h-4" />
            {{ section.label }}
          </button>
        </nav>

        <div class="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-6">系统配置</div>
        <nav class="space-y-1">
          <button v-for="section in systemSections" :key="section.id" @click="activeSection = section.id" :class="[
            'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3',
            activeSection === section.id
              ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          ]">
            <component :is="section.icon" class="w-4 h-4" />
            {{ section.label }}
          </button>
        </nav>
      </aside>

      <main class="md:col-span-3 space-y-6">
        <div v-if="message" class="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-lg flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
          <CheckCircle class="w-5 h-5" />
          {{ message }}
        </div>
        <div v-if="error" class="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-lg flex items-center gap-3 text-rose-700 dark:text-rose-400">
          <XCircle class="w-5 h-5" />
          {{ error }}
        </div>

        <GeneralSettings v-if="activeSection === 'general'" />
        <NotificationSettings v-if="activeSection === 'notifications'" />
        <PrivacySettings v-if="activeSection === 'privacy'" />
        <AboutSettings v-if="activeSection === 'about'" />
        <AIConfigSettings ref="aiConfigRef" v-if="activeSection === 'ai-config'" @save="handleSave" @error="handleError" />
        <EmbeddingSettings ref="embeddingRef" v-if="activeSection === 'embedding-config'" @save="handleSave" @error="handleError" />
        <SpeechConfigSettings ref="speechConfigRef" v-if="activeSection === 'speech-config'" @save="handleSave" @error="handleError" />
        <SystemLogs v-if="activeSection === 'logs'" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Settings, Bell, Shield, Info, Cpu, Mic, FileText, CheckCircle, XCircle, Brain } from 'lucide-vue-next'
import GeneralSettings from '@/components/settings/GeneralSettings.vue'
import NotificationSettings from '@/components/settings/NotificationSettings.vue'
import PrivacySettings from '@/components/settings/PrivacySettings.vue'
import AboutSettings from '@/components/settings/AboutSettings.vue'
import AIConfigSettings from '@/components/settings/AIConfigSettings.vue'
import EmbeddingSettings from '@/components/settings/EmbeddingSettings.vue'
import SpeechConfigSettings from '@/components/settings/SpeechConfigSettings.vue'
import SystemLogs from '@/components/settings/SystemLogs.vue'

const activeSection = ref('general')
const message = ref('')
const error = ref('')
const aiConfigRef = ref(null)
const embeddingRef = ref(null)
const speechConfigRef = ref(null)

const personalSections = [
  { id: 'general', label: '通用设置', icon: Settings },
  { id: 'notifications', label: '通知设置', icon: Bell },
  { id: 'privacy', label: '隐私与安全', icon: Shield },
  { id: 'about', label: '关于', icon: Info }
]

const systemSections = [
  { id: 'ai-config', label: 'AI 模型配置', icon: Cpu },
  { id: 'embedding-config', label: 'Embedding 配置', icon: Brain },
  { id: 'speech-config', label: '语音服务配置', icon: Mic },
  { id: 'logs', label: '系统日志', icon: FileText }
]

function handleSave(msg) {
  message.value = msg || '配置已成功保存'
  error.value = ''
  setTimeout(() => message.value = '', 3000)
}

function handleError(err) {
  error.value = err.message || '操作失败'
  message.value = ''
  setTimeout(() => error.value = '', 3000)
}

onMounted(() => {
  if (aiConfigRef.value) {
    aiConfigRef.value.loadConfig()
  }
  if (embeddingRef.value) {
    embeddingRef.value.loadConfig()
  }
  if (speechConfigRef.value) {
    speechConfigRef.value.loadConfig()
  }
})
</script>