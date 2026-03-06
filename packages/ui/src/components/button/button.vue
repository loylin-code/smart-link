<template>
  <button
    class="sl-button"
    :class="[
      `sl-button--${type}`,
      `sl-button--${size}`,
      {
        'is-disabled': disabled,
        'is-loading': loading
      }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="sl-button__loading">
      <svg viewBox="0 0 24 24" class="loading-icon">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
      </svg>
    </span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    type?: 'primary' | 'default' | 'danger' | 'warning' | 'success'
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
    loading?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'default',
    size: 'medium',
    disabled: false,
    loading: false
  })

  const emit = defineEmits<{
    click: [event: MouseEvent]
  }>()

  const handleClick = (event: MouseEvent) => {
    if (!props.disabled && !props.loading) {
      emit('click', event)
    }
  }
</script>

<style scoped lang="scss">
  .sl-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    padding: 0 $spacing-md;
    font-weight: $font-weight-medium;
    border-radius: $border-radius-sm;
    cursor: pointer;
    transition: all $transition-base ease;
    border: 1px solid transparent;

    &--small {
      height: 28px;
      font-size: $font-size-xs;
      padding: 0 $spacing-sm;
    }

    &--medium {
      height: 36px;
      font-size: $font-size-sm;
    }

    &--large {
      height: 44px;
      font-size: $font-size-base;
      padding: 0 $spacing-lg;
    }

    &--default {
      background: $bg-primary;
      border-color: $border-color-base;
      color: $text-secondary;

      &:hover:not(.is-disabled) {
        border-color: $primary-color;
        color: $primary-color;
      }
    }

    &--primary {
      background: $primary-color;
      color: $bg-primary;

      &:hover:not(.is-disabled) {
        opacity: 0.9;
      }
    }

    &--danger {
      background: $error;
      color: $bg-primary;
    }

    &--warning {
      background: $warning;
      color: $bg-primary;
    }

    &--success {
      background: $success;
      color: $bg-primary;
    }

    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.is-loading {
      cursor: wait;
    }

    &__loading {
      .loading-icon {
        width: 14px;
        height: 14px;
        animation: spin 1s linear infinite;
      }
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
