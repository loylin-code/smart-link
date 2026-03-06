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
    background: $bg-primary;
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius-md;
    overflow: hidden;
    transition: all $transition-base ease;

    &.is-shadow {
      box-shadow: $shadow-lg;
    }

    &:hover {
      border-color: rgba(var(--primary-color-rgb, 24, 144, 255), 0.3);
    }

    &__header {
      padding: $spacing-md $spacing-lg;
      border-bottom: 1px solid $border-color-lighter;
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }

    &__body {
      padding: $spacing-lg;
      color: $text-secondary;
    }

    &__footer {
      padding: $spacing-sm $spacing-lg;
      border-top: 1px solid $border-color-lighter;
      background: $bg-secondary;
    }
  }
</style>
