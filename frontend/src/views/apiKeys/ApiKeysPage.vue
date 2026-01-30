<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">API Keys 管理</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">创建和管理您的 API 访问凭证</p>
      </div>
      <button 
        @click="showCreateModal = true"
        :disabled="apiKeys.length >= maxKeys"
        class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
        <Plus class="w-4 h-4 mr-2" />
        创建新 Key
      </button>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <div class="text-sm text-slate-500 dark:text-slate-400">
            已使用 <span class="font-bold text-slate-900 dark:text-slate-100">{{ apiKeys.length }}</span> / {{ maxKeys }} 个 Key
          </div>
          <div class="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
          <div class="text-sm text-slate-500 dark:text-slate-400">
            激活: <span class="font-bold text-emerald-600">{{ activeKeysCount }}</span>
          </div>
        </div>
        <router-link to="/api-keys/stats" class="text-sm text-violet-600 dark:text-violet-400 font-medium flex items-center hover:underline">
          <BarChart3 class="w-4 h-4 mr-1" />
          查看统计
        </router-link>
      </div>

      <div v-if="isLoading" class="py-12 flex justify-center">
        <div class="w-8 h-8 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin"></div>
      </div>

      <div v-else-if="apiKeys.length === 0" class="py-12 text-center">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key class="w-8 h-8 text-slate-400" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">暂无 API Keys</h3>
        <p class="text-slate-500 dark:text-slate-400 mb-4">创建您的第一个 API Key 以开始使用外部 API</p>
        <button 
          @click="showCreateModal = true"
          class="inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus class="w-4 h-4 mr-2" />
          创建第一个 Key
        </button>
      </div>

      <div v-else class="space-y-3">
        <div 
          v-for="apiKey in apiKeys" 
          :key="apiKey._id"
          class="group border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-violet-200 dark:hover:border-violet-700 transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="font-bold text-slate-900 dark:text-slate-100">{{ apiKey.name }}</h3>
                <span 
                  :class="[
                    'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                    apiKey.isActive 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  ]"
                >
                  {{ apiKey.isActive ? 'Active' : 'Disabled' }}
                </span>
                <span v-if="apiKey.expiresAt" class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  Expires: {{ formatDate(apiKey.expiresAt) }}
                </span>
              </div>
              
              <div class="flex items-center gap-2 mb-3">
                <code class="flex-1 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded text-xs font-mono text-slate-600 dark:text-slate-400 select-all truncate">
                  {{ apiKey.key }}
                </code>
                <button 
                  @click="copyToClipboard(apiKey.key)"
                  class="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded transition-colors"
                  title="复制 Key">
                  <Copy class="w-4 h-4" />
                </button>
              </div>

              <div class="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span class="flex items-center">
                  <Activity class="w-3 h-3 mr-1" />
                  {{ apiKey.requestCount }} 次请求
                </span>
                <span class="flex items-center">
                  <Clock class="w-3 h-3 mr-1" />
                  最后使用: {{ apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt, true) : '从未' }}
                </span>
                <span class="flex items-center">
                  <Calendar class="w-3 h-3 mr-1" />
                  创建于: {{ formatDate(apiKey.createdAt, true) }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button 
                @click="handleToggleStatus(apiKey)"
                :class="[
                  'p-2 rounded-lg transition-colors',
                  apiKey.isActive 
                    ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20' 
                    : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                ]"
                :title="apiKey.isActive ? '禁用' : '启用'">
                <Power v-if="apiKey.isActive" class="w-4 h-4" />
                <PowerOff v-else class="w-4 h-4" />
              </button>
              <button 
                @click="handleDelete(apiKey)"
                class="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                title="删除">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-lg flex gap-3">
      <AlertTriangle class="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
      <p class="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
        <strong>安全提醒：</strong> API Key 拥有访问您账户下所有智能体的完整权限。请勿将 Key 泄露在公开的代码库中。建议为不同的应用场景创建独立的 Key，并定期轮换。
      </p>
    </div>

    <CreateApiKeyModal 
      v-if="showCreateModal" 
      @close="showCreateModal = false"
      @created="handleKeyCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Plus, Key, Copy, Activity, Clock, Calendar, 
  Power, PowerOff, Trash2, AlertTriangle, BarChart3 
} from 'lucide-vue-next'
import { getMyApiKeys, deleteApiKey, toggleApiKeyStatus } from '@/services/apiKeyService.js'
import CreateApiKeyModal from '@/components/apiKeys/CreateApiKeyModal.vue'

const apiKeys = ref([])
const maxKeys = ref(20)
const isLoading = ref(true)
const showCreateModal = ref(false)

const activeKeysCount = computed(() => apiKeys.value.filter(k => k.isActive).length)

onMounted(async () => {
  await loadApiKeys()
})

const loadApiKeys = async () => {
  try {
    isLoading.value = true
    const response = await getMyApiKeys()
    apiKeys.value = response.apiKeys
    maxKeys.value = response.maxKeys
  } catch (err) {
    console.error('加载 API Keys 失败:', err)
  } finally {
    isLoading.value = false
  }
}

const handleKeyCreated = () => {
  showCreateModal.value = false
  loadApiKeys()
}

const handleToggleStatus = async (apiKey) => {
  try {
    await toggleApiKeyStatus(apiKey._id)
    await loadApiKeys()
  } catch (err) {
    alert('操作失败: ' + err.message)
  }
}

const handleDelete = async (apiKey) => {
  if (!confirm(`确定要删除 "${apiKey.name}" 吗？此操作不可恢复。`)) return
  
  try {
    await deleteApiKey(apiKey._id)
    await loadApiKeys()
  } catch (err) {
    alert('删除失败: ' + err.message)
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
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
