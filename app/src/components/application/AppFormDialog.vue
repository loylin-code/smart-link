<template>
  <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
    <div class="dialog-container">
      <!-- Header -->
      <div class="dialog-header">
        <h2 class="dialog-title">
          {{ isEdit ? t('application.editApp') : t('application.createApp') }}
        </h2>
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
            <h3 class="section-title">{{ t('application.form.basicInfo') }}</h3>

            <div class="form-group">
              <label class="form-label required">{{ t('application.form.name') }}</label>
              <input
                v-model="formData.name"
                type="text"
                class="form-input"
                :placeholder="t('application.form.namePlaceholder')"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('application.form.description') }}</label>
              <textarea
                v-model="formData.description"
                class="form-textarea"
                :placeholder="t('application.form.descriptionPlaceholder')"
                rows="3"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ t('application.form.type') }}</label>
                <select v-model="formData.type" class="form-select">
                  <option value="workflow">{{ t('application.type.workflow') }}</option>
                  <option value="dashboard">{{ t('application.type.dashboard') }}</option>
                  <option value="form">{{ t('application.type.form') }}</option>
                  <option value="chart">{{ t('application.type.chart') }}</option>
                  <option value="custom">{{ t('application.type.custom') }}</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">{{ t('application.form.icon') }}</label>
                <input v-model="formData.icon" type="text" class="form-input" placeholder="app" />
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="dialog-footer">
        <button type="button" class="btn btn-secondary" @click="handleClose">
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="loading || !formData.name"
          @click="handleSubmit"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ isEdit ? t('common.update') : t('common.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { Application } from '@/types'

  interface Props {
    visible: boolean
    app?: Application | null
  }

  interface AppFormData {
    name: string
    description: string
    type: string
    icon: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: AppFormData): void
    (e: 'close'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const { t } = useI18n()

  // Form state
  const loading = ref(false)

  // Form data
  const formData = ref({
    name: '',
    description: '',
    type: 'custom' as 'workflow' | 'dashboard' | 'form' | 'chart' | 'custom',
    icon: 'app'
  })

  // Computed
  const isEdit = computed(() => !!props.app)

  // Watch for app prop changes
  watch(
    () => props.app,
    (newApp) => {
      if (newApp) {
        formData.value = {
          name: newApp.name,
          description: newApp.description || '',
          type: newApp.type || 'custom',
          icon: newApp.icon || 'app'
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
      description: '',
      type: 'custom',
      icon: 'app'
    }
  }

  function handleClose() {
    emit('update:visible', false)
    emit('close')
    resetForm()
  }

  async function handleSubmit() {
    if (!formData.value.name) return

    loading.value = true

    try {
      emit('submit', {
        name: formData.value.name,
        description: formData.value.description,
        type: formData.value.type,
        icon: formData.value.icon
      })
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
    max-width: 500px;
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
    font-size: $font-size-md;
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
      color: $danger-color;
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
