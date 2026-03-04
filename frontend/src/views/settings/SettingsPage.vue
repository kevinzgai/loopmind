<template>
  <div class="w-full space-y-6 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold font-heading">系统设置</h1>
        <p class="text-muted-foreground mt-1">管理您的账户偏好和应用配置</p>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="message" class="p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-slide-up"
        :class="[
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
        ]">
        <CheckCircle v-if="message.type === 'success'" class="w-5 h-5" />
        <XCircle v-else class="w-5 h-5" />
        <span>{{ message.text }}</span>
      </div>
    </Transition>

    <router-view @save="handleSave" @error="handleError" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CheckCircle, XCircle } from 'lucide-vue-next'

const message = ref(null)

function handleSave(msg) {
  message.value = { type: 'success', text: msg || '配置已成功保存' }
  setTimeout(() => message.value = null, 3000)
}

function handleError(err) {
  message.value = { type: 'error', text: err.message || '操作失败' }
  setTimeout(() => message.value = null, 3000)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
