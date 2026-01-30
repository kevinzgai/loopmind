<template>
  <div class="space-y-8">
    <!-- Stats Grid -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium text-slate-500 dark:text-slate-400">活跃智能体</span>
          <div class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Box class="w-5 h-5" />
          </div>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-slate-100">128</div>
        <div class="mt-2 text-xs font-medium text-green-600 dark:text-green-400 flex items-center">
          <ArrowUpRight class="w-3 h-3 mr-1" />
          +12.5% 较上周
        </div>
      </div>

      <div
        class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium text-slate-500 dark:text-slate-400">总对话数</span>
          <div class="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
            <MessageSquare class="w-5 h-5" />
          </div>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-slate-100">1.2M</div>
        <div class="mt-2 text-xs font-medium text-green-600 dark:text-green-400 flex items-center">
          <ArrowUpRight class="w-3 h-3 mr-1" />
          +8.2% 较上周
        </div>
      </div>

      <div
        class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium text-slate-500 dark:text-slate-400">系统负载</span>
          <div class="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
            <Activity class="w-5 h-5" />
          </div>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-slate-100">24%</div>
        <div class="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
          运行平稳
        </div>
      </div>

      <div
        class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium text-slate-500 dark:text-slate-400">API 额度</span>
          <div class="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
            <Zap class="w-5 h-5" />
          </div>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-slate-100">∞</div>
        <div class="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
          无限制
        </div>
      </div>
    </section>

    <!-- Main Content Split -->
    <div class="flex flex-col xl:flex-row gap-8">

      <!-- Left: Popular Agents -->
      <div class="flex-1 space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">推荐智能体</h2>
          <button
            class="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">查看全部</button>
        </div>

        <div v-if="isLoadingAgents" class="py-20 flex justify-center">
          <div
            class="w-8 h-8 border-2 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin">
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="agent in displayedAgents" :key="agent.id"
            class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-700 transition-all cursor-pointer group flex flex-col">
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
              {{
                agent.name }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">{{ agent.description ||
              '暂无描述' }}</p>

            <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
              <div class="text-xs text-slate-400 dark:text-slate-500 flex items-center">
                <User class="w-3 h-3 mr-1" />
                {{ agent.userCount || 0 }}
              </div>
              <router-link :to="`/agent/${agent.id}/chat`"
                class="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-3 py-1.5 rounded hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors">
                开始对话
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Sidebar Widgets -->
      <div class="w-full xl:w-80 space-y-6">

        <!-- Quick Actions -->
        <div
          class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 transition-colors">
          <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-4">快捷操作</h3>
          <div class="space-y-3">
            <router-link to="/agent/create"
              class="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300 transition-colors group border border-slate-100 dark:border-slate-700 hover:border-violet-100 dark:hover:border-violet-700">
              <div
                class="w-8 h-8 rounded-md bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm mr-3 group-hover:text-violet-600 dark:group-hover:text-violet-400">
                <Plus class="w-4 h-4" />
              </div>
              <div
                class="flex-1 font-medium text-sm text-slate-700 dark:text-slate-300 group-hover:text-violet-700 dark:group-hover:text-violet-300">
                创建智能体</div>
            </router-link>
            <router-link to="/agent/import"
              class="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300 transition-colors group border border-slate-100 dark:border-slate-700 hover:border-violet-100 dark:hover:border-violet-700">
              <div
                class="w-8 h-8 rounded-md bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm mr-3 group-hover:text-violet-600 dark:group-hover:text-violet-400">
                <Download class="w-4 h-4" />
              </div>
              <div
                class="flex-1 font-medium text-sm text-slate-700 dark:text-slate-300 group-hover:text-violet-700 dark:group-hover:text-violet-300">
                导入配置</div>
            </router-link>
          </div>
        </div>

        <!-- Categories -->
        <div
          class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 transition-colors">
          <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-4">分类浏览</h3>
          <div class="space-y-1">
            <button v-for="cat in ['全部', ...AGENT_CATEGORIES.map(c => c.value)]" :key="cat"
              @click="handleCategoryChange(cat === '全部' ? '全部' : cat)"
              :class="selectedCategory === cat ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'"
              class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors">
              <span>{{cat === '全部' ? '全部智能体' : AGENT_CATEGORIES.find(c => c.value === cat)?.label}}</span>
              <ChevronRight class="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </button>
          </div>
        </div>

        <!-- System Status -->
        <div class="bg-violet-900 dark:bg-violet-950 rounded-xl p-6 text-white relative overflow-hidden">
          <div class="relative z-10">
            <div class="flex items-center mb-4">
              <div class="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
              <span class="text-xs font-medium text-violet-200 uppercase tracking-wider">System Status</span>
            </div>
            <h3 class="font-bold text-lg mb-1">All Systems Operational</h3>
            <p class="text-violet-200 text-sm">Latest check: 1 min ago</p>
          </div>
          <Activity class="absolute -bottom-4 -right-4 w-24 h-24 text-violet-800 dark:text-violet-900 opacity-50" />
        </div>

      </div>
    </div>

    <!-- Footer -->
    <div
      class="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
      <p>© 2026 AI Pilot Platform</p>
      <div class="flex gap-4">
        <a href="#" class="hover:text-slate-600 dark:hover:text-slate-300">Privacy</a>
        <a href="#" class="hover:text-slate-600 dark:hover:text-slate-300">Terms</a>
        <a href="#" class="hover:text-slate-600 dark:hover:text-slate-300">Help</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPublishedAgents } from '@/services/agentService.js'
import { AGENT_CATEGORIES } from '@/constants/agent.js'
import {
  Box, MessageSquare,
  User, Plus, Download, ChevronRight, Activity, Zap, ArrowUpRight
} from 'lucide-vue-next'

const agents = ref([])
const selectedCategory = ref('全部')
const isLoadingAgents = ref(false)

const displayedAgents = computed(() => agents.value)

const loadAgents = async () => {
  try {
    isLoadingAgents.value = true
    const result = await getPublishedAgents(1, 9, selectedCategory.value)
    agents.value = result.agents
  } catch (error) {
    console.error('❌ 加载智能体失败:', error.message)
  } finally {
    isLoadingAgents.value = false
  }
}

const handleCategoryChange = (cat) => {
  if (selectedCategory.value === cat) return
  selectedCategory.value = cat
  loadAgents()
}

onMounted(() => {
  loadAgents()
})
</script>

<style scoped>
/* Custom Scrollbar for Webkit */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
