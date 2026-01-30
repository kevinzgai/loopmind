<template>
  <section class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
    <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">通知设置</h2>

    <div class="space-y-4">
      <div class="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div class="font-medium text-slate-900 dark:text-slate-100">邮件通知</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">接收重要更新和活动通知</div>
        </div>
        <button @click="settings.notifications.email = !settings.notifications.email" :class="[
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          settings.notifications.email ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'
        ]">
          <span :class="[
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
          ]" />
        </button>
      </div>

      <div class="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div class="font-medium text-slate-900 dark:text-slate-100">智能体回复通知</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">当智能体回复您的消息时通知</div>
        </div>
        <button @click="settings.notifications.agent = !settings.notifications.agent" :class="[
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          settings.notifications.agent ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'
        ]">
          <span :class="[
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            settings.notifications.agent ? 'translate-x-6' : 'translate-x-1'
          ]" />
        </button>
      </div>

      <div class="flex items-center justify-between py-3">
        <div>
          <div class="font-medium text-slate-900 dark:text-slate-100">系统公告</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">接收平台更新和维护通知</div>
        </div>
        <button @click="settings.notifications.system = !settings.notifications.system" :class="[
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          settings.notifications.system ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'
        ]">
          <span :class="[
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            settings.notifications.system ? 'translate-x-6' : 'translate-x-1'
          ]" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue'

const settings = reactive({
  notifications: {
    email: true,
    agent: true,
    system: true
  }
})
</script>
