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
        <div v-if="!options.length" class="sl-select__empty">暂无数据</div>
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
    const option = props.options.find((o) => o.value === props.modelValue)
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
      font-size: 14px;
      color: #fff;
      background: #1e2447;
      border: 1px solid #252b4e;
      border-radius: 4px;
      outline: none;
      cursor: pointer;
      transition: all 0.3s ease;

      &::placeholder {
        color: #6b7194;
      }

      &:hover:not(:disabled) {
        border-color: #00d4ff;
      }
    }

    &__arrow {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7194;
      transition: transform 0.3s ease;

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
        border-color: #00d4ff;
        box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
      }
    }

    &.is-disabled {
      .sl-select__inner {
        opacity: 0.5;
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
      background: #151b3d;
      border: 1px solid #252b4e;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 100;
    }

    &__option {
      padding: 8px 12px;
      font-size: 14px;
      color: #b4b9d4;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(0, 212, 255, 0.1);
        color: #00d4ff;
      }

      &.is-selected {
        color: #00d4ff;
        background: rgba(0, 212, 255, 0.1);
      }
    }

    &__empty {
      padding: 8px 12px;
      font-size: 14px;
      color: #6b7194;
      text-align: center;
    }
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.2s ease;
  }

  .slide-enter-from,
  .slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
</style>
