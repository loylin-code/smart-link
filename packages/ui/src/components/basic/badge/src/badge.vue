<template>
  <span class="sl-badge">
    <slot></slot>
    <sup v-if="!hidden" class="sl-badge__content" :class="{ 'is-dot': dot }">
      {{ dot ? '' : displayValue }}
    </sup>
  </span>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    value?: string | number
    max?: number
    dot?: boolean
    hidden?: boolean
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  }

  const props = withDefaults(defineProps<Props>(), {
    max: 99,
    dot: false,
    hidden: false,
    type: 'danger'
  })

  const displayValue = computed(() => {
    if (props.dot) return ''
    if (typeof props.value === 'number' && props.value > props.max) {
      return `${props.max}+`
    }
    return props.value
  })
</script>

<style scoped lang="scss">
  .sl-badge {
    position: relative;
    display: inline-block;
    vertical-align: middle;

    &__content {
      position: absolute;
      top: 0;
      right: 10px;
      transform: translateY(-50%) translateX(100%);
      z-index: 1;
      height: 18px;
      padding: 0 6px;
      font-size: 12px;
      font-weight: 500;
      line-height: 18px;
      color: #fff;
      background: #ef4444;
      border-radius: 10px;
      white-space: nowrap;

      &.is-dot {
        width: 8px;
        height: 8px;
        padding: 0;
        border-radius: 50%;
        right: 4px;
      }
    }
  }
</style>
