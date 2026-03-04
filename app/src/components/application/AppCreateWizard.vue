<template>
  <div class="app-create-wizard">
    <!-- Step Indicator -->
    <div class="wizard-steps">
      <div
        v-for="(step, index) in steps"
        :key="step.key"
        class="step-item"
        :class="{ active: currentStep === step.key, completed: isStepCompleted(step.key) }"
      >
        <div class="step-number">{{ step.order }}</div>
        <div class="step-label">{{ step.label }}</div>
        <div v-if="index < steps.length - 1" class="step-line"></div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="wizard-content">
      <!-- Step 1: Basic Info -->
      <div v-show="currentStep === 'basic'" class="step-panel fade-in">
        <h2>基本信息</h2>
        <form @submit.prevent="nextStep">
          <div class="form-item">
            <label>应用名称 *</label>
            <input
              v-model="formData.name"
              placeholder="请输入应用名称"
              required
              :class="{ error: errors.name }"
            />
            <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
          </div>
          <div class="form-item">
            <label>应用描述</label>
            <textarea
              v-model="formData.description"
              placeholder="请输入应用描述"
              rows="3"
            ></textarea>
          </div>
          <div class="form-item">
            <label>应用类型 *</label>
            <div class="type-selector">
              <div
                v-for="type in appTypes"
                :key="type.value"
                class="type-card"
                :class="{ selected: formData.type === type.value }"
                @click="
                  formData.type = type.value
                  errors.type = ''
                "
              >
                <div class="type-icon">{{ type.icon }}</div>
                <div class="type-name">{{ type.label }}</div>
              </div>
            </div>
            <span v-if="errors.type" class="error-msg">{{ errors.type }}</span>
          </div>
          <div class="form-item">
            <label>应用图标</label>
            <div class="icon-selector">
              <div
                v-for="icon in availableIcons"
                :key="icon"
                class="icon-item"
                :class="{ selected: formData.icon === icon }"
                @click="formData.icon = icon"
              >
                <span class="icon-preview">{{ icon }}</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Step 2: Page Design -->
      <div v-show="currentStep === 'design'" class="step-panel fade-in">
        <h2>页面设计</h2>
        <div class="design-options">
          <div class="option-card" @click="openAIAssistant">
            <div class="option-icon">🤖</div>
            <div class="option-title">AI 助手设计</div>
            <div class="option-desc">通过自然语言描述，AI 自动生成页面</div>
          </div>
          <div class="option-card" @click="openManualDesign">
            <div class="option-icon">✏️</div>
            <div class="option-title">手动编排</div>
            <div class="option-desc">使用可视化编排器设计页面</div>
          </div>
          <div class="option-card" @click="importSchema">
            <div class="option-icon">📄</div>
            <div class="option-title">导入 Schema</div>
            <div class="option-desc">从 JSON 文件导入页面结构</div>
          </div>
        </div>
      </div>

      <!-- Step 3: Preview -->
      <div v-show="currentStep === 'preview'" class="step-panel fade-in">
        <h2>预览测试</h2>
        <div class="preview-container">
          <div v-if="formData.schema" class="schema-preview">
            <div class="schema-info">
              <div class="info-item">
                <span class="label">Schema 版本:</span>
                <span class="value">{{ formData.schema.version || '1.0' }}</span>
              </div>
              <div class="info-item">
                <span class="label">组件数量:</span>
                <span class="value">{{ countComponents(formData.schema) }}</span>
              </div>
            </div>
            <pre class="schema-json">{{ JSON.stringify(formData.schema, null, 2) }}</pre>
          </div>
          <div v-else class="preview-empty">
            <p>暂无页面结构数据</p>
            <p>请返回上一步进行页面设计</p>
          </div>
        </div>
      </div>

      <!-- Step 4: Save/Publish -->
      <div v-show="currentStep === 'publish'" class="step-panel fade-in">
        <h2>保存发布</h2>
        <div class="publish-options">
          <div class="app-summary">
            <div class="summary-header">
              <span class="summary-icon">{{ formData.icon }}</span>
              <h3>{{ formData.name || '未命名应用' }}</h3>
            </div>
            <div class="summary-details">
              <p><strong>类型：</strong>{{ getAppTypeLabel }}</p>
              <p><strong>描述：</strong>{{ formData.description || '无描述' }}</p>
              <p><strong>页面结构：</strong>{{ formData.schema ? '已配置' : '未配置' }}</p>
            </div>
          </div>
          <div class="action-buttons">
            <button class="btn-save" @click="saveAsDraft">
              <span class="btn-icon">💾</span>
              保存为草稿
            </button>
            <button class="btn-publish" @click="publishApp">
              <span class="btn-icon">🚀</span>
              发布应用
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="wizard-nav">
      <button v-if="!isFirstStep" class="btn-prev" @click="prevStep" :disabled="isProcessing">
        上一步
      </button>
      <button
        v-if="!isLastStep && currentStep !== 'design'"
        class="btn-next"
        @click="nextStep"
        :disabled="!canNext || isProcessing"
      >
        下一步
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useApplicationStore } from '@/store/modules/application'
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
    schema: PageSchema | null
  }

  interface FormErrors {
    name: string
    type: string
  }

  const router = useRouter()
  const applicationStore = useApplicationStore()

  const steps: Step[] = [
    { key: 'basic', label: '基本信息', order: 1 },
    { key: 'design', label: '页面设计', order: 2 },
    { key: 'preview', label: '预览测试', order: 3 },
    { key: 'publish', label: '保存发布', order: 4 }
  ]

  const currentStep = ref<string>('basic')
  const isProcessing = ref<boolean>(false)

  const formData = ref<FormData>({
    name: '',
    description: '',
    type: AppType.CUSTOM,
    icon: 'app',
    schema: null
  })

  const errors = ref<FormErrors>({
    name: '',
    type: ''
  })

  const appTypes = [
    { value: AppType.WORKFLOW, label: '工单应用', icon: '📋' },
    { value: AppType.CHART, label: '图表应用', icon: '📊' },
    { value: AppType.FORM, label: '表单应用', icon: '📝' },
    { value: AppType.DASHBOARD, label: '仪表盘', icon: '📈' },
    { value: AppType.CUSTOM, label: '自定义', icon: '⚙️' }
  ]

  const availableIcons = [
    'app',
    'dashboard',
    'chart',
    'form',
    'table',
    'settings',
    'user',
    'team',
    'document',
    'folder',
    'calendar',
    'task',
    'message',
    'notification',
    'analytics'
  ]

  const isFirstStep = computed(() => currentStep.value === 'basic')
  const isLastStep = computed(() => currentStep.value === 'publish')

  const canNext = computed(() => {
    if (currentStep.value === 'basic') {
      return formData.value.name.trim() !== '' && formData.value.type !== undefined
    }
    return true
  })

  function isStepCompleted(key: string): boolean {
    const stepIndex = steps.findIndex((s) => s.key === key)
    const currentIndex = steps.findIndex((s) => s.key === currentStep.value)
    return stepIndex < currentIndex
  }

  function validateCurrentStep(): boolean {
    if (currentStep.value === 'basic') {
      let isValid = true

      if (!formData.value.name.trim()) {
        errors.value.name = '请输入应用名称'
        isValid = false
      } else {
        errors.value.name = ''
      }

      if (!formData.value.type) {
        errors.value.type = '请选择应用类型'
        isValid = false
      } else {
        errors.value.type = ''
      }

      return isValid
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

  // Design options
  function openAIAssistant() {
    router.push({
      path: '/app/application/orchestration',
      query: {
        ai: 'true',
        name: formData.value.name,
        type: formData.value.type
      }
    })
  }

  function openManualDesign() {
    router.push({
      path: '/app/application/orchestration',
      query: {
        name: formData.value.name,
        type: formData.value.type
      }
    })
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
          alert('无效的 Schema 文件格式')
        }
      } catch (err) {
        alert('文件解析失败')
      }
    }
    input.click()
  }

  function countComponents(schema: PageSchema): number {
    if (!schema) return 0
    // Simple count based on components array or root children
    if ('components' in schema && Array.isArray(schema.components)) {
      return schema.components.length
    }
    return 1
  }

  // Watch for schema changes from orchestration
  router.afterEach((to, from) => {
    if (from.path === '/app/application/orchestration' && to.path === '/app/application/create') {
      const schemaJson = sessionStorage.getItem('temp_schema')
      if (schemaJson) {
        try {
          formData.value.schema = JSON.parse(schemaJson) as PageSchema
          sessionStorage.removeItem('temp_schema')
          currentStep.value = 'preview'
        } catch (e) {
          console.error('Failed to parse schema from session', e)
        }
      }
    }
  })

  // Save methods
  async function saveAsDraft() {
    if (isProcessing.value) return

    try {
      isProcessing.value = true
      const app = await applicationApi.createApplication({
        name: formData.value.name,
        description: formData.value.description,
        type: formData.value.type,
        icon: formData.value.icon,
        schema: formData.value.schema || undefined,
        status: AppStatus.DRAFT
      })

      // Refresh the applications list
      await applicationStore.fetchApplications()
      router.push('/app/application/list')
    } catch (error) {
      console.error('Failed to save draft:', error)
      alert('保存失败，请重试')
    } finally {
      isProcessing.value = false
    }
  }

  async function publishApp() {
    if (isProcessing.value) return

    try {
      isProcessing.value = true
      const app = await applicationApi.createApplication({
        name: formData.value.name,
        description: formData.value.description,
        type: formData.value.type,
        icon: formData.value.icon,
        schema: formData.value.schema || undefined,
        status: AppStatus.PUBLISHED
      })

      // Refresh the applications list
      await applicationStore.fetchApplications()
      router.push('/app/application/runtime')
    } catch (error) {
      console.error('Failed to publish app:', error)
      alert('发布失败，请重试')
    } finally {
      isProcessing.value = false
    }
  }

  const getAppTypeLabel = computed(() => {
    const type = appTypes.find((t) => t.value === formData.value.type)
    return type ? type.label : '未知类型'
  })
