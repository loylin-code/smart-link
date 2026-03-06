<template>
  <button
    class="sl-switch"
    :class="{ 'is-checked': modelValue, 'is-disabled': disabled }"
    :disabled="disabled"
    @click="handleClick"
  >
    <span class="sl-switch__core">
      <span class="sl-switch__button"></span>
    </span>
  </button>
</template>

<script setup lang="ts">
  interface Props {
    modelValue?: boolean
    disabled?: boolean
    size?: 'small' | 'medium' | 'large'
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    disabled: false,
    size: 'medium'
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    change: [value: boolean]
  }>()

  const handleClick = () => {
    if (props.disabled) return
    emit('update:modelValue', !props.modelValue)
    emit('change', !props.modelValue)
  }
</script>

<style scoped lang="scss">
  @use '../../../styles/variables.scss' as v;

  .sl-switch {
    display: inline-flex;
    align-items: center;
    position: relative;
    font-size: 14px;
    line-height: 20px;
    height: 22px;
    vertical-align: middle;
    border: none;
    outline: none;
    background: transparent;
    cursor: pointer;

    &__core {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 22px;
      background: v.$border-color-base;
      border-radius: 11px;
      transition: background v.$transition-base ease;
    }

    &__button {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 18px;
      height: 18px;
      background: v.$bg-primary;
      border-radius: 50%;
      transition: transform v.$transition-base ease;
      box-shadow: v.$shadow-sm;
    }

    &.is-checked {
      .sl-switch__core {
        background: v.$primary-color;
      }

      .sl-switch__button {
        transform: translateX(22px);
      }
    }

    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;

      .sl-switch__core {
        background: v.$text-disabled;
      }
    }
  }
</style>
