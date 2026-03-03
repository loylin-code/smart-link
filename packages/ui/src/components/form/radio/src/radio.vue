<template>
  <label class="sl-radio" :class="{ 'is-disabled': disabled, 'is-checked': modelValue === value }">
    <span class="sl-radio__input">
      <input
        type="radio"
        :name="name"
        :checked="modelValue === value"
        :disabled="disabled"
        @change="handleChange"
      />
      <span class="sl-radio__inner"></span>
    </span>
    <span v-if="$slots.default" class="sl-radio__label">
      <slot></slot>
    </span>
  </label>
</template>

<script setup lang="ts">
  interface Props {
    modelValue?: string | number
    value?: string | number
    name?: string
    disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    disabled: false
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string | number]
    change: [value: string | number]
  }>()

  const handleChange = () => {
    emit('update:modelValue', props.value)
    emit('change', props.value)
  }
</script>

<style scoped lang="scss">
  .sl-radio {
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
      border-radius: 50%;
      transition: all 0.3s ease;
      position: relative;

      &::after {
        content: '';
        display: none;
        position: absolute;
        left: 50%;
        top: 50%;
        width: 6px;
        height: 6px;
        background: #ffffff;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }
    }

    &__label {
      color: #606266;
    }

    &.is-checked {
      .sl-radio__inner {
        border-color: #1890ff;
        background: #ffffff;

        &::after {
          display: block;
          background: #1890ff;
        }
      }

      .sl-radio__label {
        color: #1890ff;
      }
    }

    &.is-disabled {
      cursor: not-allowed;

      .sl-radio__inner {
        background: #f5f7fa;
        border-color: #e4e7ed;
      }

      .sl-radio__label {
        color: #c0c4cc;
      }
    }

    &:hover:not(.is-disabled) {
      .sl-radio__inner {
        border-color: #1890ff;
      }
    }
  }
</style>
