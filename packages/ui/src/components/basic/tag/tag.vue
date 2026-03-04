<template>
  <span
    class="sl-tag"
    :class="[`sl-tag--${type}`, `sl-tag--${size}`, { 'is-closable': closable, 'is-round': round }]"
    @click="$emit('click', $event)"
  >
    <slot></slot>
    <span v-if="closable" class="sl-tag__close" @click.stop="$emit('close', $event)">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M18 6L6 18M6 6L18 18"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </span>
</template>

<script setup lang="ts">
  interface Props {
    type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
    size?: 'small' | 'medium' | 'large'
    closable?: boolean
    round?: boolean
  }

  withDefaults(defineProps<Props>(), {
    type: 'default',
    size: 'medium',
    closable: false,
    round: false
  })

  defineEmits<{
    click: [event: MouseEvent]
    close: [event: MouseEvent]
  }>()
</script>

<style scoped lang="scss">
  .sl-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-radius: 4px;
    font-weight: 500;
    border: 1px solid transparent;
    transition: all 0.3s ease;

    &--small {
      height: 22px;
      padding: 0 6px;
      font-size: 12px;
    }

    &--medium {
      height: 28px;
      padding: 0 10px;
      font-size: 13px;
    }

    &--large {
      height: 34px;
      padding: 0 14px;
      font-size: 14px;
    }

    &--default {
      background: #f4f4f5;
      border-color: #e9e9eb;
      color: #909399;
    }

    &--primary {
      background: rgba(24, 144, 255, 0.1);
      border-color: rgba(24, 144, 255, 0.2);
      color: #1890ff;
    }

    &--success {
      background: rgba(103, 194, 58, 0.1);
      border-color: rgba(103, 194, 58, 0.2);
      color: #67c23a;
    }

    &--warning {
      background: rgba(230, 162, 60, 0.1);
      border-color: rgba(230, 162, 60, 0.2);
      color: #e6a23c;
    }

    &--danger {
      background: rgba(245, 108, 108, 0.1);
      border-color: rgba(245, 108, 108, 0.2);
      color: #f56c6c;
    }

    &--info {
      background: rgba(144, 147, 153, 0.1);
      border-color: rgba(144, 147, 153, 0.2);
      color: #909399;
    }

    &.is-round {
      border-radius: 999px;
    }

    &__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.3s ease;

      svg {
        width: 10px;
        height: 10px;
      }

      &:hover {
        opacity: 1;
      }
    }
  }
</style>
