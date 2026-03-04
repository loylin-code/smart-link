<template>
  <a
    v-if="href"
    :href="href"
    :target="target"
    class="sl-link"
    :class="[`sl-link--${type}`, { 'is-disabled': disabled, 'is-underline': underline }]"
    @click="handleClick"
  >
    <slot></slot>
  </a>
  <span
    v-else
    class="sl-link"
    :class="[`sl-link--${type}`, { 'is-disabled': disabled, 'is-underline': underline }]"
    @click="handleClick"
  >
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
  interface Props {
    type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
    href?: string
    target?: string
    disabled?: boolean
    underline?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'default',
    target: '_self',
    disabled: false,
    underline: true
  })

  const emit = defineEmits<{
    click: [event: MouseEvent]
  }>()

  const handleClick = (event: MouseEvent) => {
    if (props.disabled) {
      event.preventDefault()
      return
    }
    emit('click', event)
  }
</script>

<style scoped lang="scss">
  .sl-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-size: inherit;
    text-decoration: none;
    transition: color 0.3s ease;

    &--default {
      color: #b4b9d4;

      &:hover:not(.is-disabled) {
        color: #00d4ff;
      }
    }

    &--primary {
      color: #00d4ff;

      &:hover:not(.is-disabled) {
        color: #4de8ff;
      }
    }

    &--success {
      color: #10b981;

      &:hover:not(.is-disabled) {
        color: #34d399;
      }
    }

    &--warning {
      color: #f59e0b;

      &:hover:not(.is-disabled) {
        color: #fbbf24;
      }
    }

    &--danger {
      color: #ef4444;

      &:hover:not(.is-disabled) {
        color: #f87171;
      }
    }

    &--info {
      color: #3b82f6;

      &:hover:not(.is-disabled) {
        color: #60a5fa;
      }
    }

    &.is-underline:not(.is-disabled):hover {
      text-decoration: underline;
    }

    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
</style>
