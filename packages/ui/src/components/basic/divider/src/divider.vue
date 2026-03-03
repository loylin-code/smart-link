<template>
  <div class="sl-divider" :class="{ 'is-vertical': vertical }">
    <span v-if="$slots.default && !vertical" class="sl-divider__text">
      <slot></slot>
    </span>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    vertical?: boolean
  }

  withDefaults(defineProps<Props>(), {
    vertical: false
  })
</script>

<style scoped lang="scss">
  .sl-divider {
    position: relative;
    width: 100%;
    height: 1px;
    background: #dcdfe6;
    margin: 16px 0;

    &.is-vertical {
      display: inline-block;
      width: 1px;
      height: 1em;
      margin: 0 8px;
      vertical-align: middle;
    }

    &__text {
      position: absolute;
      left: 50%;
      transform: translateX(-50%) translateY(-50%);
      padding: 0 16px;
      background: #ffffff;
      color: #909399;
      font-size: 14px;
    }
  }
</style>
