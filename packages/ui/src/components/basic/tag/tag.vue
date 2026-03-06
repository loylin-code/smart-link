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
  @use '../../../styles/variables.scss' as v;

  .sl-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-radius: v.$border-radius-sm;
    font-weight: v.$font-weight-medium;
    border: 1px solid transparent;
    transition: all v.$transition-base ease;

    &--small {
      height: 22px;
      padding: 0 6px;
      font-size: v.$font-size-xs;
    }

    &--medium {
      height: 28px;
      padding: 0 10px;
      font-size: 13px;
    }

    &--large {
      height: 34px;
      padding: 0 14px;
      font-size: v.$font-size-sm;
    }

    &--default {
      background: v.$bg-secondary;
      border-color: v.$border-color-lighter;
      color: v.$text-tertiary;
    }

    &--primary {
      background: rgba(v.$primary-color, 0.1);
      border-color: rgba(v.$primary-color, 0.2);
      color: v.$primary-color;
    }

    &--success {
      background: rgba(v.$success, 0.1);
      border-color: rgba(v.$success, 0.2);
      color: v.$success;
    }

    &--warning {
      background: rgba(v.$warning, 0.1);
      border-color: rgba(v.$warning, 0.2);
      color: v.$warning;
    }

    &--danger {
      background: rgba(v.$error, 0.1);
      border-color: rgba(v.$error, 0.2);
      color: v.$error;
    }

    &--info {
      background: rgba(v.$info, 0.1);
      border-color: rgba(v.$info, 0.2);
      color: v.$info;
    }

    &.is-round {
      border-radius: v.$border-radius-full;
    }

    &__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity v.$transition-base ease;

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
