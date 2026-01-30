<template>
  <section class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">系统日志</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">查看系统运行日志</p>
      </div>
      <div class="flex gap-2">
        <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input type="checkbox" v-model="autoRefresh" class="rounded border-slate-300 text-violet-600" />
          自动刷新 (5s)
        </label>
        <select v-model="logLevel"
          class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
          <option value="all">所有级别</option>
          <option value="info">INFO</option>
          <option value="warn">WARN</option>
          <option value="error">ERROR</option>
        </select>
        <button @click="fetchLogs" :disabled="logsLoading"
          class="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          {{ logsLoading ? '加载中...' : '刷新日志' }}
        </button>
      </div>
    </div>

    <div class="bg-slate-950 rounded-lg p-4 overflow-y-auto max-h-96">
      <div v-if="logs.length === 0" class="text-center text-slate-500 py-8">暂无日志</div>
      <div v-else class="space-y-1 font-mono text-sm">
        <div v-for="(log, index) in filteredLogs" :key="index" class="flex gap-3" :class="{
          'text-emerald-400': log.level === 'info',
          'text-amber-400': log.level === 'warn',
          'text-rose-400': log.level === 'error'
        }">
          <span class="text-slate-500">{{ log.timestamp }}</span>
          <span class="font-bold min-w-16">{{ log.level.toUpperCase() }}</span>
          <span class="text-slate-300">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import apiService from '@/services/apiService.js'

const logs = ref([])
const logsLoading = ref(false)
const logLevel = ref('all')
const autoRefresh = ref(false)
let refreshTimer = null

const filteredLogs = computed(() => {
  if (logLevel.value === 'all') return logs.value
  return logs.value.filter(log => log.level === logLevel.value)
})

async function fetchLogs() {
  try {
    logsLoading.value = true
    const res = await apiService.get('/admin/logs')
    logs.value = res.logs || []
  } catch (e) {
    console.error('加载日志失败', e)
  } finally {
    logsLoading.value = false
  }
}

watch(autoRefresh, (newValue) => {
  if (newValue) {
    refreshTimer = setInterval(fetchLogs, 5000)
  } else {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }
})

onMounted(() => {
  fetchLogs()
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>
