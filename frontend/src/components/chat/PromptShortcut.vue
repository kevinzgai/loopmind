<template>
  <div :class="['prompt-shortcut', direction === 'horizontal' ? 'horizontal' : 'vertical']">
    <button
      v-for="(item, idx) in list"
      :key="idx"
      class="prompt-item"
      @click="$emit('itemClick', item)"
      :title="item.desc || ''"
    >
      <span class="prompt-icon">{{ item.icon || '💡' }}</span>
      <span class="prompt-label">{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  list: { type: Array, default: () => [] },
  direction: { type: String, default: 'horizontal' }
})
</script>

<style scoped>
.prompt-shortcut {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.prompt-shortcut.vertical {
  flex-direction: column;
}
.prompt-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #2d3748;
  font-size: 0.875rem;
  cursor: pointer;
}
.prompt-item:hover {
  background: #f7fafc;
}
.prompt-icon {
  font-size: 1rem;
}
.prompt-label {
  font-weight: 500;
}
</style>
