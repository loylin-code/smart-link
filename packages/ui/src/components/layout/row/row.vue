<template>
  <div class="sl-row" :class="classes" :style="style">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    gutter?: number
    justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'
    align?: 'top' | 'middle' | 'bottom'
  }

  const props = withDefaults(defineProps<Props>(), {
    gutter: 0,
    justify: 'start',
    align: 'top'
  })

  const classes = computed(() => [`is-justify-${props.justify}`, `is-align-${props.align}`])

  const style = computed(() => {
    if (props.gutter) {
      return {
        marginLeft: `-${props.gutter / 2}px`,
        marginRight: `-${props.gutter / 2}px`
      }
    }
    return {}
  })
</script>

<style scoped lang="scss">
  .sl-row {
    display: flex;
    flex-wrap: wrap;
    position: relative;
    box-sizing: border-box;

    &.is-justify-start {
      justify-content: flex-start;
    }
    &.is-justify-end {
      justify-content: flex-end;
    }
    &.is-justify-center {
      justify-content: center;
    }
    &.is-justify-space-around {
      justify-content: space-around;
    }
    &.is-justify-space-between {
      justify-content: space-between;
    }
    &.is-justify-space-evenly {
      justify-content: space-evenly;
    }

    &.is-align-top {
      align-items: flex-start;
    }
    &.is-align-middle {
      align-items: center;
    }
    &.is-align-bottom {
      align-items: flex-end;
    }
  }
</style>
