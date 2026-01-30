<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md">
      <div class="p-6 border-b border-slate-100 dark:border-slate-800">
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">创建新的 API Key</h2>
      </div>
      
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Key 名称</label>
          <input 
            v-model="form.name"
            type="text"
            placeholder="例如: 生产环境、测试环境"
            maxlength="50"
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <div class="text-xs text-slate-500">{{ form.name.length }} / 50</div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">过期时间（可选）</label>
          <input 
            v-model="form.expiresAt"
            type="datetime-local"
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <div class="text-xs text-slate-500">留空表示永不过期</div>
        </div>

        <div class="flex gap-3 pt-4">
          <button 
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            取消
          </button>
          <button 
            type="submit"
            :disabled="isSubmitting || !form.name.trim()"
            class="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? '创建中...' : '创建' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { createApiKey } from '@/services/apiKeyService.js'

const emit = defineEmits(['close', 'created'])

const form = reactive({
  name: '',
  expiresAt: ''
})

const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!form.name.trim()) return
  
  try {
    isSubmitting.value = true
    await createApiKey(form.name.trim(), form.expiresAt || null)
    emit('created')
  } catch (err) {
    alert('创建失败: ' + (err.response?.data?.error || err.message))
  } finally {
    isSubmitting.value = false
  }
}
</script>
