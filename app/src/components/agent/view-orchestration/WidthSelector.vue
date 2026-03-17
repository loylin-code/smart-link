<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { WidthPreset, WidthConfig } from '@/store/modules/view'

  const { t } = useI18n()

  // Props
  interface Props {
    modelValue: WidthConfig
    disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    disabled: false
  })

  // Emits
  const emit = defineEmits<{
    'update:modelValue': [value: WidthConfig]
  }>()

  // Preset options
  const presets: { value: WidthPreset; cols: number; icon: string }[] = [
    { value: '1/4', cols: 3, icon: '▎' },
    { value: '1/3', cols: 4, icon: '▍' },
    { value: '1/2', cols: 6, icon: '▌' },
    { value: '2/3', cols: 8, icon: '▋' },
    { value: '3/4', cols: 9, icon: '▊' },
    { value: 'full', cols: 12, icon: '█' }
  ]

  // Current preset
  const currentPreset = computed({
    get: () => props.modelValue.preset,
    set: (value: WidthPreset) => {
      emit('update:modelValue', {
        ...props.modelValue,
        preset: value,
        auto: value === 'auto'
      })
    }
  })

  // Custom columns
  const customCols = computed({
    get: () => props.modelValue.desktop,
    set: (value: number) => {
      emit('update:modelValue', {
        ...props.modelValue,
        desktop: Math.max(1, Math.min(12, value))
      })
    }
  })

  // Select preset
  function selectPreset(preset: WidthPreset) {
    if (props.disabled) return
    currentPreset.value = preset
  }

  // Check if preset is active
  function isPresetActive(preset: WidthPreset): boolean {
    return currentPreset.value === preset
  }
</script>

<template>
  <div class="width-selector">
    <!-- Preset Buttons -->
    <div class="preset-grid">
      <button
        v-for="preset in presets"
        :key="preset.value"
        class="preset-btn"
        :class="{ active: isPresetActive(preset.value), disabled }"
        :disabled="disabled"
        :title="`${preset.value} (${preset.cols}/12)`"
        @click="selectPreset(preset.value)"
      >
        <span class="preset-visual">
          <span class="visual-bar" :style="{ width: `${(preset.cols / 12) * 100}%` }">
            {{ preset.icon }}
          </span>
        </span>
        <span class="preset-label">{{ preset.value }}</span>
      </button>

      <!-- Auto Width Button -->
      <button
        class="preset-btn auto-btn"
        :class="{ active: isPresetActive('auto'), disabled }"
        :disabled="disabled"
        @click="selectPreset('auto')"
      >
        <span class="preset-visual">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
            />
          </svg>
        </span>
        <span class="preset-label">{{ t('agent.design.view.widthAuto') }}</span>
      </button>
    </div>

    <!-- Custom Column Slider (shown when custom is selected) -->
    <div v-if="modelValue.preset !== 'auto'" class="custom-cols">
      <label class="cols-label">
        {{ t('agent.design.view.customCols') }}
        <span class="cols-value">{{ modelValue.desktop }}/12</span>
      </label>
      <div class="cols-slider">
        <input
          v-model.number="customCols"
          type="range"
          min="1"
          max="12"
          step="1"
          class="slider"
          :disabled="disabled"
        />
        <div class="slider-marks">
          <span v-for="n in 12" :key="n" class="mark" :class="{ active: n === modelValue.desktop }">
            {{ n }}
          </span>
        </div>
      </div>
    </div>

    <!-- Responsive Preview -->
    <div class="responsive-preview">
      <div class="preview-item">
        <svg
          class="preview-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        <span class="preview-text">{{ modelValue.desktop }}/12</span>
      </div>
      <div class="preview-item">
        <svg
          class="preview-icon tablet"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M10 18h4" />
        </svg>
        <span class="preview-text">{{ modelValue.tablet }}/12</span>
      </div>
      <div class="preview-item">
        <svg
          class="preview-icon mobile"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <rect x="6" y="2" width="12" height="20" rx="2" />
          <path d="M10 18h4" />
        </svg>
        <span class="preview-text">{{ modelValue.mobile }}/12</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .width-selector {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  // Preset Grid
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-xs;
  }

  .preset-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm;
    background: $bg-secondary;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-fast $ease-out;

    &:hover:not(:disabled) {
      border-color: $primary-light;
      background: $bg-tertiary;
    }

    &.active {
      border-color: $primary-color;
      background: $primary-muted;

      .preset-label {
        color: $primary-color;
        font-weight: $font-weight-medium;
      }
    }

    &.disabled,
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .preset-visual {
    width: 100%;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .visual-bar {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(90deg, $primary-light, $primary-color);
      border-radius: $border-radius-sm;
      font-size: 10px;
      color: white;
      transition: width $transition-base $ease-out;
    }
  }

  .preset-label {
    font-size: $font-size-xs;
    color: $text-secondary;
    transition: color $transition-fast;
  }

  .auto-btn {
    .preset-visual {
      justify-content: center;

      svg {
        width: 20px;
        height: 20px;
        color: $text-tertiary;
      }
    }
  }

  // Custom Columns Slider
  .custom-cols {
    padding: $spacing-sm;
    background: $bg-secondary;
    border-radius: $border-radius-md;
  }

  .cols-label {
    display: flex;
    justify-content: space-between;
    font-size: $font-size-xs;
    color: $text-secondary;
    margin-bottom: $spacing-sm;
  }

  .cols-value {
    font-weight: $font-weight-medium;
    color: $primary-color;
  }

  .cols-slider {
    position: relative;
  }

  .slider {
    width: 100%;
    height: 4px;
    appearance: none;
    background: $bg-elevated;
    border-radius: 2px;
    outline: none;

    &::-webkit-slider-thumb {
      appearance: none;
      width: 16px;
      height: 16px;
      background: $primary-color;
      border-radius: 50%;
      cursor: pointer;
      transition: transform $transition-fast;

      &:hover {
        transform: scale(1.2);
      }
    }

    &:disabled {
      opacity: 0.5;

      &::-webkit-slider-thumb {
        cursor: not-allowed;
      }
    }
  }

  .slider-marks {
    display: flex;
    justify-content: space-between;
    margin-top: $spacing-xs;
  }

  .mark {
    font-size: 9px;
    color: $text-tertiary;
    transition: all $transition-fast;

    &.active {
      color: $primary-color;
      font-weight: $font-weight-medium;
    }
  }

  // Responsive Preview
  .responsive-preview {
    display: flex;
    gap: $spacing-sm;
    padding: $spacing-sm;
    background: $bg-tertiary;
    border-radius: $border-radius-md;
  }

  .preview-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xs;
  }

  .preview-icon {
    width: 24px;
    height: 24px;
    color: $text-tertiary;

    &.tablet {
      width: 20px;
      height: 20px;
    }

    &.mobile {
      width: 16px;
      height: 16px;
    }
  }

  .preview-text {
    font-size: $font-size-xs;
    color: $text-secondary;
    font-weight: $font-weight-medium;
  }
</style>
