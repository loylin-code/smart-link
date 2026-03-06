<template>
  <div class="sl-input" :class="{ 'is-disabled': disabled, 'is-focused': isFocused }">
    <input
      v-if="type !== 'textarea'"
      class="sl-input__inner"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <textarea
      v-else
      class="sl-input__textarea"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :rows="rows"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    ></textarea>
    <span v-if="showCount && maxlength" class="sl-input__count">
      {{ modelValue?.length || 0 }} / {{ maxlength }}
    </span>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  interface Props {
    modelValue?: string | number
    type?: 'text' | 'password' | 'textarea' | 'number'
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    maxlength?: number
    showCount?: boolean
    rows?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    placeholder: '',
    disabled: false,
    readonly: false,
    showCount: false,
    rows: 3
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    input: [value: string]
    focus: [event: FocusEvent]
    blur: [event: FocusEvent]
  }>()

  const isFocused = ref(false)

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement
    const value = target.value
    emit('update:modelValue', value)
    emit('input', value)
  }

  const handleFocus = (event: FocusEvent) => {
    isFocused.value = true
    emit('focus', event)
  }

  const handleBlur = (event: FocusEvent) => {
    isFocused.value = false
    emit('blur', event)
  }
</script>

<style scoped lang="scss">
  .sl-input {
    position: relative;
    display: inline-flex;
    width: 100%;

    &__inner,
    &__textarea {
      width: 100%;
      padding: 8px 12px;
      font-size: $font-size-sm;
      color: $text-primary;
      background: $bg-primary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-sm;
      outline: none;
      transition: all $transition-base ease;

      &::placeholder {
        color: $text-disabled;
      }

      &:hover:not(:disabled) {
        border-color: $primary-color;
      }

      &:focus {
        border-color: $primary-color;
        box-shadow: 0 0 0 2px $glow-primary;
      }
    }

    &__textarea {
      resize: vertical;
      min-height: 60px;
    }

    &.is-focused {
      .sl-input__inner,
      .sl-input__textarea {
        border-color: $primary-color;
      }
    }

    &.is-disabled {
      .sl-input__inner,
      .sl-input__textarea {
        background: $bg-secondary;
        border-color: $border-color-light;
        color: $text-disabled;
        cursor: not-allowed;
      }
    }

    &__count {
      position: absolute;
      right: 8px;
      bottom: 4px;
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }
</style>
