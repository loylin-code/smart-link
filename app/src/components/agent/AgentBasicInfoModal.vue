<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">{{ t('agent.create.title') }}</h2>
            <button class="close-btn" @click="handleClose">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <form class="agent-form" @submit.prevent="handleSubmit">
              <!-- Icon + Code & Name Section -->
              <div class="identity-section">
                <div class="icon-selector" @click="triggerAvatarUpload">
                  <div class="icon-preview">
                    <span v-if="!formData.avatar">{{ formData.name?.charAt(0) || '?' }}</span>
                    <span v-else>{{ formData.avatar }}</span>
                  </div>
                  <span class="icon-label">{{ t('agent.create.icon') }}</span>
                </div>
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  hidden
                  @change="handleAvatarChange"
                />
                <div class="identity-fields">
                  <div class="field-row">
                    <label class="field-label">{{ t('agent.create.code') }}</label>
                    <input
                      v-model="formData.code"
                      type="text"
                      class="field-input"
                      :placeholder="t('agent.create.codePlaceholder')"
                      maxlength="30"
                    />
                  </div>
                  <div class="field-row">
                    <label class="field-label">{{ t('agent.create.name') }}</label>
                    <input
                      v-model="formData.name"
                      type="text"
                      class="field-input"
                      :placeholder="t('agent.create.namePlaceholder')"
                      maxlength="50"
                    />
                  </div>
                </div>
              </div>

              <!-- Type -->
              <div class="form-section">
                <label class="section-label required">{{ t('agent.create.type') }}</label>
                <div class="type-cards">
                  <div
                    v-for="type in agentTypes"
                    :key="type.value"
                    class="type-card"
                    :class="{ active: formData.category === type.value }"
                    @click="formData.category = type.value"
                  >
                    <span class="type-icon">{{ type.icon }}</span>
                    <span class="type-name">{{ type.label }}</span>
                  </div>
                </div>
              </div>

              <!-- Domain -->
              <div class="form-section">
                <label class="section-label required">{{ t('agent.domain.label') }}</label>
                <div class="domain-cards">
                  <div
                    v-for="domain in agentDomains"
                    :key="domain.value"
                    class="domain-card"
                    :class="{ active: formData.domain === domain.value }"
                    :style="{
                      borderColor: formData.domain === domain.value ? domain.color : 'transparent'
                    }"
                    @click="formData.domain = domain.value"
                  >
                    <span class="domain-icon">{{ domain.icon }}</span>
                    <span class="domain-name">{{ domain.label }}</span>
                  </div>
                </div>
              </div>

              <!-- Tags -->
              <div class="form-section">
                <label class="section-label">{{ t('agent.create.tags') }}</label>
                <div class="tags-input">
                  <div class="tag-list">
                    <span v-for="(tag, index) in formData.tags" :key="index" class="tag">
                      {{ tag }}
                      <button type="button" class="tag-remove" @click="removeTag(index)">×</button>
                    </span>
                  </div>
                  <input
                    v-model="tagInput"
                    type="text"
                    class="tag-input"
                    :placeholder="t('agent.create.tagsPlaceholder')"
                    @keydown.enter.prevent="addTag"
                  />
                </div>
              </div>

              <!-- Description -->
              <div class="form-section description-section">
                <label class="section-label">{{ t('agent.create.description') }}</label>
                <textarea
                  v-model="formData.description"
                  class="section-textarea"
                  :placeholder="t('agent.create.descriptionPlaceholder')"
                  maxlength="200"
                  rows="3"
                />
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="handleClose">
              {{ t('common.cancel') }}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!isFormValid"
              @click="handleSubmit"
            >
              {{ t('agent.create.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { AgentDomain } from '@/types'

  interface FormData {
    name: string
    code: string
    description: string
    avatar: string
    category: string
    domain: AgentDomain
    tags: string[]
  }

  const props = defineProps<{
    visible: boolean
  }>()

  const emit = defineEmits<{
    close: []
    submit: [data: FormData]
  }>()

  const { t } = useI18n()

  // Form data
  const formData = ref<FormData>({
    name: '',
    code: '',
    description: '',
    avatar: '',
    category: 'conversational',
    domain: AgentDomain.RESOURCE,
    tags: []
  })

  const tagInput = ref('')
  const avatarInput = ref<HTMLInputElement | null>(null)

  // Agent types
  const agentTypes = [
    {
      value: 'conversational',
      icon: '💬',
      label: '对话型',
      description: '适用于问答、咨询、客服等场景'
    },
    {
      value: 'workflow',
      icon: '🔄',
      label: '工作流型',
      description: '适用于自动化流程、数据处理等'
    },
    {
      value: 'automation',
      icon: '⚡',
      label: '自动化型',
      description: '适用于定时任务、监控告警等'
    }
  ]

  // Agent domains
  const agentDomains = [
    {
      value: AgentDomain.RESOURCE,
      icon: '📊',
      label: '资源领域',
      color: '#10b981'
    },
    {
      value: AgentDomain.ASSET,
      icon: '💰',
      label: '资产领域',
      color: '#f59e0b'
    },
    {
      value: AgentDomain.OPERATION,
      icon: '🔧',
      label: '运维领域',
      color: '#8b5cf6'
    },
    {
      value: AgentDomain.INFRASTRUCTURE,
      icon: '🏗️',
      label: '基础服务',
      color: '#3b82f6'
    }
  ]

  // Form validation
  const isFormValid = computed(() => {
    return (
      formData.value.name.trim() &&
      formData.value.code.trim() &&
      formData.value.category &&
      formData.value.domain
    )
  })

  // Methods
  function handleClose() {
    emit('close')
  }

  function handleSubmit() {
    if (!isFormValid.value) return
    emit('submit', { ...formData.value })
  }

  function triggerAvatarUpload() {
    avatarInput.value?.click()
  }

  function handleAvatarChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      // For demo, just use emoji
      const avatars = ['🤖', '🧠', '🎯', '💡', '🚀', '⚡', '🔮', '🌟']
      formData.value.avatar = avatars[Math.floor(Math.random() * avatars.length)]
    }
  }

  function addTag() {
    const tag = tagInput.value.trim()
    if (tag && !formData.value.tags.includes(tag)) {
      formData.value.tags.push(tag)
      tagInput.value = ''
    }
  }

  function removeTag(index: number) {
    formData.value.tags.splice(index, 1)
  }

  // Reset form when modal closes
  watch(
    () => props.visible,
    (visible) => {
      if (!visible) {
        formData.value = {
          name: '',
          code: '',
          description: '',
          avatar: '',
          category: 'conversational',
          domain: AgentDomain.RESOURCE,
          tags: []
        }
        tagInput.value = ''
      }
    }
  )
</script>

<style scoped lang="scss">
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-container {
    width: 800px;
    height: 520px;
    background: $bg-primary;
    border-radius: $border-radius-xl;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-xl;
    border-bottom: 1px solid $border-color-lighter;
    flex-shrink: 0;
  }

  .modal-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }

  .close-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: $border-radius-md;
    color: $text-tertiary;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: $bg-secondary;
      color: $text-primary;
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }

  .modal-content {
    flex: 1;
    padding: $spacing-lg $spacing-xl;
    overflow: hidden;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-sm;
    padding: $spacing-md $spacing-xl;
    border-top: 1px solid $border-color-lighter;
    background: $bg-secondary;
    flex-shrink: 0;
  }

  // Form styles
  .agent-form {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    height: 100%;
  }

  // Identity Section - Icon spans 2 rows
  .identity-section {
    display: flex;
    gap: $spacing-lg;
    padding-bottom: $spacing-md;
    border-bottom: 1px solid $border-color-lighter;
  }

  .icon-selector {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xs;
    cursor: pointer;
    flex-shrink: 0;
  }

  .icon-preview {
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
    border-radius: $border-radius-lg;
    color: #fff;
    font-size: 28px;
    font-weight: $font-weight-bold;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35);
    }
  }

  .icon-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .identity-fields {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .field-row {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .field-label {
    width: 80px;
    flex-shrink: 0;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
  }

  .field-input {
    flex: 1;
    padding: $spacing-xs $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-primary;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      background: $bg-primary;
    }

    &::placeholder {
      color: $text-tertiary;
    }
  }

  // Form Section
  .form-section {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .section-label {
    width: 100px;
    flex-shrink: 0;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    white-space: nowrap;

    &.required::after {
      content: ' *';
      color: $error;
    }
  }

  .section-input {
    flex: 1;
    padding: $spacing-xs $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-primary;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      background: $bg-primary;
    }

    &::placeholder {
      color: $text-tertiary;
    }
  }

  // Description section - vertical layout
  .description-section {
    flex-direction: column;
    align-items: stretch;
    gap: $spacing-xs;

    .section-label {
      width: auto;
    }
  }

  .section-textarea {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-primary;
    transition: all 0.2s ease;
    resize: none;
    line-height: 1.5;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      background: $bg-primary;
    }

    &::placeholder {
      color: $text-tertiary;
    }
  }

  // Type cards
  .type-cards {
    flex: 1;
    display: flex;
    gap: $spacing-sm;
  }

  .type-card {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    background: $bg-secondary;
    border: 2px solid transparent;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: $bg-tertiary;
    }

    &.active {
      border-color: $primary-color;
      background: rgba(59, 130, 246, 0.08);
    }
  }

  // Domain cards
  .domain-cards {
    flex: 1;
    display: flex;
    gap: $spacing-sm;
  }

  .domain-card {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    background: $bg-secondary;
    border: 2px solid transparent;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: $bg-tertiary;
    }

    &.active {
      background: rgba(59, 130, 246, 0.08);
    }
  }

  .type-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .type-name {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .domain-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .domain-name {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  // Tags input
  .tags-input {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    min-height: 32px;

    &:focus-within {
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      background: $bg-primary;
    }
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    background: $primary-color;
    color: #fff;
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
  }

  .tag-remove {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    cursor: pointer;
    padding: 0;
    line-height: 1;

    &:hover {
      color: #fff;
    }
  }

  .tag-input {
    flex: 1;
    min-width: 80px;
    border: none;
    outline: none;
    background: transparent;
    font-size: $font-size-sm;
    color: $text-primary;

    &::placeholder {
      color: $text-tertiary;
    }
  }

  // Buttons
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-lg;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .btn-secondary {
    background: $bg-primary;
    border: 1px solid $border-color-base;
    color: $text-secondary;

    &:hover:not(:disabled) {
      border-color: $border-color-dark;
      color: $text-primary;
    }
  }

  .btn-primary {
    background: $primary-color;
    border: none;
    color: #fff;

    &:hover:not(:disabled) {
      background: $primary-light;
    }
  }

  // Transitions
  .modal-enter-active,
  .modal-leave-active {
    transition: all 0.25s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;

    .modal-container {
      transform: scale(0.95) translateY(10px);
    }
  }

  .modal-enter-to,
  .modal-leave-from {
    opacity: 1;

    .modal-container {
      transform: scale(1) translateY(0);
    }
  }
</style>
