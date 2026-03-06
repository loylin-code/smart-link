<template>
  <div class="sl-select" :class="{ 'is-disabled': disabled, 'is-focused': isFocused }">
    <div class="sl-select__input" @click="toggleDropdown">
      <input
        :value="displayLabel"
        :placeholder="placeholder"
        :disabled="disabled"
        readonly
        class="sl-select__inner"
      />
      <span class="sl-select__arrow" :class="{ 'is-reverse': visible }">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </div>
    <Transition name="slide">
      <div v-if="visible" class="sl-select__dropdown">
        <div v-if="!options.length" class="sl-select__empty">No data available</div>
        <div
          v-for="option in options"
          :key="option.value"
          class="sl-select__option"
          :class="{ 'is-selected': modelValue === option.value }"
          @click.stop="handleSelect(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  interface Option {
    label: string
    value: string | number
  }

  interface Props {
    modelValue?: string | number
    options?: Option[]
    placeholder?: string
    disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    options: () => [],
    placeholder: '请选择',
    disabled: false
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string | number]
    change: [value: string | number]
  }>()

  const visible = ref(false)
  const isFocused = ref(false)

  const displayLabel = computed(() => {
    const option = props.options.find((o: Option) => o.value === props.modelValue)
    return option?.label || ''
  })

  const toggleDropdown = () => {
    if (props.disabled) return
    visible.value = !visible.value
    isFocused.value = visible.value
  }

  const handleSelect = (option: Option) => {
    emit('update:modelValue', option.value)
    emit('change', option.value)
    visible.value = false
    isFocused.value = false
  }
</script>

<style scoped lang="scss">
  .sl-select {
    position: relative;
    width: 100%;

    &__input {
      position: relative;
    }

    &__inner {
      width: 100%;
      padding: 8px 32px 8px 12px;
      font-size: $font-size-sm;
      color: $text-primary;
      background: $bg-primary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-sm;
      outline: none;
      cursor: pointer;
      transition: all $transition-base ease;

      &::placeholder {
        color: $text-disabled;
      }

      &:hover:not(:disabled) {
        border-color: $primary-color;
      }
    }

    &__arrow {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      color: $text-disabled;
      transition: transform $transition-base ease;

      svg {
        width: 16px;
        height: 16px;
      }

      &.is-reverse {
        transform: translateY(-50%) rotate(180deg);
      }
    }

    &.is-focused {
      .sl-select__inner {
        border-color: $primary-color;
        box-shadow: 0 0 0 2px $glow-primary;
      }
    }

    &.is-disabled {
      .sl-select__inner {
        background: $bg-secondary;
        border-color: $border-color-light;
        color: $text-disabled;
        cursor: not-allowed;
      }
    }

    &__dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      margin-top: 4px;
      padding: 4px 0;
      background: $bg-primary;
      border: 1px solid $border-color-light;
      border-radius: $border-radius-sm;
      box-shadow: $shadow-lg;
      z-index: 100;
    }

    &__option {
      padding: 8px 12px;
      font-size: $font-size-sm;
      color: $text-secondary;
      cursor: pointer;
      transition: all $transition-fast ease;

      &:hover {
        background: $bg-secondary;
        color: $primary-color;
      }

      &.is-selected {
        color: $primary-color;
        background: $glow-primary;
      }
    }

    &__empty {
      padding: 8px 12px;
      font-size: $font-size-sm;
      color: $text-tertiary;
      text-align: center;
    }
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: all $transition-fast ease;
  }

  .slide-enter-from,
  .slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
</style>
