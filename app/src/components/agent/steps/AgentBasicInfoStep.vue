<template>
  <div class="agent-basic-info-step">
    <h2 class="step-title">{{ t('agent.wizard.steps.basic') }}</h2>
    <p class="step-desc">{{ t('agent.wizard.basicDesc') }}</p>

    <div class="form-group">
      <label class="form-label">{{ t('agent.form.name') }} *</label>
      <input
        v-model="localData.name"
        type="text"
        class="form-input"
        :placeholder="t('agent.form.namePlaceholder')"
      />
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('agent.form.code') }} *</label>
      <input
        v-model="localData.code"
        type="text"
        class="form-input"
        :placeholder="t('agent.form.codePlaceholder')"
      />
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('agent.form.description') }}</label>
      <textarea
        v-model="localData.description"
        class="form-textarea"
        rows="3"
        :placeholder="t('agent.form.descriptionPlaceholder')"
      />
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('agent.form.avatar') }}</label>
      <input
        v-model="localData.avatar"
        type="text"
        class="form-input"
        :placeholder="t('agent.form.avatarPlaceholder')"
      />
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('agent.form.tags') }}</label>
      <input
        v-model="tagsInput"
        type="text"
        class="form-input"
        :placeholder="t('agent.form.tagsPlaceholder')"
      />
    </div>

    <div class="form-actions">
      <button class="btn btn-secondary" @click="$emit('cancel')">
        {{ t('common.cancel') }}
      </button>
      <button
        class="btn btn-primary"
        :disabled="!localData.name || !localData.code"
        @click="$emit('next')"
      >
        {{ t('common.next') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { useI18n } from 'vue-i18n'

  const props = defineProps<{
    modelValue: any
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: any]
    next: []
    cancel: []
  }>()

  const { t } = useI18n()

  const localData = ref({ ...props.modelValue })

  const tagsInput = computed({
    get: () => localData.value.tags?.join(', ') || '',
    set: (val: string) => {
      localData.value.tags = val
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    }
  })

  watch(
    localData,
    (val) => {
      emit('update:modelValue', val)
    },
    { deep: true }
  )
</script>

<style scoped lang="scss">
  .agent-basic-info-step {
    max-width: 600px;
    margin: 0 auto;
  }

  .step-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0 0 $spacing-xs 0;
  }

  .step-desc {
    font-size: $font-size-sm;
    color: $text-tertiary;
    margin: 0 0 $spacing-xl 0;
  }

  .form-group {
    margin-bottom: $spacing-lg;
  }

  .form-label {
    display: block;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }

  .form-input {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    color: $text-primary;
    background: $bg-primary;
    transition: all $transition-base ease;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
    }
  }

  .form-textarea {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    color: $text-primary;
    background: $bg-primary;
    resize: vertical;
    transition: all $transition-base ease;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-md;
    margin-top: $spacing-xl;
  }

  .btn {
    padding: $spacing-sm $spacing-lg;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .btn-secondary {
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    color: $text-secondary;

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .btn-primary {
    background: $primary-color;
    border: 1px solid $primary-color;
    color: #fff;

    &:hover:not(:disabled) {
      background: $primary-light;
    }
  }
</style>
