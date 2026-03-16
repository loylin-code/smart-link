<template>
  <div class="agent-capabilities-step">
    <h2 class="step-title">{{ t('agent.wizard.steps.capabilities') }}</h2>
    <p class="step-desc">{{ t('agent.wizard.capabilitiesDesc') }}</p>

    <div class="capabilities-section">
      <h3 class="section-title">{{ t('agent.capabilities.mcpServers') }}</h3>
      <div class="empty-placeholder">
        <p>{{ t('agent.capabilities.noMcpServers') }}</p>
        <button class="btn btn-outline">{{ t('agent.capabilities.addMcp') }}</button>
      </div>
    </div>

    <div class="capabilities-section">
      <h3 class="section-title">{{ t('agent.capabilities.skills') }}</h3>
      <div class="empty-placeholder">
        <p>{{ t('agent.capabilities.noSkills') }}</p>
        <button class="btn btn-outline">{{ t('agent.capabilities.addSkill') }}</button>
      </div>
    </div>

    <div class="capabilities-section">
      <h3 class="section-title">{{ t('agent.capabilities.tools') }}</h3>
      <div class="empty-placeholder">
        <p>{{ t('agent.capabilities.noTools') }}</p>
        <button class="btn btn-outline">{{ t('agent.capabilities.addTool') }}</button>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn btn-secondary" @click="$emit('prev')">
        {{ t('common.prev') }}
      </button>
      <button class="btn btn-primary" @click="$emit('next')">
        {{ t('common.next') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  const props = defineProps<{ modelValue: any }>()
  const emit = defineEmits<{
    'update:modelValue': [value: any]
    next: []
    prev: []
  }>()

  const { t } = useI18n()
  const localData = ref({ ...props.modelValue })

  watch(localData, (val) => emit('update:modelValue', val), { deep: true })
</script>

<style scoped lang="scss">
  .agent-capabilities-step {
    max-width: 800px;
    margin: 0 auto;
  }

  .capabilities-section {
    margin-bottom: $spacing-xl;
    padding: $spacing-lg;
    background: $bg-primary;
    border-radius: $border-radius-md;
    border: 1px solid $border-color-lighter;
  }

  .section-title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0 0 $spacing-md 0;
  }

  .empty-placeholder {
    text-align: center;
    padding: $spacing-lg;

    p {
      color: $text-tertiary;
      font-size: $font-size-sm;
      margin: 0 0 $spacing-md 0;
    }
  }

  .btn {
    padding: $spacing-sm $spacing-lg;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;
  }

  .btn-outline {
    background: transparent;
    border: 1px solid $primary-color;
    color: $primary-color;

    &:hover {
      background: rgba($primary-color, 0.1);
    }
  }

  .btn-secondary {
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    color: $text-secondary;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .btn-primary {
    background: $primary-color;
    border: 1px solid $primary-color;
    color: #fff;

    &:hover {
      background: $primary-light;
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-md;
    margin-top: $spacing-xl;
  }
</style>
