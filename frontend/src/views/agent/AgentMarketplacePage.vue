<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">探索发现</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">发现更多有趣的智能体，或者寻找你的得力助手</p>
      </div>
      <router-link to="/agent/create"
        class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-glow">
        <Plus class="w-4 h-4 mr-2" />
        创建智能体
      </router-link>
    </div>

    <!-- Filter & Search Section -->
    <div
      class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <!-- Categories -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
        <button v-for="cat in ['全部', ...categories]" :key="cat" @click="selectedCategory = cat; loadAgents()" :class="[
          'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
          selectedCategory === cat
            ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        ]">
          {{ getCategoryLabel(cat) }}
        </button>
      </div>

      <!-- Search -->
      <div class="relative w-full md:w-64">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input v-model="searchQuery" @input="handleSearch" type="text" placeholder="搜索智能体..."
          class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500/20 placeholder:text-slate-400" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-20 flex flex-col items-center justify-center text-slate-400">
      <div
        class="w-10 h-10 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin mb-4">
      </div>
      <p>正在加载精彩内容...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error"
      class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
      {{ error }}
      <button @click="loadAgents" class="ml-2 underline hover:text-red-700">重试</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="agents.length === 0" class="py-20 flex flex-col items-center justify-center text-center">
      <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
        <Compass class="w-10 h-10 text-slate-400" />
      </div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">暂无相关智能体</h3>
      <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        当前分类下还没有已发布的智能体，或者尝试更换搜索关键词。
      </p>
    </div>

    <!-- Agents Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="agent in agents" :key="agent.id"
        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-700 transition-all cursor-pointer group flex flex-col h-full"
        @click="$router.push(`/agent/${agent.id}/chat`)">
        <div class="flex items-start justify-between mb-4">
          <div
            class="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:bg-violet-50 dark:group-hover:bg-violet-900/20 transition-colors">
            <img v-if="agent.avatar && agent.avatar.startsWith('http')" :src="agent.avatar"
              class="w-full h-full object-cover rounded-lg" />
            <span v-else>{{ agent.avatar || '🤖' }}</span>
          </div>
          <div
            class="px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
            {{ agent.category || '通用' }}
          </div>
        </div>

        <h3
          class="font-bold text-slate-900 dark:text-slate-100 mb-2 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {{ agent.name }}
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
          {{ agent.description || '暂无描述' }}
        </p>

        <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <div class="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            <span class="flex items-center">
              <User class="w-3 h-3 mr-1" /> {{ agent.userCount || 0 }}
            </span>
            <span class="flex items-center">
              <MessageSquare class="w-3 h-3 mr-1" /> {{ agent.usageCount || 0 }}
            </span>
          </div>
          <span
            class="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            开始对话
          </span>
        </div>
      </div>
    </div>

    <!-- Pagination (Simple Load More for now, or traditional pagination) -->
    <div v-if="totalPages > 1" class="flex justify-center pt-8 pb-4">
      <nav class="flex items-center gap-2">
        <button @click="changePage(page - 1)" :disabled="page === 1"
          class="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronLeft class="w-5 h-5" />
        </button>
        <span class="text-sm text-slate-600 dark:text-slate-400 font-medium px-2">
          {{ page }} / {{ totalPages }}
        </span>
        <button @click="changePage(page + 1)" :disabled="page === totalPages"
          class="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronRight class="w-5 h-5" />
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getPublishedAgents } from '@/services/agentService.js'
import { AGENT_CATEGORIES } from '@/constants/agent.js'
import { Plus, Search, Compass, User, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-vue-next'

// Simple debounce implementation
const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

const agents = ref([])
const isLoading = ref(true)
const error = ref(null)
const page = ref(1)
const limit = ref(12)
const totalPages = ref(1)
const selectedCategory = ref('全部')
const searchQuery = ref('')
const categories = AGENT_CATEGORIES.map(c => c.value)

const getCategoryLabel = (val) => {
  if (val === '全部') return '全部'
  return AGENT_CATEGORIES.find(c => c.value === val)?.label || val
}

const loadAgents = async () => {
  try {
    isLoading.value = true
    error.value = null
    // Assuming backend supports search query in future, for now client side filtering might be needed if API doesn't support it
    // But let's assume getPublishedAgents can take category. Search might need API update or client filter.
    // For MVP, let's pass category.
    const result = await getPublishedAgents(page.value, limit.value, selectedCategory.value)

    // Simple client-side search if API doesn't support it yet (API usually returns paginated data so client search is imperfect but better than nothing)
    // Ideally API should support 'q' parameter.
    // For now, let's just use what we get.
    agents.value = result.agents

    // If search query exists, filter locally (limited to current page, which is not ideal, but acceptable for MVP)
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      agents.value = agents.value.filter(a =>
        a.name.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
      )
    }

    totalPages.value = result.pages || 1
  } catch (err) {
    console.error('Failed to load agents:', err)
    error.value = '加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

const handleSearch = debounce(() => {
  page.value = 1
  loadAgents()
}, 300)

const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage
    loadAgents()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  loadAgents()
})
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}
</style>
