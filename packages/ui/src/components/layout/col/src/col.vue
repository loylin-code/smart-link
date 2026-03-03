<template>
  <div class="sl-col" :class="classes" :style="style">
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

  const classes = computed(() =>
    [
      `sl-col-${props.span}`,
      props.offset ? `sl-col-offset-${props.offset}` : '',
      props.push ? `sl-col-push-${props.push}` : '',
      props.pull ? `sl-col-pull-${props.pull}` : ''
    ].filter(Boolean)
  )

  const style = computed(() => {
    if (gutter) {
      return {
        paddingLeft: `${(gutter as number) / 2}px`,
        paddingRight: `${(gutter as number) / 2}px`
      }
    }
    return {}
  })
</script>

<style scoped lang="scss">
  .sl-col {
    box-sizing: border-box;
    min-height: 1px;

    @for $i from 0 through 24 {
      &-#{$i} {
        max-width: calc(100% / 24 * #{$i});
        flex: 0 0 calc(100% / 24 * #{$i});
      }
      &-offset-#{$i} {
        margin-left: calc(100% / 24 * #{$i});
      }
      &-push-#{$i} {
        position: relative;
        left: calc(100% / 24 * #{$i});
      }
      &-pull-#{$i} {
        position: relative;
        right: calc(100% / 24 * #{$i});
      }
    }
  }
</style>
