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

  withDefaults(defineProps<Props>(), {
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
    color: #606266;

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
      background: #ffffff;
      border: 1px solid #dcdfe6;
      border-radius: 2px;
      transition: all 0.3s ease;
      position: relative;

      &::after {
        content: '';
        display: none;
        position: absolute;
        left: 5px;
        top: 2px;
        width: 4px;
        height: 8px;
        border: solid #ffffff;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }

    &__label {
      color: #606266;
    }

    &.is-checked {
      .sl-checkbox__inner {
        background: #1890ff;
        border-color: #1890ff;

        &::after {
          display: block;
        }
      }

      .sl-checkbox__label {
        color: #1890ff;
      }
    }

    &.is-disabled {
      cursor: not-allowed;

      .sl-checkbox__inner {
        background: #f5f7fa;
        border-color: #e4e7ed;
      }

      .sl-checkbox__label {
        color: #c0c4cc;
      }
    }

    &:hover:not(.is-disabled) {
      .sl-checkbox__inner {
        border-color: #1890ff;
      }
    }
  }
</style>
