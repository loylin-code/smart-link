<template>
  <div class="sl-col" :style="colStyle">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue'

  interface Props {
    span?: number
    offset?: number
    push?: number
    pull?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    span: 24,
    offset: 0,
    push: 0,
    pull: 0
  })

  const gutter = inject('gutter', 0)

  const colStyle = computed(() => {
    const style: Record<string, string> = {
      maxWidth: `${(100 / 24) * props.span}%`,
      flex: `0 0 ${(100 / 24) * props.span}%`
    }

    if (props.offset) {
      style.marginLeft = `${(100 / 24) * props.offset}%`
    }

    if (props.push) {
      style.position = 'relative'
      style.left = `${(100 / 24) * props.push}%`
    }

    if (props.pull) {
      style.position = 'relative'
      style.right = `${(100 / 24) * props.pull}%`
    }

    if (gutter) {
      style.paddingLeft = `${(gutter as number) / 2}px`
      style.paddingRight = `${(gutter as number) / 2}px`
    }

    return style
  })
</script>

<style scoped lang="scss">
  .sl-col {
    box-sizing: border-box;
    min-height: 1px;
  }
</style>
