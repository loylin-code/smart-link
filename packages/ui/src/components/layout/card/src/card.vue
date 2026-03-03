<template>
  <div class="sl-card" :class="{ 'is-shadow': shadow }">
    <div v-if="$slots.header" class="sl-card__header">
      <slot name="header"></slot>
    </div>
    <div class="sl-card__body" :style="bodyStyle">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="sl-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    shadow?: boolean
    bodyStyle?: Record<string, string>
  }

  withDefaults(defineProps<Props>(), {
    shadow: true,
    bodyStyle: () => ({})
  })
</script>

<style scoped lang="scss">
  .sl-card {
    background: #ffffff;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;

    &.is-shadow {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }

    &:hover {
      border-color: rgba(24, 144, 255, 0.3);
    }

    &__header {
      padding: 16px 20px;
      border-bottom: 1px solid #ebeef5;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    &__body {
      padding: 20px;
      color: #606266;
    }

    &__footer {
      padding: 12px 20px;
      border-top: 1px solid #ebeef5;
      background: #fafafa;
    }
  }
</style>
