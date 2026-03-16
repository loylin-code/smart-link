<template>
  <div class="agent-publish-step">
    <h2 class="step-title">{{ t('agent.wizard.steps.publish') }}</h2>
    <p class="step-desc">{{ t('agent.wizard.publishDesc') }}</p>

    <div class="preview-section">
      <h3 class="section-title">{{ t('agent.publish.preview') }}</h3>
      <div class="preview-card">
        <div class="preview-avatar">
          {{ localData.avatar || localData.name?.charAt(0) || '?' }}
        </div>
        <div class="preview-info">
          <h4 class="preview-name">{{ localData.name || t('agent.untitled') }}</h4>
          <p class="preview-code">{{ localData.code || '-' }}</p>
          <p class="preview-desc">{{ localData.description || t('agent.noDescription') }}</p>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn btn-secondary" @click="$emit('prev')">
        {{ t('common.prev') }}
      </button>
      <button class="btn btn-outline" @click="$emit('saveDraft')">
        {{ t('agent.publish.saveDraft') }}
      </button>
      <button class="btn btn-primary" @click="$emit('publish')">
        {{ isEditing ? t('agent.publish.update') : t('agent.publish.create') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  const props = defineProps<{
    modelValue: any
    isEditing: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: any]
    publish: []
    prev: []
    saveDraft: []
  }>()

  const { t } = useI18n()
  const localData = ref({ ...props.modelValue })

  watch(localData, (val) => emit('update:modelValue', val), { deep: true })
</script>

<style scoped lang="scss">
  .agent-publish-step {
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

  .preview-section {
    margin-bottom: $spacing-xl;
  }

  .section-title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0 0 $spacing-md 0;
  }

  .preview-card {
    display: flex;
    gap: $spacing-lg;
    padding: $spacing-lg;
    background: $bg-primary;
    border-radius: $border-radius-md;
    border: 1px solid $border-color-lighter;
  }

  .preview-avatar {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-md;
    background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
    color: #fff;
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    flex-shrink: 0;
  }

  .preview-info {
    flex: 1;
  }

  .preview-name {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0 0 $spacing-xs 0;
  }

  .preview-code {
    font-size: $font-size-sm;
    color: $text-tertiary;
    margin: 0 0 $spacing-xs 0;
  }

  .preview-desc {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin: 0;
    line-height: 1.5;
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

  .btn-outline {
    background: transparent;
    border: 1px solid $primary-color;
    color: $primary-color;

    &:hover {
      background: rgba($primary-color, 0.1);
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
