<template>
  <div class="agent-llm-step">
    <h2 class="step-title">{{ t('agent.wizard.steps.llm') }}</h2>
    <p class="step-desc">{{ t('agent.wizard.llmDesc') }}</p>

    <div class="form-group">
      <label class="form-label">{{ t('agent.llm.provider') }}</label>
      <select v-model="localData.llm.provider" class="form-select">
        <option value="openai">OpenAI</option>
        <option value="anthropic">Anthropic</option>
        <option value="google">Google</option>
        <option value="alibaba">Alibaba</option>
        <option value="ollama">Ollama</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('agent.llm.model') }}</label>
      <input v-model="localData.llm.model" type="text" class="form-input" placeholder="gpt-4" />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">{{ t('agent.llm.temperature') }}</label>
        <input
          v-model.number="localData.llm.temperature"
          type="number"
          step="0.1"
          min="0"
          max="2"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('agent.llm.maxTokens') }}</label>
        <input v-model.number="localData.llm.maxTokens" type="number" class="form-input" />
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
  .agent-llm-step {
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

  .form-row {
    display: flex;
    gap: $spacing-lg;
  }

  .form-group {
    flex: 1;
    margin-bottom: $spacing-lg;
  }

  .form-label {
    display: block;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }

  .form-input,
  .form-select {
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
</style>
