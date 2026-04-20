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
  import { ref } from 'vue'

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

  withDefaults(defineProps<Props>(), {
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
  @use '../../styles/variables.scss' as v;

  .sl-input {
    position: relative;
    display: inline-flex;
    width: 100%;

    &__inner,
    &__textarea {
      width: 100%;
      padding: 8px 12px;
      font-size: v.$font-size-sm;
      color: v.$text-primary;
      background: v.$bg-primary;
      border: 1px solid v.$border-color-base;
      border-radius: v.$border-radius-sm;
      outline: none;
      transition: all v.$transition-base ease;

      &::placeholder {
        color: v.$text-disabled;
      }

      &:hover:not(:disabled) {
        border-color: v.$primary-color;
      }

      &:focus {
        border-color: v.$primary-color;
        box-shadow: 0 0 0 2px v.$glow-primary;
      }
    }

    &__textarea {
      resize: vertical;
      min-height: 60px;
    }

    &.is-focused {
      .sl-input__inner,
      .sl-input__textarea {
        border-color: v.$primary-color;
      }
    }

    &.is-disabled {
      .sl-input__inner,
      .sl-input__textarea {
        background: v.$bg-secondary;
        border-color: v.$border-color-light;
        color: v.$text-disabled;
        cursor: not-allowed;
      }
    }

    &__count {
      position: absolute;
      right: 8px;
      bottom: 4px;
      font-size: v.$font-size-xs;
      color: v.$text-tertiary;
    }
  }
</style>
