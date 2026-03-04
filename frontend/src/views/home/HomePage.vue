<template>
  <div class="space-y-8">
    <div v-if="isLoadingStats" class="py-8 flex justify-center">
      <div class="w-8 h-8 border-2 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-slate-500 dark:text-slate-400">活跃智能体</span>
            <div class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Box class="w-5 h-5" />
            </div>
          </div>
          <div class="text-3xl font-bold text-slate-900 dark:text-slate-100">{{ formatNumber(stats.agents?.total || 0) }}</div>
          <div class="mt-2 text-xs font-medium flex items-center" :class="stats.agents?.weeklyGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'">
            <ArrowUpRight v-if="stats.agents?.weeklyGrowth >= 0" class="w-3 h-3 mr-1" />
            <ArrowDownRight v-else class="w-3 h-3 mr-1" />
            {{ stats.agents?.weeklyGrowth >= 0 ? '+' : '' }}{{ stats.agents?.weeklyGrowth || 0 }}% 较上周
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
          <div class="text-3xl font-bold text-slate-900 dark:text-slate-100">{{ formatNumber(stats.conversations?.total || 0) }}</div>
          <div class="mt-2 text-xs font-medium flex items-center" :class="stats.conversations?.weeklyGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'">
            <ArrowUpRight v-if="stats.conversations?.weeklyGrowth >= 0" class="w-3 h-3 mr-1" />
            <ArrowDownRight v-else class="w-3 h-3 mr-1" />
            {{ stats.conversations?.weeklyGrowth >= 0 ? '+' : '' }}{{ stats.conversations?.weeklyGrowth || 0 }}% 较上周
          </div>
        </div>

        <div
          @click="openSystemModal"
          class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-slate-500 dark:text-slate-400">系统负载</span>
            <div class="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
              <Activity class="w-5 h-5" />
            </div>
          </div>
          <div class="text-3xl font-bold text-slate-900 dark:text-slate-100">{{ stats.system?.load || 0 }}%</div>
          <div class="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
            {{ stats.system?.status || '运行平稳' }}
            <ExternalLink class="w-3 h-3 ml-1" />
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-slate-500 dark:text-slate-400">注册用户</span>
            <div class="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <Users class="w-5 h-5" />
            </div>
          </div>
          <div class="text-3xl font-bold text-slate-900 dark:text-slate-100">{{ formatNumber(stats.users?.total || 0) }}</div>
          <div class="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
            今日活跃: {{ stats.users?.activeToday || 0 }}
          </div>
        </div>
      </section>
    </template>

    <div class="flex flex-col xl:flex-row gap-8">

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

      <div class="w-full xl:w-80 space-y-6">

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

    <div
      class="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
      <p>© 2026 AI Pilot Platform</p>
      <div class="flex gap-4">
        <a href="#" class="hover:text-slate-600 dark:hover:text-slate-300">Privacy</a>
        <a href="#" class="hover:text-slate-600 dark:hover:text-slate-300">Terms</a>
        <a href="#" class="hover:text-slate-600 dark:hover:text-slate-300">Help</a>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showSystemModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeSystemModal">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-700">
          <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Activity class="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">系统详情</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400">实时监控系统运行状态</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button 
                @click="refreshSystemDetails" 
                :disabled="isRefreshing"
                class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw :class="['w-4 h-4', isRefreshing ? 'animate-spin' : '']" />
                刷新
              </button>
              <button @click="closeSystemModal" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X class="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
          </div>

          <div v-if="isLoadingDetails" class="py-20 flex justify-center">
            <div class="w-8 h-8 border-2 border-orange-200 dark:border-orange-800 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin"></div>
          </div>

          <div v-else class="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div class="grid gap-6 md:grid-cols-2">
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-2 mb-4">
                  <Cpu class="w-5 h-5 text-blue-500" />
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">CPU</h3>
                </div>
                <div class="space-y-3">
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-slate-500 dark:text-slate-400">使用率</span>
                      <span class="font-medium text-slate-900 dark:text-slate-100">{{ systemDetails.cpu?.usagePercent || 0 }}%</span>
                    </div>
                    <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        class="h-full rounded-full transition-all duration-500"
                        :class="systemDetails.cpu?.usagePercent > 80 ? 'bg-red-500' : systemDetails.cpu?.usagePercent > 50 ? 'bg-yellow-500' : 'bg-green-500'"
                        :style="{ width: `${systemDetails.cpu?.usagePercent || 0}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span class="text-slate-500 dark:text-slate-400">核心数</span>
                      <p class="font-medium text-slate-900 dark:text-slate-100">{{ systemDetails.cpu?.cores || 0 }}</p>
                    </div>
                    <div>
                      <span class="text-slate-500 dark:text-slate-400">负载 (1m)</span>
                      <p class="font-medium text-slate-900 dark:text-slate-100">{{ systemDetails.cpu?.loadAverage?.['1min'] || 0 }}</p>
                    </div>
                  </div>
                  <div class="text-xs text-slate-400 dark:text-slate-500 truncate">
                    {{ systemDetails.cpu?.model || 'Unknown' }}
                  </div>
                </div>
              </div>

              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-2 mb-4">
                  <HardDrive class="w-5 h-5 text-purple-500" />
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">内存</h3>
                </div>
                <div class="space-y-3">
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-slate-500 dark:text-slate-400">使用率</span>
                      <span class="font-medium text-slate-900 dark:text-slate-100">{{ systemDetails.memory?.usedPercent || 0 }}%</span>
                    </div>
                    <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        class="h-full rounded-full transition-all duration-500"
                        :class="systemDetails.memory?.usedPercent > 80 ? 'bg-red-500' : systemDetails.memory?.usedPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'"
                        :style="{ width: `${systemDetails.memory?.usedPercent || 0}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span class="text-slate-500 dark:text-slate-400">已用</span>
                      <p class="font-medium text-slate-900 dark:text-slate-100">{{ formatBytes(systemDetails.memory?.used) }}</p>
                    </div>
                    <div>
                      <span class="text-slate-500 dark:text-slate-400">总量</span>
                      <p class="font-medium text-slate-900 dark:text-slate-100">{{ formatBytes(systemDetails.memory?.total) }}</p>
                    </div>
                  </div>
                  <div class="text-xs text-slate-400 dark:text-slate-500">
                    进程内存: {{ formatBytes(systemDetails.memory?.process?.rss) }}
                  </div>
                </div>
              </div>

              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-2 mb-4">
                  <Database class="w-5 h-5 text-green-500" />
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">磁盘</h3>
                </div>
                <div v-if="systemDetails.disk" class="space-y-3">
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-slate-500 dark:text-slate-400">使用率</span>
                      <span class="font-medium text-slate-900 dark:text-slate-100">{{ systemDetails.disk?.usedPercent || 0 }}%</span>
                    </div>
                    <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        class="h-full rounded-full transition-all duration-500"
                        :class="systemDetails.disk?.usedPercent > 80 ? 'bg-red-500' : systemDetails.disk?.usedPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'"
                        :style="{ width: `${systemDetails.disk?.usedPercent || 0}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span class="text-slate-500 dark:text-slate-400">已用</span>
                      <p class="font-medium text-slate-900 dark:text-slate-100">{{ formatBytes(systemDetails.disk?.used) }}</p>
                    </div>
                    <div>
                      <span class="text-slate-500 dark:text-slate-400">可用</span>
                      <p class="font-medium text-slate-900 dark:text-slate-100">{{ formatBytes(systemDetails.disk?.available) }}</p>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-slate-400 dark:text-slate-500">
                  无法获取磁盘信息
                </div>
              </div>

              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-2 mb-4">
                  <Server class="w-5 h-5 text-orange-500" />
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">系统</h3>
                </div>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-500 dark:text-slate-400">平台</span>
                    <span class="font-medium text-slate-900 dark:text-slate-100">{{ systemDetails.os?.platform }} ({{ systemDetails.os?.arch }})</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500 dark:text-slate-400">主机名</span>
                    <span class="font-medium text-slate-900 dark:text-slate-100">{{ systemDetails.os?.hostname }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500 dark:text-slate-400">系统运行</span>
                    <span class="font-medium text-slate-900 dark:text-slate-100">{{ systemDetails.os?.uptime?.formatted }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500 dark:text-slate-400">Node 版本</span>
                    <span class="font-medium text-slate-900 dark:text-slate-100">{{ systemDetails.node?.version }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500 dark:text-slate-400">进程 PID</span>
                    <span class="font-medium text-slate-900 dark:text-slate-100">{{ systemDetails.node?.pid }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500 dark:text-slate-400">最后更新</span>
                <span class="font-medium text-slate-900 dark:text-slate-100">{{ formatTimestamp(systemDetails.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPublishedAgents } from '@/services/agentService.js'
import { getDashboardStats, getSystemDetails } from '@/services/dashboardService.js'
import { AGENT_CATEGORIES } from '@/constants/agent.js'
import {
  Box, MessageSquare,
  User, Plus, Download, ChevronRight, Activity, Users, ArrowUpRight, ArrowDownRight,
  X, RefreshCw, Cpu, HardDrive, Database, Server, ExternalLink
} from 'lucide-vue-next'

const agents = ref([])
const selectedCategory = ref('全部')
const isLoadingAgents = ref(false)
const isLoadingStats = ref(false)
const stats = ref({
  agents: { total: 0, weeklyGrowth: 0 },
  conversations: { total: 0, weeklyGrowth: 0 },
  users: { total: 0, activeToday: 0 },
  system: { load: 0, status: '运行平稳' }
})

const showSystemModal = ref(false)
const isLoadingDetails = ref(false)
const isRefreshing = ref(false)
const systemDetails = ref({
  cpu: { cores: 0, usagePercent: 0, model: '', loadAverage: { '1min': 0, '5min': 0, '15min': 0 } },
  memory: { total: 0, used: 0, free: 0, usedPercent: 0, process: { rss: 0 } },
  disk: null,
  os: { platform: '', arch: '', hostname: '', uptime: { formatted: '' } },
  node: { version: '', pid: 0 },
  timestamp: ''
})

const displayedAgents = computed(() => agents.value)

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return size.toFixed(1) + ' ' + units[i]
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '未知'
  return new Date(timestamp).toLocaleString('zh-CN')
}

const loadStats = async () => {
  try {
    isLoadingStats.value = true
    const response = await getDashboardStats()
    stats.value = response
  } catch (error) {
    console.error('❌ 加载统计数据失败:', error.message)
  } finally {
    isLoadingStats.value = false
  }
}

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

const openSystemModal = async () => {
  showSystemModal.value = true
  await loadSystemDetails()
}

const closeSystemModal = () => {
  showSystemModal.value = false
}

const loadSystemDetails = async () => {
  try {
    isLoadingDetails.value = true
    const response = await getSystemDetails()
    systemDetails.value = response
  } catch (error) {
    console.error('❌ 加载系统详情失败:', error.message)
  } finally {
    isLoadingDetails.value = false
  }
}

const refreshSystemDetails = async () => {
  isRefreshing.value = true
  await loadSystemDetails()
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

onMounted(() => {
  loadStats()
  loadAgents()
})
</script>

<style scoped>
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
