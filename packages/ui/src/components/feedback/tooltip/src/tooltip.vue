<template>
  <span class="sl-tooltip" @mouseenter="show" @mouseleave="hide">
    <slot></slot>
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="visible"
          class="sl-tooltip__popper"
          :class="[`is-${placement}`]"
          :style="popperStyle"
        >
          {{ content }}
          <div class="sl-tooltip__arrow"></div>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  interface Props {
    content: string
    placement?: 'top' | 'bottom' | 'left' | 'right'
  }

  const props = withDefaults(defineProps<Props>(), {
    placement: 'top'
  })

  const visible = ref(false)
  const triggerRect = ref<DOMRect | null>(null)

  const popperStyle = computed(() => {
    if (!triggerRect.value) return {}
    const rect = triggerRect.value
    switch (props.placement) {
      case 'top':
        return {
          left: `${rect.left + rect.width / 2}px`,
          top: `${rect.top}px`
        }
      case 'bottom':
        return {
          left: `${rect.left + rect.width / 2}px`,
          top: `${rect.bottom}px`
        }
      case 'left':
        return {
          left: `${rect.left}px`,
          top: `${rect.top + rect.height / 2}px`
        }
      case 'right':
        return {
          left: `${rect.right}px`,
          top: `${rect.top + rect.height / 2}px`
        }
      default:
        return {}
    }
  })

  const show = (event: MouseEvent) => {
    triggerRect.value = (event.currentTarget as HTMLElement).getBoundingClientRect()
    visible.value = true
  }

  const hide = () => {
    visible.value = false
  }
</script>

<style scoped lang="scss">
  .sl-tooltip {
    display: inline-block;
  }

  .sl-tooltip__popper {
    position: fixed;
    padding: 8px 12px;
    background: #1e2447;
    border: 1px solid #252b4e;
    border-radius: 4px;
    font-size: 12px;
    color: #fff;
    z-index: 2000;
    white-space: nowrap;

    &.is-top {
      transform: translateX(-50%) translateY(-100%);
      margin-top: -8px;
    }

    &.is-bottom {
      transform: translateX(-50%);
      margin-top: 8px;
    }

    &.is-left {
      transform: translateX(-100%) translateY(-50%);
      margin-left: -8px;
    }

    &.is-right {
      transform: translateY(-50%);
      margin-left: 8px;
    }
  }

  .tooltip-enter-active,
  .tooltip-leave-active {
    transition: opacity 0.2s ease;
  }

  .tooltip-enter-from,
  .tooltip-leave-to {
    opacity: 0;
  }
</style>
