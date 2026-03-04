<template>
  <Dialog :open="true" @update:open="$emit('close')">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
      <DialogHeader class="p-6 border-b border-slate-200 dark:border-slate-800">
        <DialogTitle class="text-xl font-bold text-slate-900 dark:text-slate-100">API Key 使用统计</DialogTitle>
        <DialogDescription class="text-sm text-slate-500 dark:text-slate-400">查看和分析您的 API Key 使用情况</DialogDescription>
      </DialogHeader>

      <div class="p-6 overflow-y-auto flex-1">
        <div v-if="isLoading" class="py-12 flex justify-center">
          <div class="w-8 h-8 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin"></div>
        </div>

        <div v-else class="space-y-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
              <div class="flex items-center gap-2 mb-2">
                <div class="p-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg">
                  <Key class="w-4 h-4" />
                </div>
                <span class="text-xs text-slate-500 dark:text-slate-400">总 Key 数</span>
              </div>
              <div class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ summary.totalKeys }}</div>
            </div>

            <div class="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
              <div class="flex items-center gap-2 mb-2">
                <div class="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <CheckCircle class="w-4 h-4" />
                </div>
                <span class="text-xs text-slate-500 dark:text-slate-400">激活 Key</span>
              </div>
              <div class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ summary.activeKeys }}</div>
            </div>

            <div class="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
              <div class="flex items-center gap-2 mb-2">
                <div class="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Activity class="w-4 h-4" />
                </div>
                <span class="text-xs text-slate-500 dark:text-slate-400">总请求数</span>
              </div>
              <div class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ summary.totalRequests }}</div>
            </div>

            <div class="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
              <div class="flex items-center gap-2 mb-2">
                <div class="p-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
                  <XCircle class="w-4 h-4" />
                </div>
                <span class="text-xs text-slate-500 dark:text-slate-400">错误数</span>
              </div>
              <div class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ summary.totalErrors }}</div>
            </div>
          </div>

          <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">成功率</h3>
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-emerald-500 transition-all duration-500"
                    :style="{ width: successRate }"
                  ></div>
                </div>
              </div>
              <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">{{ successRate }}</div>
            </div>
          </div>

          <div class="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden">
            <div class="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">各 Key 详细统计</h3>
            </div>
            <div class="overflow-x-auto max-h-64">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 sticky top-0">
                  <tr>
                    <th class="px-4 py-2 font-medium">名称</th>
                    <th class="px-4 py-2 font-medium">状态</th>
                    <th class="px-4 py-2 font-medium text-right">请求数</th>
                    <th class="px-4 py-2 font-medium text-right">错误数</th>
                    <th class="px-4 py-2 font-medium text-right">成功率</th>
                    <th class="px-4 py-2 font-medium">最后使用</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr v-for="key in apiKeys" :key="key._id" class="hover:bg-slate-100 dark:hover:bg-slate-700/30">
                    <td class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{{ key.name }}</td>
                    <td class="px-4 py-3">
                      <span 
                        :class="[
                          'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase',
                          key.isActive 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                            : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                        ]"
                      >
                        {{ key.isActive ? 'Active' : 'Disabled' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right font-mono">{{ key.requestCount }}</td>
                    <td class="px-4 py-3 text-right font-mono text-rose-600">{{ key.errorCount }}</td>
                    <td class="px-4 py-3 text-right">
                      <span :class="key.requestCount > 0 && key.errorCount === 0 ? 'text-emerald-600' : 'text-slate-600'">
                        {{ calculateSuccessRate(key.requestCount, key.errorCount) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-slate-500">{{ key.lastUsedAt ? formatDate(key.lastUsedAt) : '从未' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Key, CheckCircle, XCircle, Activity } from 'lucide-vue-next'
import { getAllApiKeysStats } from '@/services/apiKeyService.js'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue'

const emit = defineEmits(['close'])

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

const formatDate = (dateStr) => {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', { hour12: false })
}
</script>