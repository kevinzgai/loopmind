<template>
  <section class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
    <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">通用设置</h2>

    <div class="space-y-4">
      <div class="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div class="font-medium text-slate-900 dark:text-slate-100">深色模式</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">切换应用的明暗主题</div>
        </div>
        <ThemeToggle />
      </div>

      <div class="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div class="font-medium text-slate-900 dark:text-slate-100">语言</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">选择界面显示语言</div>
        </div>
        <select
          class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
          <option>简体中文</option>
          <option>English</option>
        </select>
      </div>

      <div class="flex items-center justify-between py-3">
        <div>
          <div class="font-medium text-slate-900 dark:text-slate-100">时区</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">设置您所在的时区</div>
        </div>
        <select
          class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
          <option>Asia/Shanghai (UTC+8)</option>
          <option>America/New_York (UTC-5)</option>
          <option>Europe/London (UTC+0)</option>
        </select>
      </div>
    </div>
  </section>
</template>

<script setup>
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>
