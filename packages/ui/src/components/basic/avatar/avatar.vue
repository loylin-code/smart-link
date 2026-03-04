<template>
  <span class="sl-avatar" :class="[`sl-avatar--${size}`, { 'is-circle': circle }]" :style="style">
    <img v-if="src && !imgError" :src="src" :alt="alt" @error="handleError" />
    <span v-else-if="icon" class="sl-avatar__icon">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" />
        <path
          d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </span>
    <span v-else class="sl-avatar__text">
      {{ textContent }}
    </span>
  </span>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  interface Props {
    src?: string
    alt?: string
    icon?: boolean
    size?: 'small' | 'medium' | 'large' | number
    circle?: boolean
    text?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    alt: '',
    icon: false,
    size: 'medium',
    circle: false
  })

  const imgError = ref(false)

  const handleError = () => {
    imgError.value = true
  }

  const style = computed(() => {
    if (typeof props.size === 'number') {
      return {
        width: `${props.size}px`,
        height: `${props.size}px`,
        lineHeight: `${props.size}px`,
        fontSize: `${props.size / 2.5}px`
      }
    }
    return {}
  })

  const textContent = computed(() => {
    if (props.text) {
      return props.text.slice(0, 2)
    }
    return ''
  })
</script>

<style scoped lang="scss">
  .sl-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    text-align: center;
    overflow: hidden;
    color: #fff;
    background: linear-gradient(135deg, #00d4ff, #7c3aed);
    border-radius: 8px;
    font-weight: 600;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &--small {
      width: 32px;
      height: 32px;
      font-size: 12px;
    }

    &--medium {
      width: 40px;
      height: 40px;
      font-size: 14px;
    }

    &--large {
      width: 56px;
      height: 56px;
      font-size: 18px;
    }

    &.is-circle {
      border-radius: 50%;
    }

    &__icon {
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 60%;
        height: 60%;
      }
    }

    &__text {
      transform: scale(1);
    }
  }
</style>
