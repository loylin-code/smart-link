<template>
  <section class="sl-container" :class="classes">
    <slot></slot>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    direction?: 'horizontal' | 'vertical'
  }

  const props = withDefaults(defineProps<Props>(), {
    direction: 'vertical'
  })

  const classes = computed(() => [`is-${props.direction}`])
</script>

<style scoped lang="scss">
  .sl-container {
    display: flex;
    flex: 1;
    flex-basis: auto;
    box-sizing: border-box;
    min-width: 0;

    &.is-vertical {
      flex-direction: column;
    }

    &.is-horizontal {
      flex-direction: row;
    }
  }
</style>
