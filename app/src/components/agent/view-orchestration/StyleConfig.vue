<script setup lang="ts">
  import { computed } from 'vue'
  import type { StyleConfig } from '@/store/modules/view'

  // Props
  interface Props {
    modelValue: StyleConfig
    disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    disabled: false
  })

  // Emits
  const emit = defineEmits<{
    'update:modelValue': [value: StyleConfig]
  }>()

  // Shadow options
  const shadowOptions = [
    { value: 'none', label: '无阴影' },
    { value: 'sm', label: '小阴影' },
    { value: 'md', label: '中阴影' },
    { value: 'lg', label: '大阴影' }
  ]

  // Border radius presets
  const radiusPresets = [0, 4, 8, 12, 16, 24]

  // Local style
  const localStyle = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  // Update style property
  function updateStyle<K extends keyof StyleConfig>(key: K, value: StyleConfig[K]) {
    emit('update:modelValue', { ...props.modelValue, [key]: value })
  }
</script>

<template>
  <div class="style-config">
    <!-- Background Color -->
    <div class="form-group">
      <label class="form-label">背景色</label>
      <div class="color-input-wrapper">
        <input
          type="color"
          :value="
            localStyle.backgroundColor === 'transparent' ? '#ffffff' : localStyle.backgroundColor
          "
          @input="updateStyle('backgroundColor', ($event.target as HTMLInputElement).value)"
          :disabled="disabled"
        />
        <input
          type="text"
          :value="localStyle.backgroundColor"
          @change="updateStyle('backgroundColor', ($event.target as HTMLInputElement).value)"
          :disabled="disabled"
          class="color-text"
        />
        <button
          class="transparent-btn"
          @click="updateStyle('backgroundColor', 'transparent')"
          :disabled="disabled"
          title="透明"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Border Color -->
    <div class="form-group">
      <label class="form-label">边框色</label>
      <div class="color-input-wrapper">
        <input
          type="color"
          :value="localStyle.borderColor === 'transparent' ? '#e4e7ed' : localStyle.borderColor"
          @input="updateStyle('borderColor', ($event.target as HTMLInputElement).value)"
          :disabled="disabled"
        />
        <input
          type="text"
          :value="localStyle.borderColor"
          @change="updateStyle('borderColor', ($event.target as HTMLInputElement).value)"
          :disabled="disabled"
          class="color-text"
        />
        <button
          class="transparent-btn"
          @click="updateStyle('borderColor', 'transparent')"
          :disabled="disabled"
          title="透明"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Border Radius -->
    <div class="form-group">
      <label class="form-label">圆角</label>
      <div class="radius-presets">
        <button
          v-for="radius in radiusPresets"
          :key="radius"
          class="radius-btn"
          :class="{ active: localStyle.borderRadius === radius }"
          @click="updateStyle('borderRadius', radius)"
          :disabled="disabled"
        >
          {{ radius }}px
        </button>
      </div>
      <div class="slider-wrapper">
        <input
          type="range"
          :value="localStyle.borderRadius"
          @input="updateStyle('borderRadius', Number(($event.target as HTMLInputElement).value))"
          min="0"
          max="32"
          step="1"
          :disabled="disabled"
          class="radius-slider"
        />
        <span class="slider-value">{{ localStyle.borderRadius }}px</span>
      </div>
    </div>

    <!-- Shadow -->
    <div class="form-group">
      <label class="form-label">阴影</label>
      <div class="shadow-options">
        <button
          v-for="option in shadowOptions"
          :key="option.value"
          class="shadow-btn"
          :class="{ active: localStyle.shadow === option.value }"
          @click="updateStyle('shadow', option.value as StyleConfig['shadow'])"
          :disabled="disabled"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Opacity -->
    <div class="form-group">
      <label class="form-label">透明度</label>
      <div class="slider-wrapper">
        <input
          type="range"
          :value="localStyle.opacity"
          @input="updateStyle('opacity', Number(($event.target as HTMLInputElement).value))"
          min="0"
          max="1"
          step="0.1"
          :disabled="disabled"
          class="opacity-slider"
        />
        <span class="slider-value">{{ Math.round(localStyle.opacity * 100) }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .style-config {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .form-label {
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: $text-secondary;
  }

  // Color Input
  .color-input-wrapper {
    display: flex;
    gap: $spacing-xs;
    align-items: center;

    input[type='color'] {
      width: 32px;
      height: 32px;
      padding: 0;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-sm;
      cursor: pointer;

      &::-webkit-color-swatch-wrapper {
        padding: 2px;
      }

      &::-webkit-color-swatch {
        border-radius: 2px;
        border: none;
      }
    }

    .color-text {
      flex: 1;
      padding: $spacing-xs $spacing-sm;
      background: $bg-secondary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-sm;
      font-size: $font-size-xs;
      font-family: monospace;
      color: $text-primary;

      &:focus {
        border-color: $primary-color;
        outline: none;
      }
    }

    .transparent-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: $bg-secondary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-sm;
      color: $text-tertiary;
      cursor: pointer;

      svg {
        width: 14px;
        height: 14px;
      }

      &:hover:not(:disabled) {
        background: $bg-tertiary;
        color: $text-secondary;
      }
    }
  }

  // Radius Presets
  .radius-presets {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
  }

  .radius-btn {
    padding: $spacing-xs $spacing-sm;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover:not(:disabled) {
      border-color: $primary-light;
    }

    &.active {
      background: $primary-muted;
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .slider-wrapper {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .radius-slider,
  .opacity-slider {
    flex: 1;
    height: 4px;
    appearance: none;
    background: $bg-tertiary;
    border-radius: 2px;
    outline: none;

    &::-webkit-slider-thumb {
      appearance: none;
      width: 14px;
      height: 14px;
      background: $primary-color;
      border-radius: 50%;
      cursor: pointer;
    }
  }

  .slider-value {
    min-width: 40px;
    font-size: $font-size-xs;
    color: $text-secondary;
    text-align: right;
  }

  // Shadow Options
  .shadow-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-xs;
  }

  .shadow-btn {
    padding: $spacing-sm;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover:not(:disabled) {
      border-color: $primary-light;
    }

    &.active {
      background: $primary-muted;
      border-color: $primary-color;
      color: $primary-color;
    }
  }
</style>
