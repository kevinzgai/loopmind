<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">API Key 使用统计</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">查看和分析您的 API Key 使用情况</p>
      </div>
      <router-link to="/api-keys" class="text-sm text-violet-600 dark:text-violet-400 font-medium flex items-center hover:underline">
        <ArrowLeft class="w-4 h-4 mr-1" />
        返回管理
      </router-link>
    </div>

    <div v-if="isLoading" class="py-12 flex justify-center">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg">
              <Key class="w-5 h-5" />
            </div>
            <span class="text-sm text-slate-500 dark:text-slate-400">总 Key 数</span>
          </div>
          <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ summary.totalKeys }}</div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle class="w-5 h-5" />
            </div>
            <span class="text-sm text-slate-500 dark:text-slate-400">激活 Key</span>
          </div>
          <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ summary.activeKeys }}</div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Activity class="w-5 h-5" />
            </div>
            <span class="text-sm text-slate-500 dark:text-slate-400">总请求数</span>
          </div>
          <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ summary.totalRequests }}</div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
              <XCircle class="w-5 h-5" />
            </div>
            <span class="text-sm text-slate-500 dark:text-slate-400">错误数</span>
          </div>
          <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ summary.totalErrors }}</div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">成功率</h3>
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                class="h-full bg-emerald-500 transition-all duration-500"
                :style="{ width: successRate }"
              ></div>
            </div>
          </div>
          <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ successRate }}</div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">各 Key 详细统计</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500">
              <tr>
                <th class="px-6 py-3 font-medium">名称</th>
                <th class="px-6 py-3 font-medium">状态</th>
                <th class="px-6 py-3 font-medium text-right">请求数</th>
                <th class="px-6 py-3 font-medium text-right">错误数</th>
                <th class="px-6 py-3 font-medium text-right">成功率</th>
                <th class="px-6 py-3 font-medium">最后使用</th>
                <th class="px-6 py-3 font-medium">创建时间</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="key in apiKeys" :key="key._id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{{ key.name }}</td>
                <td class="px-6 py-4">
                  <span 
                    :class="[
                      'px-2 py-1 rounded text-[10px] font-bold uppercase',
                      key.isActive 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    ]"
                  >
                    {{ key.isActive ? 'Active' : 'Disabled' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right font-mono">{{ key.requestCount }}</td>
                <td class="px-6 py-4 text-right font-mono text-rose-600">{{ key.errorCount }}</td>
                <td class="px-6 py-4 text-right">
                  <span :class="key.requestCount > 0 && key.errorCount === 0 ? 'text-emerald-600' : 'text-slate-600'">
                    {{ calculateSuccessRate(key.requestCount, key.errorCount) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-500">{{ key.lastUsedAt ? formatDate(key.lastUsedAt, true) : '从未' }}</td>
                <td class="px-6 py-4 text-slate-500">{{ formatDate(key.createdAt, true) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Key, CheckCircle, XCircle, Activity } from 'lucide-vue-next'
import { getAllApiKeysStats } from '@/services/apiKeyService.js'

const summary = ref({
  totalKeys: 0,
  activeKeys: 0,
  totalRequests: 0,
  totalErrors: 0,
  successRate: '0%'
})

const apiKeys = ref([])
const isLoading = ref(true)

const successRate = computed(() => summary.value.successRate)

onMounted(async () => {
  await loadStats()
})

const loadStats = async () => {
  try {
    isLoading.value = true
    const response = await getAllApiKeysStats()
    summary.value = response.summary
    apiKeys.value = response.apiKeys
  } catch (err) {
    console.error('加载统计失败:', err)
  } finally {
    isLoading.value = false
  }
}

const calculateSuccessRate = (requests, errors) => {
  if (requests === 0) return '0%'
  const rate = ((requests - errors) / requests * 100).toFixed(2)
  return rate + '%'
}

const formatDate = (dateStr, time = false) => {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  if (time) {
    return date.toLocaleString('zh-CN', { hour12: false })
  }
  return date.toLocaleDateString('zh-CN')
}
</script>
