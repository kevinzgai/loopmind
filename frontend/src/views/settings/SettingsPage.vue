<template>
  <div class="w-full space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">系统设置</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">管理您的账户偏好和应用配置</p>
      </div>
    </div>

    <div v-if="message" class="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-lg flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
      <CheckCircle class="w-5 h-5" />
      {{ message }}
    </div>
    <div v-if="error" class="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-lg flex items-center gap-3 text-rose-700 dark:text-rose-400">
      <XCircle class="w-5 h-5" />
      {{ error }}
    </div>

    <router-view @save="handleSave" @error="handleError" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CheckCircle, XCircle } from 'lucide-vue-next'

const message = ref('')
const error = ref('')

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
