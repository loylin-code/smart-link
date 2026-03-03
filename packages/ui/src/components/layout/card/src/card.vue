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
    background: #151b3d;
    border: 1px solid #252b4e;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;

    &.is-shadow {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    &:hover {
      border-color: rgba(0, 212, 255, 0.3);
    }

    &__header {
      padding: 16px 20px;
      border-bottom: 1px solid #252b4e;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }

    &__body {
      padding: 20px;
      color: #b4b9d4;
    }

    &__footer {
      padding: 12px 20px;
      border-top: 1px solid #252b4e;
      background: rgba(0, 0, 0, 0.2);
    }
  }
</style>
