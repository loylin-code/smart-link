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
  @use '../../../styles/variables.scss' as v;

  .sl-card {
    background: v.$bg-primary;
    border: 1px solid v.$border-color-lighter;
    border-radius: v.$border-radius-md;
    overflow: hidden;
    transition: all v.$transition-base ease;

    &.is-shadow {
      box-shadow: v.$shadow-lg;
    }

    &:hover {
      border-color: rgba(var(--primary-color-rgb, 24, 144, 255), 0.3);
    }

    &__header {
      padding: v.$spacing-md v.$spacing-lg;
      border-bottom: 1px solid v.$border-color-lighter;
      font-size: v.$font-size-base;
      font-weight: v.$font-weight-semibold;
      color: v.$text-primary;
    }

    &__body {
      padding: v.$spacing-lg;
      color: v.$text-secondary;
    }

    &__footer {
      padding: v.$spacing-sm v.$spacing-lg;
      border-top: 1px solid v.$border-color-lighter;
      background: v.$bg-secondary;
    }
  }
</style>
