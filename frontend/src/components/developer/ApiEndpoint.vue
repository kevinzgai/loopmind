<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
      <div class="flex items-center gap-3">
        <span 
          :class="[
            'px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider',
            methodColorClass
          ]"
        >
          {{ method }}
        </span>
        <code class="text-sm font-mono text-slate-700 dark:text-slate-300">{{ path }}</code>
      </div>
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ description }}</p>
    </div>

    <div class="p-6 space-y-6">
      <!-- Parameters -->
      <div v-if="parameters && parameters.length > 0">
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">请求参数</h4>
        <div class="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-lg">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500">
              <tr>
                <th class="px-4 py-2 font-medium">参数名</th>
                <th class="px-4 py-2 font-medium">类型</th>
                <th class="px-4 py-2 font-medium text-center">必选</th>
                <th class="px-4 py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="param in parameters" :key="param.name" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-4 py-3 font-mono text-violet-600 dark:text-violet-400">{{ param.name }}</td>
                <td class="px-4 py-3 text-slate-500">{{ param.type }}</td>
                <td class="px-4 py-3 text-center">
                  <span v-if="param.required" class="text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded text-[10px] font-bold">REQUIRED</span>
                  <span v-else class="text-slate-400 text-[10px]">OPTIONAL</span>
                </td>
                <td class="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{{ param.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Code Tabs -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex gap-4">
            <button 
              @click="activeTab = 'curl'"
              :class="[
                'text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-all',
                activeTab === 'curl' 
                  ? 'text-violet-600 border-violet-600' 
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              ]"
            >
              cURL 示例
            </button>
            <button 
              v-if="responseExample"
              @click="activeTab = 'response'"
              :class="[
                'text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-all',
                activeTab === 'response' 
                  ? 'text-violet-600 border-violet-600' 
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              ]"
            >
              响应示例
            </button>
          </div>
          <button 
            @click="copyToClipboard"
            class="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-md transition-all flex items-center gap-1.5 text-xs font-medium"
          >
            <component :is="copied ? Check : Copy" class="w-3.5 h-3.5" />
            {{ copied ? '已复制' : '复制代码' }}
          </button>
        </div>

        <!-- cURL View -->
        <div v-if="activeTab === 'curl'" class="relative group">
          <div class="bg-slate-950 rounded-lg p-4 overflow-x-auto border border-slate-800">
            <pre class="text-xs font-mono text-blue-300 leading-relaxed whitespace-pre-wrap">{{ curl }}</pre>
          </div>
        </div>

        <!-- Response View -->
        <div v-if="activeTab === 'response' && responseExample" class="relative group">
          <div class="bg-slate-950 rounded-lg p-4 overflow-x-auto border border-slate-800">
            <pre class="text-xs font-mono text-emerald-400 leading-relaxed">{{ JSON.stringify(responseExample, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Copy, Check } from 'lucide-vue-next'

const props = defineProps({
  method: { type: String, required: true },
  path: { type: String, required: true },
  description: { type: String, required: true },
  parameters: { type: Array, default: () => [] },
  responseExample: { type: [Object, Array], default: null },
  curl: { type: String, required: true }
})

const activeTab = ref('curl')
const copied = ref(false)

const methodColorClass = computed(() => {
  const m = props.method.toUpperCase()
  if (m === 'GET') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  if (m === 'POST') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  if (m === 'PUT') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  if (m === 'DELETE') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
})

const copyToClipboard = () => {
  const textToCopy = activeTab.value === 'curl' 
    ? props.curl 
    : JSON.stringify(props.responseExample, null, 2)
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}
</script>
