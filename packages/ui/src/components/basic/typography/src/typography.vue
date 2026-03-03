<template>
  <component
    :is="tag"
    class="sl-typography"
    :class="[`sl-typography--${type}`, { 'is-ellipsis': ellipsis, 'is-copyable': copyable }]"
  >
    <slot></slot>
    <span v-if="copyable" class="sl-typography__copy" @click="handleCopy">
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
        <path
          d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
          stroke="currentColor"
          stroke-width="2"
        />
      </svg>
    </span>
  </component>
</template>

<script setup lang="ts">
  interface Props {
    type?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
    tag?: string
    ellipsis?: boolean
    rows?: number
    copyable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'default',
    tag: 'span',
    ellipsis: false,
    rows: 1,
    copyable: false
  })

  const handleCopy = async () => {
    try {
      const text = props.tag === 'span' ? '' : ''
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.error('Copy failed', e)
    }
  }
</script>

<style scoped lang="scss">
  .sl-typography {
    color: #ffffff;
    margin: 0;
    padding: 0;

    &--default {
      color: #ffffff;
    }

    &--primary {
      color: #00d4ff;
    }

    &--secondary {
      color: #b4b9d4;
    }

    &--success {
      color: #10b981;
    }

    &--warning {
      color: #f59e0b;
    }

    &--danger {
      color: #ef4444;
    }

    &.is-ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__copy {
      display: inline-flex;
      align-items: center;
      margin-left: 4px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.3s ease;

      svg {
        width: 14px;
        height: 14px;
      }

      &:hover {
        opacity: 1;
      }
    }
  }
</style>
