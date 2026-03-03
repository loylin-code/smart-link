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
      font-size: 14px;
      color: #fff;
      background: #1e2447;
      border: 1px solid #252b4e;
      border-radius: 4px;
      outline: none;
      transition: all 0.3s ease;

      &::placeholder {
        color: #6b7194;
      }

      &:hover:not(:disabled) {
        border-color: #00d4ff;
      }

      &:focus {
        border-color: #00d4ff;
        box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
      }
    }

    &__textarea {
      resize: vertical;
      min-height: 60px;
    }

    &.is-focused {
      .sl-input__inner,
      .sl-input__textarea {
        border-color: #00d4ff;
      }
    }

    &.is-disabled {
      .sl-input__inner,
      .sl-input__textarea {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    &__count {
      position: absolute;
      right: 8px;
      bottom: 4px;
      font-size: 12px;
      color: #6b7194;
    }
  }
</style>
