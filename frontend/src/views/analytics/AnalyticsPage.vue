<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold font-heading tracking-tight">数据分析</h1>
        <p class="text-base text-muted-foreground mt-1">洞察对话数据，优化智能体表现</p>
      </div>
      <Select v-model="selectedDays" @update:modelValue="loadAll">
        <SelectTrigger class="w-32 h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="7">近 7 天</SelectItem>
          <SelectItem value="30">近 30 天</SelectItem>
          <SelectItem value="90">近 90 天</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="stat-card group">
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">总对话数</span>
          <div class="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors"><MessageSquare class="w-4 h-4" /></div>
        </div>
        <div class="text-3xl font-bold font-heading mt-3">{{ overview.totalConversations ?? 0 }}</div>
      </div>
      <div class="stat-card group">
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">总消息数</span>
          <div class="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors"><Mail class="w-4 h-4" /></div>
        </div>
        <div class="text-3xl font-bold font-heading mt-3">{{ overview.totalMessages ?? 0 }}</div>
      </div>
      <div class="stat-card group">
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">活跃智能体</span>
          <div class="p-2 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors"><Bot class="w-4 h-4" /></div>
        </div>
        <div class="text-3xl font-bold font-heading mt-3">{{ overview.activeAgents ?? 0 }}</div>
      </div>
      <div class="stat-card group">
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">新增用户</span>
          <div class="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20 transition-colors"><Users class="w-4 h-4" /></div>
        </div>
        <div class="text-3xl font-bold font-heading mt-3">{{ overview.newUsers ?? 0 }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card-base p-6">
        <h3 class="font-bold font-heading mb-4">每日对话趋势</h3>
        <div v-if="dailyTrend.length" class="relative h-48">
          <svg class="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#22C55E" stop-opacity="0.3" />
                <stop offset="100%" stop-color="#22C55E" stop-opacity="0.02" />
              </linearGradient>
            </defs>
            <polyline :points="trendAreaPoints" fill="url(#lineGrad)" stroke="none" />
            <polyline :points="trendLinePoints" fill="none" stroke="#22C55E" stroke-width="2" stroke-linejoin="round" />
            <circle v-for="(pt, i) in trendPoints" :key="i" :cx="pt.x" :cy="pt.y" r="3" fill="#22C55E" />
          </svg>
          <div class="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{{ formatDate(dailyTrend[0]?.date) }}</span>
            <span>{{ formatDate(dailyTrend[Math.floor(dailyTrend.length / 2)]?.date) }}</span>
            <span>{{ formatDate(dailyTrend[dailyTrend.length - 1]?.date) }}</span>
          </div>
        </div>
        <div v-else class="h-48 flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
      </div>

      <div class="card-base p-6">
        <h3 class="font-bold font-heading mb-4">活跃时段分布</h3>
        <div v-if="hourlyActivity.length" class="flex items-end gap-1 h-48">
          <div v-for="item in hourlyActivity" :key="item.hour" class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full rounded-sm bg-primary/60 hover:bg-primary transition-colors" :style="{ height: getBarHeight(item.count, maxHourCount) + 'px' }" :title="`${item.hour}:00 - ${item.count} 次`"></div>
            <span v-if="item.hour % 6 === 0" class="text-xs text-muted-foreground">{{ item.hour }}</span>
          </div>
        </div>
        <div v-else class="h-48 flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card-base p-6">
        <h3 class="font-bold font-heading mb-4">热门智能体</h3>
        <div v-if="topAgents.length" class="space-y-3">
          <div v-for="(agent, idx) in topAgents.slice(0, 6)" :key="agent.agentId" class="flex items-center gap-3">
            <span class="text-muted-foreground text-xs w-4 shrink-0">{{ idx + 1 }}</span>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium truncate">{{ agent.agentName || '未知智能体' }}</span>
                <span class="text-xs text-muted-foreground ml-2 shrink-0">{{ agent.conversationCount }} 次</span>
              </div>
              <div class="h-1.5 bg-muted rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full" :style="{ width: getPercent(agent.conversationCount, topAgents[0]?.conversationCount) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-muted-foreground text-sm text-center py-8">暂无数据</div>
      </div>

      <div class="card-base p-6">
        <h3 class="font-bold font-heading mb-4">热词分析</h3>
        <div v-if="hotWords.length" class="flex flex-wrap gap-2">
          <span v-for="word in hotWords.slice(0, 40)" :key="word.word" class="px-3 py-1 rounded-full cursor-default" :style="getWordStyle(word.count, hotWords[0]?.count)">
            {{ word.word }}
            <span class="text-xs opacity-70">{{ word.count }}</span>
          </span>
        </div>
        <div v-else class="text-muted-foreground text-sm text-center py-8">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { analyticsService } from '@/services/analyticsService.js'
import { MessageSquare, Mail, Bot, Users } from 'lucide-vue-next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const selectedDays = ref('30')
const overview = ref({})
const dailyTrend = ref([])
const topAgents = ref([])
const hotWords = ref([])
const hourlyActivity = ref([])

const maxHourCount = computed(() => Math.max(...hourlyActivity.value.map((h) => h.count), 1))

const trendPoints = computed(() => {
  if (!dailyTrend.value.length) return []
  const max = Math.max(...dailyTrend.value.map((d) => d.count), 1)
  const len = dailyTrend.value.length
  return dailyTrend.value.map((d, i) => ({ x: (i / (len - 1)) * 400, y: 160 - (d.count / max) * 150 }))
})

const trendLinePoints = computed(() => trendPoints.value.map((p) => `${p.x},${p.y}`).join(' '))

const trendAreaPoints = computed(() => {
  if (!trendPoints.value.length) return ''
  const pts = trendPoints.value.map((p) => `${p.x},${p.y}`).join(' ')
  return `0,170 ${pts} 400,170`
})

const loadAll = async () => {
  const days = Number(selectedDays.value)
  const [ov, trend, agents, words, hourly] = await Promise.allSettled([
    analyticsService.getOverview(days),
    analyticsService.getDailyTrend(days),
    analyticsService.getTopAgents(10, days),
    analyticsService.getHotWords(40, days),
    analyticsService.getActivityByHour(days),
  ])
  if (ov.status === 'fulfilled') overview.value = ov.value.data
  if (trend.status === 'fulfilled') dailyTrend.value = trend.value.data
  if (agents.status === 'fulfilled') topAgents.value = agents.value.data
  if (words.status === 'fulfilled') hotWords.value = words.value.data
  if (hourly.status === 'fulfilled') hourlyActivity.value = hourly.value.data
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const getBarHeight = (count, max) => Math.max(2, (count / max) * 160)
const getPercent = (val, max) => max ? Math.round((val / max) * 100) : 0

const getWordStyle = (count, maxCount) => {
  const ratio = maxCount ? count / maxCount : 0
  const size = 12 + ratio * 10
  const opacity = 0.5 + ratio * 0.5
  const colors = ['#22C55E', '#3B82F6', '#A855F7', '#06B6D4', '#F59E0B', '#EF4444']
  const color = colors[Math.floor(ratio * (colors.length - 1))]
  return { fontSize: `${size}px`, opacity, backgroundColor: color + '22', border: `1px solid ${color}55` }
}

onMounted(loadAll)
</script>
