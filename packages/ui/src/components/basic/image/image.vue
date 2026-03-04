<template>
  <div class="sl-image" :class="{ 'is-loading': loading, 'is-error': error }" :style="style">
    <img
      v-show="!loading && !error"
      :src="src"
      :alt="alt"
      :style="fitStyle"
      @load="handleLoad"
      @error="handleError"
    />
    <div v-if="loading" class="sl-image__placeholder">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
      </svg>
    </div>
    <div v-if="error" class="sl-image__error">
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path
          d="M21 15L16 10L5 21"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  interface Props {
    src: string
    alt?: string
    width?: string | number
    height?: string | number
    fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
    lazy?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    alt: '',
    fit: 'cover',
    lazy: false
  })

  const loading = ref(true)
  const error = ref(false)

  const style = computed(() => ({
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height
  }))

  const fitStyle = computed(() => ({
    objectFit: props.fit
  }))

  const handleLoad = () => {
    loading.value = false
    error.value = false
  }

  const handleError = () => {
    loading.value = false
    error.value = true
  }
</script>

<style scoped lang="scss">
  .sl-image {
    position: relative;
    display: inline-block;
    overflow: hidden;
    border-radius: 8px;
    background: #1e2447;

    img {
      width: 100%;
      height: 100%;
      vertical-align: middle;
    }

    &__placeholder,
    &__error {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7194;

      svg {
        width: 40%;
        height: 40%;
      }
    }

    &__placeholder svg {
      animation: spin 1s linear infinite;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
