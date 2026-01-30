<!--
 * @Author: neno 605899155@qq.com
 * @Date: 2026-01-29 21:13:53
 * @LastEditors: neno 605899155@qq.com
 * @LastEditTime: 2026-01-30 23:24:04
 * @FilePath: /chart-ai/frontend/src/App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="app">
    <AppLayout v-if="!isStandalonePage">
      <router-view />
    </AppLayout>
    <router-view v-else />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { initializeAuth } from '@/stores/authStore.js'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const isStandalonePage = computed(() => {
  const standalonePaths = ['/login', '/register', '/widget']
  return standalonePaths.some(path => route.path.includes(path))
})

onMounted(() => {
  initializeAuth()
})
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
