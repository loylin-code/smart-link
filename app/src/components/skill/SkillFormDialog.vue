<template>
  <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
    <div class="dialog-container">
      <!-- Header -->
      <div class="dialog-header">
        <h2 class="dialog-title">{{ isEdit ? t('skills.editSkill') : t('skills.createSkill') }}</h2>
        <button class="close-btn" @click="handleClose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form Content -->
      <div class="dialog-content">
        <form @submit.prevent="handleSubmit">
          <!-- Basic Info -->
          <div class="form-section">
            <h3 class="section-title">{{ t('skills.form.basicInfo') }}</h3>

            <div class="form-group">
              <label class="form-label required">{{ t('skills.form.name') }}</label>
              <input
                v-model="formData.name"
                type="text"
                class="form-input"
                :placeholder="t('skills.form.namePlaceholder')"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('skills.form.displayName') }}</label>
              <input
                v-model="formData.displayName"
                type="text"
                class="form-input"
                :placeholder="t('skills.form.displayNamePlaceholder')"
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('skills.form.description') }}</label>
              <textarea
                v-model="formData.description"
                class="form-textarea"
                :placeholder="t('skills.form.descriptionPlaceholder')"
                rows="3"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">{{ t('skills.form.type') }}</label>
                <select v-model="formData.type" class="form-select" required>
                  <option value="builtin">{{ t('skills.form.typeBuiltin') }}</option>
                  <option value="custom">{{ t('skills.form.typeCustom') }}</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">{{ t('skills.form.category') }}</label>
                <select v-model="formData.category" class="form-select">
                  <option value="analytics">{{ t('skills.category.analytics') }}</option>
                  <option value="processing">{{ t('skills.category.processing') }}</option>
                  <option value="invoker">{{ t('skills.category.invoker') }}</option>
                  <option value="transform">{{ t('skills.category.transform') }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Configuration -->
          <div class="form-section">
            <h3 class="section-title">{{ t('skills.form.configuration') }}</h3>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ t('skills.form.model') }}</label>
                <input
                  v-model="formData.config.model"
                  type="text"
                  class="form-input"
                  placeholder="claude-sonnet-4.5"
                />
              </div>

              <div class="form-group">
                <label class="form-label">{{ t('skills.form.temperature') }}</label>
                <input
                  v-model.number="formData.config.temperature"
                  type="number"
                  class="form-input"
                  min="0"
                  max="2"
                  step="0.1"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ t('skills.form.maxTokens') }}</label>
                <input
                  v-model.number="formData.config.maxTokens"
                  type="number"
                  class="form-input"
                  min="1"
                  max="128000"
                />
              </div>

              <div class="form-group">
                <label class="form-label">{{ t('skills.form.riskLevel') }}</label>
                <select v-model="formData.riskLevel" class="form-select">
                  <option value="low">{{ t('skills.risk.low') }}</option>
                  <option value="medium">{{ t('skills.risk.medium') }}</option>
                  <option value="high">{{ t('skills.risk.high') }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="dialog-footer">
        <button type="button" class="btn btn-secondary" @click="handleClose">
          {{ t('common.cancel') }}
        </button>
        <button type="button" class="btn btn-primary" :disabled="loading" @click="handleSubmit">
          <span v-if="loading" class="loading-spinner" />
          {{ isEdit ? t('common.update') : t('common.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { Skill } from '@/types'

  interface Props {
    visible: boolean
    skill?: Skill | null
  }

  interface SkillFormData {
    name: string
    displayName: string
    description: string
    type: 'builtin' | 'custom'
    category: 'analytics' | 'processing' | 'invoker' | 'transform'
    riskLevel: 'low' | 'medium' | 'high'
    config: {
      model: string
      temperature: number
      maxTokens: number
    }
  }

  interface SkillSubmitData {
    name: string
    description: string
    type: 'builtin' | 'custom'
    config: {
      displayName: string
      category: 'analytics' | 'processing' | 'invoker' | 'transform'
      riskLevel: 'low' | 'medium' | 'high'
      model: string
      temperature: number
      maxTokens: number
    }
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: SkillSubmitData): void
    (e: 'close'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const { t } = useI18n()

  // Form state
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Form data
  const formData = ref<SkillFormData>({
    name: '',
    displayName: '',
    description: '',
    type: 'custom' as 'builtin' | 'custom',
    category: 'processing' as 'analytics' | 'processing' | 'invoker' | 'transform',
    riskLevel: 'low' as 'low' | 'medium' | 'high',
    config: {
      model: '',
      temperature: 0.7,
      maxTokens: 4096
    }
  })

  // Computed
  const isEdit = computed(() => !!props.skill)

  // Watch for skill prop changes to populate form
  watch(
    () => props.skill,
    (newSkill) => {
      if (newSkill) {
        formData.value = {
          name: newSkill.name,
          displayName: newSkill.displayName,
          description: newSkill.description,
          type: (newSkill as any).type || 'custom',
          category: newSkill.category,
          riskLevel: newSkill.riskLevel,
          config: {
            model: newSkill.config?.model || '',
            temperature: newSkill.config?.temperature ?? 0.7,
            maxTokens: newSkill.config?.maxTokens ?? 4096
          }
        }
      } else {
        resetForm()
      }
    },
    { immediate: true }
  )

  // Methods
  function resetForm() {
    formData.value = {
      name: '',
      displayName: '',
      description: '',
      type: 'custom',
      category: 'processing',
      riskLevel: 'low',
      config: {
        model: '',
        temperature: 0.7,
        maxTokens: 4096
      }
    }
    error.value = null
  }

  function handleClose() {
    emit('update:visible', false)
    emit('close')
    resetForm()
  }

  async function handleSubmit() {
    if (!formData.value.name) {
      error.value = t('skills.form.nameRequired')
      return
    }

    loading.value = true
    error.value = null

    try {
      emit('submit', {
        name: formData.value.name,
        description: formData.value.description,
        type: formData.value.type,
        config: {
          displayName: formData.value.displayName,
          category: formData.value.category,
          riskLevel: formData.value.riskLevel,
          model: formData.value.config.model,
          temperature: formData.value.config.temperature,
          maxTokens: formData.value.config.maxTokens
        }
      })
    } catch (err: unknown) {
      const errObj = err as { message?: string }
      error.value = errObj.message || t('common.error')
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .dialog-container {
    background: $bg-primary;
    border-radius: $border-radius-lg;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-lg;
    border-bottom: 1px solid $border-color-light;
  }

  .dialog-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }

  .close-btn {
    background: transparent;
    border: none;
    padding: $spacing-xs;
    cursor: pointer;
    color: $text-tertiary;
    transition: color $transition-base;

    &:hover {
      color: $text-primary;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-lg;
  }

  .form-section {
    margin-bottom: $spacing-xl;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: $text-primary;
    margin: 0 0 $spacing-md 0;
  }

  .form-group {
    margin-bottom: $spacing-md;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-md;
  }

  .form-label {
    display: block;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    margin-bottom: $spacing-xs;

    &.required::after {
      content: ' *';
      color: $error;
    }
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-sm;
    transition: border-color $transition-base;

    &:focus {
      border-color: $primary-color;
      outline: none;
    }

    &::placeholder {
      color: $text-tertiary;
    }
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .form-select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7184' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right $spacing-sm center;
    padding-right: $spacing-xl;
  }

  .error-message {
    padding: $spacing-sm $spacing-md;
    background: rgba($error, 0.1);
    border: 1px solid $error;
    border-radius: $border-radius-md;
    color: $error;
    font-size: $font-size-sm;
    margin-top: $spacing-md;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-md;
    padding: $spacing-lg;
    border-top: 1px solid $border-color-light;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-lg;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .btn-primary {
    background: $primary-color;
    border: 1px solid $primary-color;
    color: #fff;

    &:hover:not(:disabled) {
      background: $primary-light;
      border-color: $primary-light;
    }
  }

  .btn-secondary {
    background: transparent;
    border: 1px solid $border-color-base;
    color: $text-secondary;

    &:hover:not(:disabled) {
      border-color: $text-secondary;
      color: $text-primary;
    }
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
