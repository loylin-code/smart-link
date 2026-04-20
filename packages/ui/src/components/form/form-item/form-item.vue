<template>
  <div class="sl-form-item" :class="{ 'is-required': required, 'is-error': error }">
    <label v-if="label" class="sl-form-item__label" :style="labelStyle">
      {{ label }}
    </label>
    <div class="sl-form-item__content">
      <slot></slot>
      <div v-if="error" class="sl-form-item__error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue'

  interface Props {
    label?: string
    prop?: string
    required?: boolean
    rules?: any[]
  }

  withDefaults(defineProps<Props>(), {
    required: false
  })

  const form: any = inject('form', {})

  const labelStyle = computed(() => ({
    width: form.labelWidth || '100px'
  }))

  const error = computed(() => '')
</script>

<style scoped lang="scss">
  .sl-form-item {
    display: flex;
    margin-bottom: 22px;

    &__label {
      flex-shrink: 0;
      padding-right: 12px;
      font-size: 14px;
      color: #b4b9d4;
      text-align: right;
      line-height: 32px;
    }

    &__content {
      flex: 1;
      position: relative;
    }

    &__error {
      position: absolute;
      top: 100%;
      left: 0;
      font-size: 12px;
      color: #ef4444;
      padding-top: 4px;
    }

    &.is-required {
      .sl-form-item__label::before {
        content: '*';
        color: #ef4444;
        margin-right: 4px;
      }
    }

    &.is-error {
      :deep(.sl-input__inner) {
        border-color: #ef4444;
      }
    }
  }
</style>
