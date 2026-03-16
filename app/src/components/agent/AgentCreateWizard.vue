<template>
  <div class="agent-create-wizard" :class="{ 'full-width': currentStep === 'design' }">
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
        <div class="step-label">{{ t(`agent.wizard.steps.${step.key}`) }}</div>
        <div v-if="index < steps.length - 1" class="step-line"></div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="wizard-content">
      <!-- Step 1: Basic Info -->
      <div v-show="currentStep === 'basic'" class="step-panel fade-in">
        <AgentBasicInfoStep v-model="formData" @next="nextStep" @cancel="handleCancel" />
      </div>

      <!-- Step 2: Persona -->
      <div v-show="currentStep === 'persona'" class="step-panel fade-in">
        <AgentPersonaStep v-model="formData" @next="nextStep" @prev="prevStep" />
      </div>

      <!-- Step 3: Capabilities -->
      <div v-show="currentStep === 'capabilities'" class="step-panel fade-in">
        <AgentCapabilitiesStep v-model="formData" @next="nextStep" @prev="prevStep" />
      </div>

      <!-- Step 4: LLM Config -->
      <div v-show="currentStep === 'llm'" class="step-panel fade-in">
        <AgentLLMStep v-model="formData" @next="nextStep" @prev="prevStep" />
      </div>

      <!-- Step 5: Knowledge -->
      <div v-show="currentStep === 'knowledge'" class="step-panel fade-in">
        <AgentKnowledgeStep v-model="formData" @next="nextStep" @prev="prevStep" />
      </div>

      <!-- Step 6: Design -->
      <div v-show="currentStep === 'design'" class="step-panel fade-in full-height">
        <AgentDesignStep v-model="formData" @next="nextStep" @prev="prevStep" />
      </div>

      <!-- Step 7: Publish -->
      <div v-show="currentStep === 'publish'" class="step-panel fade-in">
        <AgentPublishStep
          v-model="formData"
          :is-editing="isEditing"
          @publish="handlePublish"
          @prev="prevStep"
          @save-draft="handleSaveDraft"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useAgentStore } from '@/store/modules/agent'
  import AgentBasicInfoStep from './steps/AgentBasicInfoStep.vue'
  import AgentPersonaStep from './steps/AgentPersonaStep.vue'
  import AgentCapabilitiesStep from './steps/AgentCapabilitiesStep.vue'
  import AgentLLMStep from './steps/AgentLLMStep.vue'
  import AgentKnowledgeStep from './steps/AgentKnowledgeStep.vue'
  import AgentDesignStep from './steps/AgentDesignStep.vue'
  import AgentPublishStep from './steps/AgentPublishStep.vue'
  import type { AgentCreateParams, AgentUpdateParams } from '@/types'

  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()
  const agentStore = useAgentStore()

  // State
  const isEditing = ref(false)
  const agentId = ref<string | null>(null)
  const currentStep = ref('basic')

  // Steps configuration
  const steps = [
    { key: 'basic', order: 1 },
    { key: 'persona', order: 2 },
    { key: 'capabilities', order: 3 },
    { key: 'llm', order: 4 },
    { key: 'knowledge', order: 5 },
    { key: 'design', order: 6 },
    { key: 'publish', order: 7 }
  ]

  // Form data
  const formData = ref({
    // Basic info
    name: '',
    code: '',
    description: '',
    avatar: '',
    tags: [] as string[],
    category: '',

    // Persona
    persona: '',
    welcomeMessage: '',
    responsibilities: [] as any[],

    // Capabilities
    mcpServers: [] as any[],
    skills: [] as any[],
    tools: [] as any[],

    // LLM
    llm: {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1
    },

    // Knowledge
    knowledge: {
      documents: [] as any[],
      databases: [] as any[],
      apis: [] as any[],
      searchConfig: {
        enabled: false,
        topK: 10,
        similarityThreshold: 0.7,
        rerankEnabled: false
      }
    },

    // Design
    pageSchema: null as any
  })

  // Page title
  const pageTitle = computed(() => {
    return isEditing.value ? t('agent.wizard.editTitle') : t('agent.wizard.createTitle')
  })

  // Step completion check
  function isStepCompleted(stepKey: string): boolean {
    const completed: Record<string, boolean> = {
      basic: !!(formData.value.name && formData.value.code),
      persona: !!formData.value.persona,
      capabilities: true, // Optional
      llm: !!formData.value.llm.model,
      knowledge: true, // Optional
      design: !!formData.value.pageSchema,
      publish: false
    }
    return completed[stepKey] || false
  }

  // Navigation
  function nextStep() {
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

  // Actions
  async function handlePublish() {
    const params: AgentCreateParams = {
      name: formData.value.name,
      code: formData.value.code,
      description: formData.value.description,
      avatar: formData.value.avatar,
      persona: formData.value.persona,
      welcomeMessage: formData.value.welcomeMessage,
      tags: formData.value.tags,
      category: formData.value.category
    }

    if (isEditing.value && agentId.value) {
      await agentStore.updateAgent(agentId.value, params as AgentUpdateParams)
    } else {
      await agentStore.createAgent(params)
    }

    router.push('/app/agent/design')
  }

  async function handleSaveDraft() {
    // Save as draft
    await handlePublish()
  }

  function handleBack() {
    router.push('/app/agent/design')
  }

  function handleCancel() {
    router.push('/app/agent/design')
  }

  // Load existing agent for editing
  async function loadAgent(id: string) {
    const agent = await agentStore.fetchAgent(id)
    if (agent) {
      formData.value = {
        name: agent.identity.name,
        code: agent.identity.code,
        description: agent.identity.description,
        avatar: agent.identity.avatar,
        tags: agent.tags,
        category: agent.category || '',
        persona: agent.identity.persona,
        welcomeMessage: agent.identity.welcomeMessage,
        responsibilities: agent.identity.responsibilities,
        mcpServers: agent.capabilities.mcpServers,
        skills: agent.capabilities.skills,
        tools: agent.capabilities.tools,
        llm: agent.capabilities.llm,
        knowledge: agent.knowledge,
        pageSchema: agent.pageSchema
      }
    }
  }

  onMounted(() => {
    const id = route.params.id as string
    if (id && id !== 'create') {
      isEditing.value = true
      agentId.value = id
      loadAgent(id)
    }
  })
</script>

<style scoped lang="scss">
  .agent-create-wizard {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: $bg-secondary;

    &.full-width {
      .wizard-header,
      .wizard-steps {
        display: none;
      }

      .wizard-content {
        height: 100%;
      }
    }
  }

  .wizard-header {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-lg $spacing-xl;
    background: $bg-primary;
    border-bottom: 1px solid $border-color-lighter;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .wizard-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }

  .wizard-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: $spacing-lg;
    background: $bg-primary;
    border-bottom: 1px solid $border-color-lighter;
  }

  .step-item {
    display: flex;
    align-items: center;
    position: relative;

    &.active {
      .step-number {
        background: $primary-color;
        color: #fff;
        border-color: $primary-color;
      }

      .step-label {
        color: $primary-color;
        font-weight: $font-weight-medium;
      }
    }

    &.completed {
      .step-number {
        background: $success;
        color: #fff;
        border-color: $success;
      }

      .step-label {
        color: $success;
      }
    }
  }

  .step-number {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid $border-color-base;
    border-radius: 50%;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-tertiary;
    transition: all $transition-base ease;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .step-label {
    margin-left: $spacing-sm;
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  .step-line {
    width: 40px;
    height: 2px;
    background: $border-color-base;
    margin: 0 $spacing-md;
  }

  .wizard-content {
    flex: 1;
    overflow: auto;
    padding: $spacing-xl;
  }

  .step-panel {
    max-width: 800px;
    margin: 0 auto;

    &.full-height {
      max-width: none;
      height: 100%;
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
</style>