</script>

<style scoped lang="scss">
  .app-create-wizard {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;

    background-color: #1a1a2e;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .wizard-steps {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
    position: relative;

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
        background-color: #2a2a3e;
        color: #6c6c8a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.1rem;
        transition: all 0.3s ease;
        border: 2px solid #2a2a3e;
      }

      .step-label {
        margin-top: 0.5rem;
        font-size: 0.9rem;
        color: #6c6c8a;
        transition: all 0.3s ease;
      }

      .step-line {
        position: absolute;
        top: 20px;
        left: 50%;
        width: 100%;
        height: 2px;
        background-color: #2a2a3e;
        z-index: -1;
      }

      &.active {
        .step-number {
          background-color: #4a4a6a;
          color: #fff;
          border-color: #6366f1;
        }

        .step-label {
          color: #fff;
          font-weight: 500;
        }
      }

      &.completed {
        .step-number {
          background-color: #6366f1;
          color: #fff;
          border-color: #6366f1;
        }

        .step-label {
          color: #6366f1;
        }
      }
    }
  }

  .wizard-content {
    background-color: #16162a;
    border-radius: 8px;
    padding: 2rem;
    min-height: 400px;
    margin-bottom: 1.5rem;
  }

  .step-panel {
    h2 {
      margin-bottom: 1.5rem;
      color: #fff;
      font-size: 1.5rem;
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

  .form-item {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #a0a0b0;
      font-weight: 500;
    }

    input,
    textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      background-color: #2a2a3e;
      border: 1px solid #3a3a5a;
      border-radius: 6px;
      color: #fff;
      font-size: 1rem;
      transition: all 0.3s ease;

      &::placeholder {
        color: #5a5a7a;
      }

      &:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      &.error {
        border-color: #ef4444;
      }
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    .error-msg {
      color: #ef4444;
      font-size: 0.85rem;
      margin-top: 0.25rem;
      display: block;
    }
  }

  .type-selector {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .type-card {
    flex: 1;
    min-width: 100px;
    padding: 1.5rem 1rem;
    background-color: #2a2a3e;
    border: 2px solid #3a3a5a;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;

    &:hover {
      border-color: #6366f1;
      transform: translateY(-2px);
    }

    &.selected {
      border-color: #6366f1;
      background-color: rgba(99, 102, 241, 0.1);
    }

    .type-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .type-name {
      color: #fff;
      font-size: 0.9rem;
      font-weight: 500;
    }
  }

  .icon-selector {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    gap: 0.75rem;
  }

  .icon-item {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2a2a3e;
    border: 2px solid #3a3a5a;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #6366f1;
    }

    &.selected {
      border-color: #6366f1;
      background-color: rgba(99, 102, 241, 0.1);
    }

    .icon-preview {
      font-size: 1.5rem;
    }
  }

  .design-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .option-card {
    padding: 2rem;
    background-color: #2a2a3e;
    border: 2px solid #3a3a5a;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;

    &:hover {
      border-color: #6366f1;
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);
    }

    .option-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .option-title {
      color: #fff;
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .option-desc {
      color: #a0a0b0;
      font-size: 0.9rem;
      line-height: 1.4;
    }
  }

  .preview-container {
    background-color: #1a1a2e;
    border-radius: 6px;
    padding: 1rem;
    min-height: 300px;
    overflow: auto;
  }

  .schema-preview {
    .schema-info {
      display: flex;
      gap: 2rem;
      margin-bottom: 1rem;
      padding: 1rem;
      background-color: #2a2a3e;
      border-radius: 6px;

      .info-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .label {
          color: #a0a0b0;
          font-size: 0.9rem;
        }

        .value {
          color: #6366f1;
          font-weight: 600;
          font-size: 1rem;
        }
      }
    }

    .schema-json {
      background-color: #0f0f1a;
      color: #a0a0b0;
      padding: 1rem;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      overflow-x: auto;
      max-height: 400px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }

  .preview-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #6c6c8a;

    p {
      margin: 0.5rem 0;
    }
  }

  .publish-options {
    .app-summary {
      background-color: #2a2a3e;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;

      .summary-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;

        .summary-icon {
          font-size: 2.5rem;
        }

        h3 {
          color: #fff;
          font-size: 1.3rem;
          margin: 0;
        }
      }

      .summary-details {
        p {
          color: #a0a0b0;
          margin: 0.5rem 0;

          strong {
            color: #fff;
          }
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
  }

  .btn-save,
  .btn-publish {
    padding: 0.875rem 2rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .btn-icon {
      font-size: 1.2rem;
    }
  }

  .btn-save {
    background-color: #4a4a6a;
    color: #fff;

    &:hover:not(:disabled) {
      background-color: #5a5a7a;
    }
  }

  .btn-publish {
    background-color: #6366f1;
    color: #fff;

    &:hover:not(:disabled) {
      background-color: #5457d6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  .wizard-nav {
    display: flex;
    justify-content: center;
    gap: 1rem;

    .btn-prev,
    .btn-next {
      padding: 0.75rem 2rem;
      border: 1px solid #3a3a5a;
      border-radius: 6px;
      background-color: #2a2a3e;
      color: #fff;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background-color: #3a3a5a;
        border-color: #6366f1;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-next {
      background-color: #6366f1;
      border-color: #6366f1;

      &:hover:not(:disabled) {
        background-color: #5457d6;
      }
    }
  }
</style>
