<template>
  <button class="copy-button" :class="{ copied }" @click="handleCopy">
    <svg v-if="!copied" viewBox="0 0 24 24" fill="none" class="copy-icon">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
      <path
        d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
        stroke="currentColor"
        stroke-width="2"
      />
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="none" class="copy-icon">
      <path
        d="M5 13L9 17L19 7"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span class="copy-text">{{ copied ? '已复制' : '复制' }}</span>
  </button>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const props = defineProps<{
    text: string
  }>()

  const copied = ref(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.text)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }
</script>

<style scoped lang="scss">
  .copy-button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: rgba(24, 144, 255, 0.1);
    border: 1px solid rgba(24, 144, 255, 0.3);
    border-radius: $border-radius-sm;
    color: $primary-color;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all $transition-fast ease;

    &:hover {
      background: rgba(24, 144, 255, 0.15);
      border-color: $primary-color;
    }

    &.copied {
      background: rgba(103, 194, 58, 0.1);
      border-color: rgba(103, 194, 58, 0.3);
      color: $success;
    }
  }

  .copy-icon {
    width: 14px;
    height: 14px;
  }

  .copy-text {
    line-height: 1;
  }
</style>
