<template>
  <div class="app-create-wizard" :class="{ 'full-width': currentStep === 'design' }">
    <!-- Header with back button -->
    <div class="wizard-header">
      <button class="back-btn" @click="handleBack">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M19 12H5M12 19l-7-7 7-7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ t('common.back') }}</span>
      </button>
      <h1 class="wizard-title">{{ pageTitle }}</h1>
    </div>

    <!-- Step Indicator -->
    <div class="wizard-steps">
      <div
        v-for="(step, index) in steps"
        :key="step.key"
        class="step-item"
        :class="{ active: currentStep === step.key, completed: isStepCompleted(step.key) }"
      >
        <div class="step-number">
          <svg v-if="isStepCompleted(step.key)" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12l5 5L20 7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span v-else>{{ step.order }}</span>
        </div>
        <div class="step-label">{{ t(`application.wizard.steps.${step.key}`) }}</div>
        <div v-if="index < steps.length - 1" class="step-line"></div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="wizard-content">
      <!-- Step 1: Basic Info -->
      <div v-show="currentStep === 'basic'" class="step-panel fade-in">
        <h2 class="step-title">{{ t('application.wizard.basic.title') }}</h2>
        <form @submit.prevent="nextStep" class="step-form">
          <div class="form-item">
            <label class="form-label required">{{ t('application.wizard.basic.name') }}</label>
            <input
              v-model="formData.name"
              :placeholder="t('application.wizard.basic.namePlaceholder')"
              :maxlength="50"
              required
              class="form-input"
              :class="{ error: errors.name }"
            />
            <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
            <span v-else class="char-count">{{ formData.name.length }}/50</span>
          </div>

          <div class="form-item">
            <label class="form-label">{{ t('application.wizard.basic.description') }}</label>
            <textarea
              v-model="formData.description"
              :placeholder="t('application.wizard.basic.descriptionPlaceholder')"
              :maxlength="200"
              rows="3"
              class="form-textarea"
            ></textarea>
            <span class="char-count">{{ formData.description.length }}/200</span>
          </div>

          <div class="form-item">
            <label class="form-label">{{ t('application.wizard.basic.icon') }}</label>
            <div class="icon-selector">
              <div
                v-for="icon in availableIcons"
                :key="icon.value"
                class="icon-item"
                :class="{ selected: formData.icon === icon.value }"
                @click="formData.icon = icon.value"
                :title="t(`application.wizard.icons.${icon.label}`)"
              >
                <span class="icon-preview">{{ icon.emoji }}</span>
              </div>
            </div>
          </div>

          <div class="form-item">
            <label class="form-label">{{ t('application.wizard.basic.tags') }}</label>
            <div class="tags-container">
              <span v-for="(tag, index) in formData.tags" :key="index" class="tag-item">
                {{ tag }}
                <button type="button" class="tag-remove" @click="removeTag(index)">×</button>
              </span>
              <input
                v-model="tagInput"
                :placeholder="
                  formData.tags.length === 0 ? t('application.wizard.basic.tagsPlaceholder') : ''
                "
                class="tag-input"
                @keydown.enter.prevent="addTag"
                @keydown.backspace="removeLastTag"
              />
            </div>
          </div>
        </form>
      </div>

      <!-- Step 2: Type/Template Selection -->
      <div v-show="currentStep === 'type'" class="step-panel fade-in">
        <h2 class="step-title">{{ t('application.wizard.type.title') }}</h2>

        <div class="scrollable-content">
          <div class="section-label">{{ t('application.wizard.type.selectType') }}</div>
          <div class="type-selector">
            <div
              v-for="type in appTypes"
              :key="type.value"
              class="type-card"
              :class="{ selected: formData.type === type.value }"
              @click="selectType(type.value)"
            >
              <div class="type-icon">{{ type.icon }}</div>
              <div class="type-name">{{ t(`application.types.${type.value}`) }}</div>
              <div class="type-desc">
                {{ t(`application.wizard.type.types.${type.value}Desc`) }}
              </div>
            </div>
          </div>
          <span v-if="errors.type" class="error-msg block">{{ errors.type }}</span>

          <div class="section-divider">
            <span>{{ t('application.wizard.type.orTemplate') }}</span>
          </div>

          <div class="template-list">
            <div
              v-for="template in templates"
              :key="template.id"
              class="template-card"
              :class="{ selected: selectedTemplate === template.id }"
              @click="selectTemplate(template.id)"
            >
              <div class="template-icon">{{ template.icon }}</div>
              <div class="template-info">
                <div class="template-name">
                  {{ t(`application.wizard.type.templates.${template.id}`) }}
                </div>
                <div class="template-desc">
                  {{ t(`application.wizard.type.templates.${template.id}Desc`) }}
                </div>
              </div>
              <button type="button" class="template-use-btn">
                {{ t('application.create.useTemplate') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Page Design -->
      <div v-show="currentStep === 'design'" class="step-panel fade-in">
        <h2 class="step-title">{{ t('application.wizard.design.title') }}</h2>
        <div class="design-options">
          <div
            class="option-card"
            :class="{ selected: designMode === 'ai' }"
            @click="selectDesignMode('ai')"
          >
            <div class="option-icon">🤖</div>
            <div class="option-title">{{ t('application.wizard.design.aiDesign') }}</div>
            <div class="option-desc">{{ t('application.wizard.design.aiDesignDesc') }}</div>
          </div>
          <div
            class="option-card"
            :class="{ selected: designMode === 'manual' }"
            @click="selectDesignMode('manual')"
          >
            <div class="option-icon">✏️</div>
            <div class="option-title">{{ t('application.wizard.design.manualDesign') }}</div>
            <div class="option-desc">{{ t('application.wizard.design.manualDesignDesc') }}</div>
          </div>
          <div
            class="option-card"
            :class="{ selected: designMode === 'import' }"
            @click="selectDesignMode('import')"
          >
            <div class="option-icon">📄</div>
            <div class="option-title">{{ t('application.wizard.design.importSchema') }}</div>
            <div class="option-desc">{{ t('application.wizard.design.importSchemaDesc') }}</div>
          </div>
        </div>

        <div v-if="formData.schema" class="schema-status">
          <span class="status-badge success">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12l5 5L20 7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ t('application.wizard.design.schemaConfigured') }}
          </span>
        </div>
      </div>

      <!-- Step 4: Preview/Publish -->
      <div v-show="currentStep === 'publish'" class="step-panel fade-in">
        <h2 class="step-title">{{ t('application.wizard.publish.title') }}</h2>
        <div class="publish-options">
          <div class="app-summary">
            <div class="summary-header">
              <span class="summary-icon">{{ getIconEmoji(formData.icon) }}</span>
              <h3>{{ formData.name || t('application.wizard.publish.appName') }}</h3>
            </div>
            <div class="summary-details">
              <div class="detail-item">
                <span class="detail-label">{{ t('application.wizard.publish.appType') }}:</span>
                <span class="detail-value">{{ t(`application.types.${formData.type}`) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  >{{ t('application.wizard.publish.appDescription') }}:</span
                >
                <span class="detail-value">{{
                  formData.description || t('application.wizard.publish.noDescription')
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  >{{ t('application.wizard.publish.pageStructure') }}:</span
                >
                <span
                  class="detail-value"
                  :class="{ success: formData.schema, muted: !formData.schema }"
                >
                  {{
                    formData.schema
                      ? t('application.wizard.design.schemaConfigured')
                      : t('application.wizard.design.schemaNotConfigured')
                  }}
                </span>
              </div>
              <div v-if="formData.tags.length > 0" class="detail-item">
                <span class="detail-label">{{ t('application.wizard.basic.tags') }}:</span>
                <div class="detail-tags">
                  <span v-for="tag in formData.tags" :key="tag" class="detail-tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button
              type="button"
              class="btn btn-secondary"
              @click="saveAsDraft"
              :disabled="isProcessing"
            >
              <span v-if="isProcessing && actionType === 'draft'">{{
                t('application.wizard.publish.saving')
              }}</span>
              <span v-else>{{ t('application.wizard.publish.saveDraft') }}</span>
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="publishApp"
              :disabled="isProcessing"
            >
              <span v-if="isProcessing && actionType === 'publish'">{{
                t('application.wizard.publish.publishing')
              }}</span>
              <span v-else>{{ t('application.wizard.publish.publishApp') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="wizard-nav">
      <button
        v-if="!isFirstStep"
        type="button"
        class="btn btn-outline"
        @click="prevStep"
        :disabled="isProcessing"
      >
        {{ t('application.wizard.nav.prev') }}
      </button>
      <button
        v-if="!isFirstStep && !isLastStep"
        type="button"
        class="btn btn-ghost"
        @click="handleCancel"
      >
        {{ t('application.wizard.nav.cancel') }}
      </button>
      <button
        v-if="!isLastStep"
        type="button"
        class="btn btn-primary"
        @click="nextStep"
        :disabled="!canNext || isProcessing"
      >
        {{ t('application.wizard.nav.next') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { applicationApi } from '@/services/application'
  import { AppType, AppStatus, type Application, type PageSchema } from '@/types'

  interface Step {
    key: string
    label: string
    order: number
  }

  interface FormData {
    name: string
    description: string
    type: AppType
    icon: string
    tags: string[]
    schema: PageSchema | null
    status: AppStatus
  }

  interface FormErrors {
    name: string
    type: string
  }

  interface IconData {
    value: string
    label: string
    emoji: string
  }

  interface TemplateData {
    id: string
    icon: string
    type: AppType
  }

  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()

  const steps: Step[] = [
    { key: 'basic', label: '基本信息', order: 1 },
    { key: 'type', label: '类型选择', order: 2 },
    { key: 'design', label: '页面设计', order: 3 },
    { key: 'publish', label: '保存发布', order: 4 }
  ]

  // Edit mode state
  const appId = ref<string | null>(null)
  const isEditMode = computed(() => !!appId.value)
  const isLoading = ref<boolean>(false)
  const originalStatus = ref<AppStatus>(AppStatus.DRAFT)

  // Page title based on mode
  const pageTitle = computed(() => {
    if (isEditMode.value) {
      return t('application.wizard.editTitle', {
        name: formData.value.name || t('application.wizard.title')
      })
    }
    return t('application.wizard.title')
  })

  const currentStep = ref<string>('basic')
  const isProcessing = ref<boolean>(false)
  const actionType = ref<'draft' | 'publish' | null>(null)
  const designMode = ref<'ai' | 'manual' | 'import' | null>(null)
  const selectedTemplate = ref<string | null>(null)
  const tagInput = ref<string>('')

  const formData = ref<FormData>({
    name: '',
    description: '',
    type: AppType.CUSTOM,
    icon: 'app',
    tags: [],
    schema: null,
    status: AppStatus.DRAFT
  })

  const errors = ref<FormErrors>({
    name: '',
    type: ''
  })

  const appTypes = [
    { value: AppType.WORKFLOW, icon: '📋' },
    { value: AppType.DASHBOARD, icon: '📊' },
    { value: AppType.FORM, icon: '📝' },
    { value: AppType.CHART, icon: '📈' },
    { value: AppType.CUSTOM, icon: '⚙️' }
  ]

  const templates: TemplateData[] = [
    { id: 'customerService', icon: '🤖', type: AppType.WORKFLOW },
    { id: 'dataAnalysis', icon: '📊', type: AppType.DASHBOARD },
    { id: 'survey', icon: '📝', type: AppType.FORM }
  ]

  const availableIcons: IconData[] = [
    { value: 'app', label: 'app', emoji: '📱' },
    { value: 'dashboard', label: 'dashboard', emoji: '📊' },
    { value: 'chart', label: 'chart', emoji: '📈' },
    { value: 'form', label: 'form', emoji: '📝' },
    { value: 'table', label: 'table', emoji: '📋' },
    { value: 'settings', label: 'settings', emoji: '⚙️' },
    { value: 'user', label: 'user', emoji: '👤' },
    { value: 'team', label: 'team', emoji: '👥' },
    { value: 'document', label: 'document', emoji: '📄' },
    { value: 'folder', label: 'folder', emoji: '📁' },
    { value: 'calendar', label: 'calendar', emoji: '📅' },
    { value: 'task', label: 'task', emoji: '✅' },
    { value: 'message', label: 'message', emoji: '💬' },
    { value: 'notification', label: 'notification', emoji: '🔔' },
    { value: 'analytics', label: 'analytics', emoji: '📉' },
    { value: 'workflow', label: 'workflow', emoji: '🔄' },
    { value: 'customerService', label: 'customerService', emoji: '🎧' }
  ]

  const isFirstStep = computed(() => currentStep.value === 'basic')
  const isLastStep = computed(() => currentStep.value === 'publish')

  const canNext = computed(() => {
    if (currentStep.value === 'basic') {
      return formData.value.name.trim() !== '' && formData.value.name.length <= 50
    }
    if (currentStep.value === 'type') {
      return formData.value.type !== undefined
    }
    return true
  })

  function isStepCompleted(key: string): boolean {
    const stepIndex = steps.findIndex((s) => s.key === key)
    const currentIndex = steps.findIndex((s) => s.key === currentStep.value)
    return stepIndex < currentIndex
  }

  function validateCurrentStep(): boolean {
    errors.value = { name: '', type: '' }

    if (currentStep.value === 'basic') {
      if (!formData.value.name.trim()) {
        errors.value.name = t('application.wizard.basic.nameRequired')
        return false
      }
      if (formData.value.name.length > 50) {
        errors.value.name = t('application.wizard.basic.nameMaxLength')
        return false
      }
    }

    if (currentStep.value === 'type') {
      if (!formData.value.type) {
        errors.value.type = t('application.create.selectType')
        return false
      }
    }

    return true
  }

  function nextStep() {
    if (!validateCurrentStep()) {
      return
    }

    const currentIndex = steps.findIndex((s) => s.key === currentStep.value)
    if (currentIndex < steps.length - 1) {
      currentStep.value = steps[currentIndex + 1].key
    }
  }

  function prevStep() {
    const currentIndex = steps.findIndex((s) => s.key === currentStep.value)
    if (currentIndex > 0) {
      currentStep.value = steps[currentIndex - 1].key
    }
  }

  function handleBack() {
    if (isFirstStep) {
      handleCancel()
    } else {
      prevStep()
    }
  }

  function handleCancel() {
    router.push('/app/application/design')
  }

  // Tag management
  function addTag() {
    const tag = tagInput.value.trim()
    if (tag && !formData.value.tags.includes(tag) && formData.value.tags.length < 5) {
      formData.value.tags.push(tag)
      tagInput.value = ''
    }
  }

  function removeTag(index: number) {
    formData.value.tags.splice(index, 1)
  }

  function removeLastTag() {
    if (tagInput.value === '' && formData.value.tags.length > 0) {
      formData.value.tags.pop()
    }
  }

  // Type and template selection
  function selectType(type: AppType) {
    formData.value.type = type
    selectedTemplate.value = null
    errors.value.type = ''
  }

  function selectTemplate(templateId: string) {
    selectedTemplate.value = templateId
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      formData.value.type = template.type
    }
  }

  // Design mode selection
  function selectDesignMode(mode: 'ai' | 'manual' | 'import') {
    designMode.value = mode

    const baseQuery = {
      mode: isEditMode.value ? 'edit' : 'create',
      name: formData.value.name,
      type: formData.value.type,
      icon: formData.value.icon,
      tags: formData.value.tags.join(',')
    }

    if (mode === 'ai') {
      router.push({
        path: isEditMode.value
          ? `/app/application/design/orchestration/${appId.value}`
          : '/app/application/design/orchestration',
        query: {
          ...baseQuery,
          ai: 'true'
        }
      })
    } else if (mode === 'manual') {
      router.push({
        path: isEditMode.value
          ? `/app/application/design/orchestration/${appId.value}`
          : '/app/application/design/orchestration',
        query: baseQuery
      })
    } else if (mode === 'import') {
      importSchema()
    }
  }

  function importSchema() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const schema = JSON.parse(text) as PageSchema
        if (schema && typeof schema === 'object') {
          formData.value.schema = schema
          nextStep()
        } else {
          alert('Invalid Schema file format')
        }
      } catch (err) {
        alert('File parsing failed')
      }
    }
    input.click()
  }

  function getIconEmoji(icon: string): string {
    const iconData = availableIcons.find((i) => i.value === icon)
    return iconData ? iconData.emoji : '📱'
  }

  // Save methods
  async function saveAsDraft() {
    if (isProcessing.value) return

    try {
      isProcessing.value = true
      actionType.value = 'draft'

      const appData = {
        name: formData.value.name,
        description: formData.value.description,
        type: formData.value.type,
        icon: formData.value.icon,
        tags: formData.value.tags,
        schema: formData.value.schema || undefined,
        status: AppStatus.DRAFT
      }

      if (isEditMode.value && appId.value) {
        await applicationApi.updateApplication(appId.value, appData)
      } else {
        await applicationApi.createApplication(appData)
      }

      router.push('/app/application/design')
    } catch (error) {
      console.error('Failed to save draft:', error)
      alert(t('application.wizard.publish.saveFailed'))
    } finally {
      isProcessing.value = false
      actionType.value = null
    }
  }

  async function publishApp() {
    if (isProcessing.value) return

    try {
      isProcessing.value = true
      actionType.value = 'publish'

      const appData = {
        name: formData.value.name,
        description: formData.value.description,
        type: formData.value.type,
        icon: formData.value.icon,
        tags: formData.value.tags,
        schema: formData.value.schema || undefined,
        status: AppStatus.PUBLISHED
      }

      if (isEditMode.value && appId.value) {
        await applicationApi.updateApplication(appId.value, appData)
      } else {
        await applicationApi.createApplication(appData)
      }

      router.push('/app/application/list')
    } catch (error) {
      console.error('Failed to publish app:', error)
      alert(t('application.wizard.publish.publishFailed'))
    } finally {
      isProcessing.value = false
      actionType.value = null
    }
  }

  // Load app data for edit mode
  async function loadAppData(id: string) {
    isLoading.value = true
    try {
      const app = await applicationApi.getApplicationById(id)
      if (app) {
        formData.value = {
          name: app.name,
          description: app.description || '',
          type: app.type,
          icon: app.icon || 'app',
          tags: app.tags || [],
          schema: app.schema || null,
          status: app.status
        }
        originalStatus.value = app.status
      } else {
        // App not found, redirect to design list
        router.push('/app/application/design')
      }
    } catch (error) {
      console.error('Failed to load app:', error)
      router.push('/app/application/design')
    } finally {
      isLoading.value = false
    }
  }

  // Restore state from route query / load app data
  onMounted(async () => {
    // Check if editing an existing app
    const id = route.params.id as string
    if (id) {
      appId.value = id
      await loadAppData(id)
      return
    }

    // Check if returning from orchestration with schema
    const schemaJson = sessionStorage.getItem('temp_schema')
    if (schemaJson) {
      try {
        formData.value.schema = JSON.parse(schemaJson) as PageSchema
        sessionStorage.removeItem('temp_schema')
        // Move to publish step
        currentStep.value = 'publish'
      } catch (e) {
        console.error('Failed to parse schema from session', e)
      }
    }

    // Restore form data from query params (if starting fresh)
    if (route.query.name && !schemaJson) {
      formData.value.name = route.query.name as string
    }
    if (route.query.type && !schemaJson) {
      formData.value.type = route.query.type as AppType
    }
    if (route.query.icon && !schemaJson) {
      formData.value.icon = route.query.icon as string
    }
    if (route.query.tags && !schemaJson) {
      formData.value.tags = (route.query.tags as string).split(',').filter(Boolean)
    }
  })
</script>

<style scoped lang="scss">
  .app-create-wizard {
    max-width: 900px;
    margin: 0 auto;
    padding: $spacing-xl;
    background-color: $bg-primary;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-lg;
    display: flex;
    flex-direction: column;
    height: 100%;

    &.full-width {
      max-width: 100%;
      border-radius: 0;
      box-shadow: none;
      background-color: $bg-secondary;
    }
  }

  // ============================================================
  // Header with back button
  // ============================================================

  .wizard-header {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
    padding-bottom: $spacing-md;
    border-bottom: 1px solid $border-color-lighter;

    .back-btn {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      padding: $spacing-xs $spacing-sm;
      background: transparent;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-sm;
      color: $text-secondary;
      font-size: $font-size-sm;
      cursor: pointer;
      transition: all $transition-base ease;

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover {
        border-color: $primary-color;
        color: $primary-color;
      }
    }

    .wizard-title {
      margin: 0;
      font-size: $font-size-xl;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }

  // ============================================================
  // Steps Progress
  // ============================================================

  .wizard-steps {
    display: flex;
    justify-content: space-between;
    margin-bottom: $spacing-xl;
    position: relative;
    flex-shrink: 0;

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      flex: 1;

      .step-number {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: $bg-tertiary;
        color: $text-tertiary;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: $font-weight-semibold;
        font-size: $font-size-base;
        transition: all $transition-base ease;
        border: 2px solid transparent;

        svg {
          width: 20px;
          height: 20px;
        }
      }

      .step-label {
        margin-top: $spacing-sm;
        font-size: $font-size-sm;
        color: $text-tertiary;
        transition: all $transition-base ease;
        text-align: center;
      }

      .step-line {
        position: absolute;
        top: 20px;
        left: 50%;
        width: 100%;
        height: 2px;
        background-color: $border-color-base;
        z-index: -1;
      }

      &.active {
        .step-number {
          background-color: rgba($primary-color, 0.1);
          color: $primary-color;
          border-color: $primary-color;
        }

        .step-label {
          color: $primary-color;
          font-weight: $font-weight-medium;
        }
      }

      &.completed {
        .step-number {
          background-color: $primary-color;
          color: #fff;
          border-color: $primary-color;
        }

        .step-line {
          background-color: $primary-color;
        }

        .step-label {
          color: $primary-color;
        }
      }
    }
  }

  // ============================================================
  // Content Area
  // ============================================================

  .wizard-content {
    background-color: $bg-secondary;
    border-radius: $border-radius-md;
    padding: $spacing-xl;
    flex: 1;
    overflow-y: auto;
    margin-bottom: $spacing-lg;

    .full-width & {
      background-color: $bg-primary;
    }
  }

  .step-panel {
    .step-title {
      margin-bottom: $spacing-lg;
      color: $text-primary;
      font-size: $font-size-xl;
      font-weight: $font-weight-semibold;
    }
  }

  .fade-in {
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  // Scrollable content for type selection
  .scrollable-content {
    max-height: calc(100vh - 400px);
    overflow-y: auto;
    padding-right: $spacing-sm;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: $bg-tertiary;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: $border-color-dark;
      border-radius: 3px;

      &:hover {
        background: $text-tertiary;
      }
    }
  }

  // ============================================================
  // Form Styles
  // ============================================================

  .step-form {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    .form-label {
      color: $text-secondary;
      font-weight: $font-weight-medium;
      font-size: $font-size-sm;

      &.required::after {
        content: ' *';
        color: $error;
      }
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: $spacing-sm $spacing-md;
      background-color: $bg-primary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-sm;
      color: $text-primary;
      font-size: $font-size-base;
      transition: all $transition-base ease;

      &::placeholder {
        color: $text-tertiary;
      }

      &:focus {
        outline: none;
        border-color: $primary-color;
        box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
      }

      &.error {
        border-color: $error;
      }
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .error-msg {
      color: $error;
      font-size: $font-size-xs;
      margin-top: $spacing-xs;

      &.block {
        display: block;
        margin-top: $spacing-sm;
      }
    }

    .char-count {
      color: $text-tertiary;
      font-size: $font-size-xs;
      text-align: right;
    }
  }

  // Tags
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
    padding: $spacing-sm;
    background-color: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    min-height: 42px;
    align-items: center;
  }

  .tag-item {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    background-color: rgba($primary-color, 0.1);
    border: 1px solid rgba($primary-color, 0.3);
    border-radius: $border-radius-sm;
    color: $primary-color;
    font-size: $font-size-sm;

    .tag-remove {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: $font-size-base;
      line-height: 1;
      padding: 0;
      opacity: 0.6;

      &:hover {
        opacity: 1;
      }
    }
  }

  .tag-input {
    flex: 1;
    min-width: 100px;
    border: none;
    background: transparent;
    color: $text-primary;
    font-size: $font-size-sm;
    outline: none;

    &::placeholder {
      color: $text-tertiary;
    }
  }

  // Icon selector
  .icon-selector {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    gap: $spacing-sm;
  }

  .icon-item {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $bg-primary;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      transform: translateY(-2px);
    }

    &.selected {
      border-color: $primary-color;
      background-color: rgba($primary-color, 0.1);
    }

    .icon-preview {
      font-size: 1.5rem;
    }
  }

  // ============================================================
  // Type & Template Selection
  // ============================================================

  .section-label {
    color: $text-secondary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    margin-bottom: $spacing-md;
  }

  .type-selector {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: $spacing-md;
    margin-bottom: $spacing-xl;
  }

  .type-card {
    padding: $spacing-lg;
    background-color: $bg-primary;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-base ease;
    text-align: center;

    &:hover {
      border-color: $primary-color;
      transform: translateY(-4px);
      box-shadow: $shadow-md;
    }

    &.selected {
      border-color: $primary-color;
      background-color: rgba($primary-color, 0.05);
    }

    .type-icon {
      font-size: 2.5rem;
      margin-bottom: $spacing-sm;
    }

    .type-name {
      color: $text-primary;
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      margin-bottom: $spacing-xs;
    }

    .type-desc {
      color: $text-tertiary;
      font-size: $font-size-xs;
      line-height: 1.4;
    }
  }

  .section-divider {
    display: flex;
    align-items: center;
    margin: $spacing-xl 0;
    color: $text-tertiary;
    font-size: $font-size-sm;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background-color: $border-color-base;
    }

    span {
      padding: 0 $spacing-md;
    }
  }

  .template-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .template-card {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md;
    background-color: $bg-primary;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
    }

    &.selected {
      border-color: $primary-color;
      background-color: rgba($primary-color, 0.05);
    }

    .template-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }

    .template-info {
      flex: 1;

      .template-name {
        color: $text-primary;
        font-weight: $font-weight-semibold;
        margin-bottom: $spacing-xs;
      }

      .template-desc {
        color: $text-tertiary;
        font-size: $font-size-sm;
      }
    }

    .template-use-btn {
      padding: $spacing-xs $spacing-md;
      background-color: transparent;
      border: 1px solid $primary-color;
      border-radius: $border-radius-sm;
      color: $primary-color;
      font-size: $font-size-sm;
      cursor: pointer;
      transition: all $transition-base ease;

      &:hover {
        background-color: $primary-color;
        color: #fff;
      }
    }
  }

  // ============================================================
  // Design Options
  // ============================================================

  .design-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: $spacing-lg;
  }

  .option-card {
    padding: $spacing-xl;
    background-color: $bg-primary;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-base ease;
    text-align: center;

    &:hover {
      border-color: $primary-color;
      transform: translateY(-4px);
      box-shadow: $shadow-lg;
    }

    &.selected {
      border-color: $primary-color;
      background-color: rgba($primary-color, 0.05);
    }

    .option-icon {
      font-size: 3rem;
      margin-bottom: $spacing-md;
    }

    .option-title {
      color: $text-primary;
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      margin-bottom: $spacing-sm;
    }

    .option-desc {
      color: $text-tertiary;
      font-size: $font-size-sm;
      line-height: 1.4;
    }
  }

  .schema-status {
    margin-top: $spacing-lg;
    text-align: center;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-md;
    border-radius: $border-radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;

    &.success {
      background-color: rgba($success, 0.1);
      color: $success;
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }

  // ============================================================
  // Publish Summary
  // ============================================================

  .publish-options {
    .app-summary {
      background-color: $bg-primary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-md;
      padding: $spacing-lg;
      margin-bottom: $spacing-xl;

      .summary-header {
        display: flex;
        align-items: center;
        gap: $spacing-md;
        margin-bottom: $spacing-lg;
        padding-bottom: $spacing-md;
        border-bottom: 1px solid $border-color-lighter;

        .summary-icon {
          font-size: 2.5rem;
        }

        h3 {
          margin: 0;
          color: $text-primary;
          font-size: $font-size-lg;
          font-weight: $font-weight-semibold;
        }
      }

      .summary-details {
        display: flex;
        flex-direction: column;
        gap: $spacing-sm;

        .detail-item {
          display: flex;
          gap: $spacing-sm;
          font-size: $font-size-sm;

          .detail-label {
            color: $text-tertiary;
            min-width: 80px;
          }

          .detail-value {
            color: $text-primary;

            &.success {
              color: $success;
            }

            &.muted {
              color: $text-tertiary;
            }
          }

          .detail-tags {
            display: flex;
            flex-wrap: wrap;
            gap: $spacing-xs;
          }

          .detail-tag {
            padding: 2px $spacing-xs;
            background-color: rgba($primary-color, 0.1);
            border-radius: $border-radius-sm;
            color: $primary-color;
            font-size: $font-size-xs;
          }
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: $spacing-md;
      justify-content: center;
    }
  }

  // ============================================================
  // Buttons
  // ============================================================

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-lg;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;
    border: 1px solid transparent;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }
  }

  .btn-primary {
    background-color: $primary-color;
    border-color: $primary-color;
    color: #fff;

    &:hover:not(:disabled) {
      background-color: $primary-dark;
      border-color: $primary-dark;
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }
  }

  .btn-secondary {
    background-color: $bg-tertiary;
    border-color: $border-color-base;
    color: $text-primary;

    &:hover:not(:disabled) {
      background-color: $bg-elevated;
      border-color: $primary-color;
    }
  }

  .btn-outline {
    background-color: transparent;
    border-color: $border-color-base;
    color: $text-secondary;

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .btn-ghost {
    background-color: transparent;
    border-color: transparent;
    color: $text-tertiary;

    &:hover:not(:disabled) {
      color: $text-primary;
      background-color: $bg-tertiary;
    }
  }

  // ============================================================
  // Navigation
  // ============================================================

  .wizard-nav {
    display: flex;
    justify-content: center;
    gap: $spacing-md;
    flex-shrink: 0;
  }
</style>
