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
    gap: 8px;
    padding: 0 16px;
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;

    &--small {
      height: 28px;
      font-size: 12px;
      padding: 0 12px;
    }

    &--medium {
      height: 36px;
      font-size: 14px;
    }

    &--large {
      height: 44px;
      font-size: 16px;
      padding: 0 24px;
    }

    &--default {
      background: #fff;
      border-color: #dcdfe6;
      color: #606266;

      &:hover:not(.is-disabled) {
        border-color: #409eff;
        color: #409eff;
      }
    }

    &--primary {
      background: linear-gradient(135deg, #00d4ff, #00a8cc);
      color: #fff;

      &:hover:not(.is-disabled) {
        opacity: 0.9;
      }
    }

    &--danger {
      background: #f56c6c;
      color: #fff;
    }

    &--warning {
      background: #e6a23c;
      color: #fff;
    }

    &--success {
      background: #67c23a;
      color: #fff;
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
