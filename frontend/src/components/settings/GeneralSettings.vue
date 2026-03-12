<template>
  <section class="bg-card dark:bg-card rounded-xl border  p-6 shadow-sm space-y-6">
    <h2 class="text-lg font-bold text-foreground">通用设置</h2>

    <div class="space-y-4">
      <div class="flex items-center justify-between py-3 border-b ">
        <div>
          <div class="font-medium text-foreground">深色模式</div>
          <div class="text-sm text-muted-foreground">切换应用的明暗主题</div>
        </div>
        <ThemeToggle />
      </div>

      <div class="flex items-center justify-between py-3 border-b ">
        <div>
          <div class="font-medium text-foreground">语言</div>
          <div class="text-sm text-muted-foreground">选择界面显示语言</div>
        </div>
        <select
          class="bg-muted dark:bg-card border  rounded-lg px-3 py-2 text-sm text-foreground">
          <option>简体中文</option>
          <option>English</option>
        </select>
      </div>

      <div class="flex items-center justify-between py-3">
        <div>
          <div class="font-medium text-foreground">时区</div>
          <div class="text-sm text-muted-foreground">设置您所在的时区</div>
        </div>
        <select
          class="bg-muted dark:bg-card border  rounded-lg px-3 py-2 text-sm text-foreground">
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
