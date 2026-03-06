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
    border-radius: $border-radius-sm;
    font-weight: $font-weight-medium;
    border: 1px solid transparent;
    transition: all $transition-base ease;

    &--small {
      height: 22px;
      padding: 0 6px;
      font-size: $font-size-xs;
    }

    &--medium {
      height: 28px;
      padding: 0 10px;
      font-size: 13px;
    }

    &--large {
      height: 34px;
      padding: 0 14px;
      font-size: $font-size-sm;
    }

    &--default {
      background: $bg-secondary;
      border-color: $border-color-lighter;
      color: $text-tertiary;
    }

    &--primary {
      background: rgba($primary-color, 0.1);
      border-color: rgba($primary-color, 0.2);
      color: $primary-color;
    }

    &--success {
      background: rgba($success, 0.1);
      border-color: rgba($success, 0.2);
      color: $success;
    }

    &--warning {
      background: rgba($warning, 0.1);
      border-color: rgba($warning, 0.2);
      color: $warning;
    }

    &--danger {
      background: rgba($error, 0.1);
      border-color: rgba($error, 0.2);
      color: $error;
    }

    &--info {
      background: rgba($info, 0.1);
      border-color: rgba($info, 0.2);
      color: $info;
    }

    &.is-round {
      border-radius: $border-radius-full;
    }

    &__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity $transition-base ease;

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
