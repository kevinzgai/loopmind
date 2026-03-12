<template>
  <div class="space-y-8 animate-fade-in">
    <div v-if="isLoadingStats" class="py-12 flex justify-center">
      <div class="flex flex-col items-center gap-3">
        <Loader2 class="w-8 h-8 animate-spin text-primary" />
        <span class="text-sm text-muted-foreground">加载中...</span>
      </div>
    </div>

    <template v-else>
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="stat-card group">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-muted-foreground">活跃智能体</span>
            <div class="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
              <Box class="w-5 h-5" />
            </div>
          </div>
          <div class="text-3xl font-bold font-heading mt-3">{{ formatNumber(stats.agents?.total || 0) }}</div>
          <div class="mt-2 text-sm font-medium flex items-center gap-1" :class="stats.agents?.weeklyGrowth >= 0 ? 'text-green-500' : 'text-red-500'">
            <ArrowUpRight v-if="stats.agents?.weeklyGrowth >= 0" class="w-4 h-4" />
            <ArrowDownRight v-else class="w-4 h-4" />
            <span>{{ stats.agents?.weeklyGrowth >= 0 ? '+' : '' }}{{ stats.agents?.weeklyGrowth || 0 }}% 较上周</span>
          </div>
        </div>

        <div class="stat-card group">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-muted-foreground">总对话数</span>
            <div class="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors">
              <MessageSquare class="w-5 h-5" />
            </div>
          </div>
          <div class="text-3xl font-bold font-heading mt-3">{{ formatNumber(stats.conversations?.total || 0) }}</div>
          <div class="mt-2 text-sm font-medium flex items-center gap-1" :class="stats.conversations?.weeklyGrowth >= 0 ? 'text-green-500' : 'text-red-500'">
            <ArrowUpRight v-if="stats.conversations?.weeklyGrowth >= 0" class="w-4 h-4" />
            <ArrowDownRight v-else class="w-4 h-4" />
            <span>{{ stats.conversations?.weeklyGrowth >= 0 ? '+' : '' }}{{ stats.conversations?.weeklyGrowth || 0 }}% 较上周</span>
          </div>
        </div>

        <div
          @click="openSystemModal"
          class="stat-card group cursor-pointer">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-muted-foreground">系统负载</span>
            <div class="p-2.5 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20 transition-colors">
              <Activity class="w-5 h-5" />
            </div>
          </div>
          <div class="text-3xl font-bold font-heading mt-3">{{ stats.system?.load || 0 }}%</div>
          <div class="mt-2 text-sm font-medium text-muted-foreground flex items-center gap-1">
            <span>{{ stats.system?.status || '运行平稳' }}</span>
            <ExternalLink class="w-3.5 h-3.5" />
          </div>
        </div>

        <div class="stat-card group">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-muted-foreground">注册用户</span>
            <div class="p-2.5 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
              <Users class="w-5 h-5" />
            </div>
          </div>
          <div class="text-3xl font-bold font-heading mt-3">{{ formatNumber(stats.users?.total || 0) }}</div>
          <div class="mt-2 text-sm font-medium text-muted-foreground">
            今日活跃: {{ stats.users?.activeToday || 0 }}
          </div>
        </div>
      </section>
    </template>

    <div class="flex flex-col xl:flex-row gap-8">
      <div class="flex-1 space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold font-heading">推荐智能体</h2>
          <button class="text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">
            查看全部
          </button>
        </div>

        <div v-if="isLoadingAgents" class="py-16 flex justify-center">
          <div class="flex flex-col items-center gap-3">
            <Loader2 class="w-8 h-8 animate-spin text-primary" />
            <span class="text-sm text-muted-foreground">加载智能体...</span>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div 
            v-for="agent in displayedAgents" 
            :key="agent.id"
            class="feature-card">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-2xl group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors">
                <img v-if="agent.avatar && agent.avatar.startsWith('http')" :src="agent.avatar" class="w-full h-full object-cover rounded-xl" />
                <Bot v-else class="w-6 h-6 text-primary" />
              </div>
              <span class="badge-primary">
                {{ agent.category || '通用' }}
              </span>
            </div>

            <h3 class="font-bold font-heading text-lg mb-2 group-hover:text-primary transition-colors truncate">
              {{ agent.name }}
            </h3>
            <p class="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
              {{ agent.description || '暂无描述' }}
            </p>

            <div class="flex items-center justify-between pt-4 border-t border-border">
              <div class="text-sm text-muted-foreground flex items-center gap-1.5">
                <User class="w-4 h-4" />
                <span>{{ agent.userCount || 0 }}</span>
              </div>
              <Button as-child size="sm" class="text-xs">
                <router-link :to="`/agent/${agent.id}/chat`" class="inline-flex items-center gap-1">开始对话</router-link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full xl:w-80 space-y-5">
        <div class="card-base p-5">
          <h3 class="font-bold font-heading mb-4">快捷操作</h3>
          <div class="space-y-2">
            <router-link 
              to="/agent/create"
              class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-primary/5 hover:text-primary transition-colors group cursor-pointer">
              <div class="w-9 h-9 rounded-lg bg-background flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Plus class="w-4 h-4" />
              </div>
              <span class="font-medium text-sm">创建智能体</span>
            </router-link>
            <router-link 
              to="/agent/import"
              class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-primary/5 hover:text-primary transition-colors group cursor-pointer">
              <div class="w-9 h-9 rounded-lg bg-background flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Download class="w-4 h-4" />
              </div>
              <span class="font-medium text-sm">导入配置</span>
            </router-link>
          </div>
        </div>

        <div class="card-base p-5">
          <h3 class="font-bold font-heading mb-4">分类浏览</h3>
          <div class="space-y-1">
            <button 
              v-for="cat in ['全部', ...AGENT_CATEGORIES.map(c => c.value)]" 
              :key="cat"
              @click="handleCategoryChange(cat === '全部' ? '全部' : cat)"
              :class="[
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                selectedCategory === cat 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              ]">
              <span>{{ cat === '全部' ? '全部智能体' : AGENT_CATEGORIES.find(c => c.value === cat)?.label }}</span>
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-primary via-primary to-secondary text-white">
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft"></div>
              <span class="text-xs font-medium uppercase tracking-wider opacity-80">System Status</span>
            </div>
            <h3 class="font-bold font-heading text-lg mb-1">All Systems Operational</h3>
            <p class="text-sm opacity-80">Latest check: 1 min ago</p>
          </div>
          <Activity class="absolute -bottom-6 -right-6 w-28 h-28 opacity-20" />
        </div>
      </div>
    </div>

    <div class="pt-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
      <p>&copy; 2026 AI Pilot Platform</p>
      <div class="flex gap-6">
        <a href="#" class="hover:text-foreground transition-colors">Privacy</a>
        <a href="#" class="hover:text-foreground transition-colors">Terms</a>
        <a href="#" class="hover:text-foreground transition-colors">Help</a>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showSystemModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeSystemModal">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div class="relative bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-border animate-scale-in">
            <div class="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Activity class="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h2 class="text-lg font-bold font-heading">系统详情</h2>
                  <p class="text-xs text-muted-foreground">实时监控系统运行状态</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  @click="refreshSystemDetails" 
                  :disabled="isRefreshing"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors cursor-pointer disabled:opacity-50">
                  <RefreshCw :class="['w-4 h-4', isRefreshing ? 'animate-spin' : '']" />
                  <span>刷新</span>
                </button>
                <button 
                  @click="closeSystemModal" 
                  class="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                  <X class="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div v-if="isLoadingDetails" class="py-20 flex justify-center">
              <div class="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
            </div>

            <div v-else class="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div class="grid gap-5 md:grid-cols-2">
                <div class="card-base p-5">
                  <div class="flex items-center gap-2 mb-4">
                    <Cpu class="w-5 h-5 text-blue-500" />
                    <h3 class="font-semibold font-heading">CPU</h3>
                  </div>
                  <div class="space-y-4">
                    <div>
                      <div class="flex justify-between text-sm mb-2">
                        <span class="text-muted-foreground">使用率</span>
                        <span class="font-medium">{{ systemDetails.cpu?.usagePercent || 0 }}%</span>
                      </div>
                      <div class="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          class="h-full rounded-full transition-all duration-500"
                          :class="systemDetails.cpu?.usagePercent > 80 ? 'bg-red-500' : systemDetails.cpu?.usagePercent > 50 ? 'bg-yellow-500' : 'bg-green-500'"
                          :style="{ width: `${systemDetails.cpu?.usagePercent || 0}%` }"
                        ></div>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span class="text-muted-foreground text-xs">核心数</span>
                        <p class="font-medium">{{ systemDetails.cpu?.cores || 0 }}</p>
                      </div>
                      <div>
                        <span class="text-muted-foreground text-xs">负载 (1m)</span>
                        <p class="font-medium">{{ systemDetails.cpu?.loadAverage?.['1min'] || 0 }}</p>
                      </div>
                    </div>
                    <div class="text-xs text-muted-foreground truncate">
                      {{ systemDetails.cpu?.model || 'Unknown' }}
                    </div>
                  </div>
                </div>

                <div class="card-base p-5">
                  <div class="flex items-center gap-2 mb-4">
                    <HardDrive class="w-5 h-5 text-purple-500" />
                    <h3 class="font-semibold font-heading">内存</h3>
                  </div>
                  <div class="space-y-4">
                    <div>
                      <div class="flex justify-between text-sm mb-2">
                        <span class="text-muted-foreground">使用率</span>
                        <span class="font-medium">{{ systemDetails.memory?.usedPercent || 0 }}%</span>
                      </div>
                      <div class="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          class="h-full rounded-full transition-all duration-500"
                          :class="systemDetails.memory?.usedPercent > 80 ? 'bg-red-500' : systemDetails.memory?.usedPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'"
                          :style="{ width: `${systemDetails.memory?.usedPercent || 0}%` }"
                        ></div>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span class="text-muted-foreground text-xs">已用</span>
                        <p class="font-medium">{{ formatBytes(systemDetails.memory?.used) }}</p>
                      </div>
                      <div>
                        <span class="text-muted-foreground text-xs">总量</span>
                        <p class="font-medium">{{ formatBytes(systemDetails.memory?.total) }}</p>
                      </div>
                    </div>
                    <div class="text-xs text-muted-foreground">
                      进程内存: {{ formatBytes(systemDetails.memory?.process?.rss) }}
                    </div>
                  </div>
                </div>

                <div class="card-base p-5">
                  <div class="flex items-center gap-2 mb-4">
                    <Database class="w-5 h-5 text-green-500" />
                    <h3 class="font-semibold font-heading">磁盘</h3>
                  </div>
                  <div v-if="systemDetails.disk" class="space-y-4">
                    <div>
                      <div class="flex justify-between text-sm mb-2">
                        <span class="text-muted-foreground">使用率</span>
                        <span class="font-medium">{{ systemDetails.disk?.usedPercent || 0 }}%</span>
                      </div>
                      <div class="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          class="h-full rounded-full transition-all duration-500"
                          :class="systemDetails.disk?.usedPercent > 80 ? 'bg-red-500' : systemDetails.disk?.usedPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'"
                          :style="{ width: `${systemDetails.disk?.usedPercent || 0}%` }"
                        ></div>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span class="text-muted-foreground text-xs">已用</span>
                        <p class="font-medium">{{ formatBytes(systemDetails.disk?.used) }}</p>
                      </div>
                      <div>
                        <span class="text-muted-foreground text-xs">可用</span>
                        <p class="font-medium">{{ formatBytes(systemDetails.disk?.available) }}</p>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-sm text-muted-foreground">
                    无法获取磁盘信息
                  </div>
                </div>

                <div class="card-base p-5">
                  <div class="flex items-center gap-2 mb-4">
                    <Server class="w-5 h-5 text-orange-500" />
                    <h3 class="font-semibold font-heading">系统</h3>
                  </div>
                  <div class="space-y-3 text-sm">
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">平台</span>
                      <span class="font-medium">{{ systemDetails.os?.platform }} ({{ systemDetails.os?.arch }})</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">主机名</span>
                      <span class="font-medium">{{ systemDetails.os?.hostname }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">系统运行</span>
                      <span class="font-medium">{{ systemDetails.os?.uptime?.formatted }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">Node 版本</span>
                      <span class="font-medium">{{ systemDetails.node?.version }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">进程 PID</span>
                      <span class="font-medium">{{ systemDetails.node?.pid }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-5 p-4 bg-muted/50 rounded-xl">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">最后更新</span>
                  <span class="font-medium">{{ formatTimestamp(systemDetails.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPublishedAgents } from '@/services/agentService.js'
import { getDashboardStats, getSystemDetails } from '@/services/dashboardService.js'
import { AGENT_CATEGORIES } from '@/constants/agent.js'
import {
  Box, MessageSquare, Bot,
  User, Plus, Download, ChevronRight, Activity, Users, ArrowUpRight, ArrowDownRight,
  X, RefreshCw, Cpu, HardDrive, Database, Server, ExternalLink, Loader2
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

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
    // 后端返回扁平结构 { agents, conversations, users, system, apiKeys }
    if (response && response.agents) {
      stats.value = response
    }
  } catch (error) {
    console.error('加载统计数据失败:', error.message)
  } finally {
    isLoadingStats.value = false
  }
}

const loadAgents = async () => {
  try {
    isLoadingAgents.value = true
    const result = await getPublishedAgents(1, 9, selectedCategory.value)
    // 后端 controller 用 ...result 展开，返回 { message, agents, total, pages }
    agents.value = Array.isArray(result?.agents) ? result.agents : []
  } catch (error) {
    console.error('加载智能体失败:', error.message)
    agents.value = []
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
    console.error('加载系统详情失败:', error.message)
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
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95);
  opacity: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
