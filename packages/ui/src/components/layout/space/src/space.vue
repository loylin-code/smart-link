<template>
  <div class="sl-space" :class="[`is-${direction}`, `is-align-${align}`, `is-justify-${justify}`]">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    direction?: 'horizontal' | 'vertical'
    align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch'
    justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'
    size?: 'small' | 'medium' | 'large' | number
  }

  withDefaults(defineProps<Props>(), {
    direction: 'horizontal',
    align: 'center',
    justify: 'start',
    size: 'small'
  })
</script>

<style scoped lang="scss">
  .sl-space {
    display: inline-flex;

    &.is-horizontal {
      flex-direction: row;
    }

    &.is-vertical {
      flex-direction: column;
    }

    &.is-align-start {
      align-items: flex-start;
    }
    &.is-align-center {
      align-items: center;
    }
    &.is-align-end {
      align-items: flex-end;
    }
    &.is-align-baseline {
      align-items: baseline;
    }
    &.is-align-stretch {
      align-items: stretch;
    }

    &.is-justify-start {
      justify-content: flex-start;
    }
    &.is-justify-center {
      justify-content: center;
    }
    &.is-justify-end {
      justify-content: flex-end;
    }
    &.is-justify-space-between {
      justify-content: space-between;
    }
    &.is-justify-space-around {
      justify-content: space-around;
    }

    :deep(> *) {
      &:not(:last-child) {
        margin-right: 8px;
      }
    }

    &.is-vertical :deep(> *) {
      &:not(:last-child) {
        margin-right: 0;
        margin-bottom: 8px;
      }
    }
  }
</style>
