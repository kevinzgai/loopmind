<template>
  <section class="bg-card dark:bg-card rounded-xl border  p-6 shadow-sm space-y-6">
    <h2 class="text-lg font-bold text-foreground">隐私与安全</h2>

    <div class="space-y-4">
      <div class="flex items-center justify-between py-3 border-b ">
        <div>
          <div class="font-medium text-foreground">两步验证</div>
          <div class="text-sm text-muted-foreground">为您的账户添加额外的安全保护</div>
        </div>
        <button
          class="px-4 py-2 bg-muted dark:bg-card text-foreground rounded-lg text-sm font-medium hover:bg-muted  transition-colors">
          设置
        </button>
      </div>

      <div class="flex items-center justify-between py-3 border-b ">
        <div>
          <div class="font-medium text-foreground">登录设备管理</div>
          <div class="text-sm text-muted-foreground">查看和管理已登录的设备</div>
        </div>
        <button
          class="px-4 py-2 bg-muted dark:bg-card text-foreground rounded-lg text-sm font-medium hover:bg-muted  transition-colors">
          查看
        </button>
      </div>

      <div class="flex items-center justify-between py-3">
        <div>
          <div class="font-medium text-foreground">数据导出</div>
          <div class="text-sm text-muted-foreground">下载您的所有个人数据</div>
        </div>
        <button
          class="px-4 py-2 bg-muted dark:bg-card text-foreground rounded-lg text-sm font-medium hover:bg-muted  transition-colors">
          导出
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>
