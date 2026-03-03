<template>
  <label class="sl-checkbox" :class="{ 'is-disabled': disabled, 'is-checked': modelValue }">
    <span class="sl-checkbox__input">
      <input type="checkbox" :checked="modelValue" :disabled="disabled" @change="handleChange" />
      <span class="sl-checkbox__inner"></span>
    </span>
    <span v-if="$slots.default" class="sl-checkbox__label">
      <slot></slot>
    </span>
  </label>
</template>

<script setup lang="ts">
  interface Props {
    modelValue?: boolean
    disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    disabled: false
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    change: [value: boolean]
  }>()

  const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.checked)
    emit('change', target.checked)
  }
</script>

<style scoped lang="scss">
  .sl-checkbox {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #b4b9d4;

    &__input {
      position: relative;
      width: 16px;
      height: 16px;

      input {
        position: absolute;
        opacity: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
      }
    }

    &__inner {
      display: block;
      width: 16px;
      height: 16px;
      background: #1e2447;
      border: 1px solid #252b4e;
      border-radius: 4px;
      transition: all 0.3s ease;

      &::after {
        content: '';
        display: none;
        position: absolute;
        left: 5px;
        top: 2px;
        width: 4px;
        height: 8px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }

    &.is-checked {
      .sl-checkbox__inner {
        background: #00d4ff;
        border-color: #00d4ff;

        &::after {
          display: block;
        }
      }
    }

    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover:not(.is-disabled) {
      .sl-checkbox__inner {
        border-color: #00d4ff;
      }
    }
  }
</style>
