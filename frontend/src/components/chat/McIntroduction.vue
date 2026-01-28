<template>
  <div class="mc-introduction">
    <div class="intro-logo">
      <img v-if="logoImg" :src="logoImg" :alt="title" />
      <div v-else class="logo-placeholder">🤖</div>
    </div>
    <div v-if="title" class="intro-title">{{ title }}</div>
    <div v-if="subTitle" class="intro-subtitle">{{ subTitle }}</div>
    <div v-if="description" class="intro-desc" v-html="description"></div>
    <slot name="extra"></slot>
  </div>
</template>

<script setup>
defineProps({
  logoImg: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  subTitle: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.mc-introduction {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 2rem 0;
  text-align: center;
}

.intro-logo img {
  width: 72px;
  height: 72px;
  object-fit: contain;
}

.logo-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
  border: 1px solid #e2e8f0;
}

.intro-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.intro-subtitle {
  font-size: 1.1rem;
  color: #4a5568;
}

.intro-desc {
  color: #718096;
  max-width: 600px;
  line-height: 1.6;
}

:deep(.intro-desc) p {
  margin-bottom: 8px;
}
</style>
