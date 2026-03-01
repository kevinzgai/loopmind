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
          <router-link v-for="section in personalSections" :key="section.id" :to="section.path" :class="[
            'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3',
            isActive(section.path)
              ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          ]">
            <component :is="section.icon" class="w-4 h-4" />
            {{ section.label }}
          </router-link>
        </nav>

        <div class="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-6">系统配置</div>
        <nav class="space-y-1">
          <router-link v-for="section in systemSections" :key="section.id" :to="section.path" :class="[
            'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3',
            isActive(section.path)
              ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          ]">
            <component :is="section.icon" class="w-4 h-4" />
            {{ section.label }}
          </router-link>
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

        <router-view @save="handleSave" @error="handleError" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Settings, Bell, Shield, Info, Cpu, Mic, FileText, CheckCircle, XCircle, Brain, Users } from 'lucide-vue-next'

const route = useRoute()
const message = ref('')
const error = ref('')

const isAdmin = computed(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      return user.role === 'admin'
    } catch {
      return false
    }
  }
  return false
})

const personalSections = [
  { id: 'general', label: '通用设置', icon: Settings, path: '/settings' },
  { id: 'notifications', label: '通知设置', icon: Bell, path: '/settings/notifications' },
  { id: 'privacy', label: '隐私与安全', icon: Shield, path: '/settings/privacy' },
  { id: 'about', label: '关于', icon: Info, path: '/settings/about' }
]

const systemSections = computed(() => {
  const sections = [
    { id: 'ai-config', label: 'AI 模型配置', icon: Cpu, path: '/settings/ai-config' },
    { id: 'embedding-config', label: 'Embedding 配置', icon: Brain, path: '/settings/embedding-config' },
    { id: 'speech-config', label: '语音服务配置', icon: Mic, path: '/settings/speech-config' },
    { id: 'logs', label: '系统日志', icon: FileText, path: '/settings/logs' }
  ]
  if (isAdmin.value) {
    sections.push({ id: 'users', label: '账号管理', icon: Users, path: '/settings/users' })
  }
  return sections
})

function isActive(path) {
  if (path === '/settings') {
    return route.path === '/settings'
  }
  return route.path.startsWith(path)
}

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
</script>
