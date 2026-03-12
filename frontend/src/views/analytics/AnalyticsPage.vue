<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 头部 -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">数据分析</h1>
          <p class="text-slate-400">洞察对话数据，优化 Agent 表现</p>
        </div>
        <select
          v-model="selectedDays"
          @change="loadAll"
          class="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option :value="7">近 7 天</option>
          <option :value="30">近 30 天</option>
          <option :value="90">近 90 天</option>
        </select>
      </div>

      <!-- 概览卡片 -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          v-for="stat in overviewCards"
          :key="stat.label"
          class="bg-slate-800 rounded-xl p-5 border border-slate-700"
        >
          <div class="text-3xl mb-1">{{ stat.icon }}</div>
          <div class="text-2xl font-bold text-white">{{ stat.value }}</div>
          <div class="text-sm text-slate-400 mt-1">{{ stat.label }}</div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- 每日对话趋势 -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-semibold text-white mb-4">每日对话趋势</h3>
          <div v-if="dailyTrend.length" class="relative h-48">
            <svg class="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.4" />
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.02" />
                </linearGradient>
              </defs>
              <polyline
                :points="trendAreaPoints"
                fill="url(#lineGrad)"
                stroke="none"
              />
              <polyline
                :points="trendLinePoints"
                fill="none"
                stroke="#3b82f6"
                stroke-width="2"
                stroke-linejoin="round"
              />
              <circle
                v-for="(pt, i) in trendPoints"
                :key="i"
                :cx="pt.x"
                :cy="pt.y"
                r="3"
                fill="#3b82f6"
              />
            </svg>
            <!-- X 轴标签 -->
            <div class="flex justify-between text-xs text-slate-500 mt-1">
              <span>{{ formatDate(dailyTrend[0]?.date) }}</span>
              <span>{{ formatDate(dailyTrend[Math.floor(dailyTrend.length / 2)]?.date) }}</span>
              <span>{{ formatDate(dailyTrend[dailyTrend.length - 1]?.date) }}</span>
            </div>
          </div>
          <div v-else class="h-48 flex items-center justify-center text-slate-500">暂无数据</div>
        </div>

        <!-- 活跃时段分布 -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-semibold text-white mb-4">活跃时段分布</h3>
          <div v-if="hourlyActivity.length" class="flex items-end gap-1 h-48">
            <div
              v-for="item in hourlyActivity"
              :key="item.hour"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <div
                class="w-full rounded-sm bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all"
                :style="{ height: getBarHeight(item.count, maxHourCount) + 'px' }"
                :title="`${item.hour}:00 - ${item.count} 次`"
              ></div>
              <span v-if="item.hour % 6 === 0" class="text-xs text-slate-500">{{ item.hour }}</span>
            </div>
          </div>
          <div v-else class="h-48 flex items-center justify-center text-slate-500">暂无数据</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- 热门智能体 -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-semibold text-white mb-4">热门智能体</h3>
          <div v-if="topAgents.length" class="space-y-3">
            <div
              v-for="(agent, idx) in topAgents.slice(0, 6)"
              :key="agent.agentId"
              class="flex items-center gap-3"
            >
              <span class="text-slate-500 text-sm w-5">{{ idx + 1 }}</span>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm text-white">{{ agent.agentName || '未知智能体' }}</span>
                  <span class="text-xs text-slate-400">{{ agent.conversationCount }} 次</span>
                </div>
                <div class="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    :style="{ width: getPercent(agent.conversationCount, topAgents[0]?.conversationCount) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-slate-500 text-sm text-center py-8">暂无数据</div>
        </div>

        <!-- 热词云 -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-semibold text-white mb-4">热词分析</h3>
          <div v-if="hotWords.length" class="flex flex-wrap gap-2">
            <span
              v-for="word in hotWords.slice(0, 40)"
              :key="word.word"
              class="px-3 py-1 rounded-full text-white cursor-default transition-colors"
              :style="getWordStyle(word.count, hotWords[0]?.count)"
            >
              {{ word.word }}
              <span class="text-xs opacity-70">{{ word.count }}</span>
            </span>
          </div>
          <div v-else class="text-slate-500 text-sm text-center py-8">暂无数据</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { analyticsService } from '@/services/analyticsService.js';

const selectedDays = ref(30);
const overview = ref({});
const dailyTrend = ref([]);
const topAgents = ref([]);
const hotWords = ref([]);
const hourlyActivity = ref([]);

const overviewCards = computed(() => [
  { label: '总对话数', value: overview.value.totalConversations ?? 0, icon: '💬' },
  { label: '总消息数', value: overview.value.totalMessages ?? 0, icon: '📨' },
  { label: '活跃智能体', value: overview.value.activeAgents ?? 0, icon: '🤖' },
  { label: '新增用户', value: overview.value.newUsers ?? 0, icon: '👤' },
]);

const maxHourCount = computed(() => Math.max(...hourlyActivity.value.map((h) => h.count), 1));

const trendPoints = computed(() => {
  if (!dailyTrend.value.length) return [];
  const max = Math.max(...dailyTrend.value.map((d) => d.count), 1);
  const len = dailyTrend.value.length;
  return dailyTrend.value.map((d, i) => ({
    x: (i / (len - 1)) * 400,
    y: 160 - (d.count / max) * 150,
  }));
});

const trendLinePoints = computed(() =>
  trendPoints.value.map((p) => `${p.x},${p.y}`).join(' ')
);

const trendAreaPoints = computed(() => {
  if (!trendPoints.value.length) return '';
  const pts = trendPoints.value.map((p) => `${p.x},${p.y}`).join(' ');
  return `0,170 ${pts} 400,170`;
});

const loadAll = async () => {
  const days = selectedDays.value;
  const [ov, trend, agents, words, hourly] = await Promise.allSettled([
    analyticsService.getOverview(days),
    analyticsService.getDailyTrend(days),
    analyticsService.getTopAgents(10, days),
    analyticsService.getHotWords(40, days),
    analyticsService.getActivityByHour(days),
  ]);
  if (ov.status === 'fulfilled') overview.value = ov.value.data;
  if (trend.status === 'fulfilled') dailyTrend.value = trend.value.data;
  if (agents.status === 'fulfilled') topAgents.value = agents.value.data;
  if (words.status === 'fulfilled') hotWords.value = words.value.data;
  if (hourly.status === 'fulfilled') hourlyActivity.value = hourly.value.data;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const getBarHeight = (count, max) => {
  if (!max) return 2;
  return Math.max(2, (count / max) * 160);
};

const getPercent = (val, max) => {
  if (!max) return 0;
  return Math.round((val / max) * 100);
};

const getWordStyle = (count, maxCount) => {
  const ratio = maxCount ? count / maxCount : 0;
  const size = 12 + ratio * 10;
  const opacity = 0.5 + ratio * 0.5;
  const colors = [
    '#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899',
  ];
  const color = colors[Math.floor(ratio * (colors.length - 1))];
  return {
    fontSize: `${size}px`,
    opacity,
    backgroundColor: color + '33',
    borderColor: color + '66',
    border: '1px solid',
  };
};

onMounted(loadAll);
</script>
