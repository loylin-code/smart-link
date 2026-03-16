<template>
  <div class="agent-design-step">
    <h2 class="step-title">{{ t('agent.wizard.steps.design') }}</h2>
    <p class="step-desc">{{ t('agent.wizard.designDesc') }}</p>

    <div class="design-placeholder">
      <p>{{ t('agent.design.configureInOrchestrator') }}</p>
      <router-link
        :to="`/app/agent/design/orchestration?mode=create&name=${localData.name}`"
        class="btn btn-primary"
      >
        {{ t('agent.design.openOrchestrator') }}
      </router-link>
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
  .agent-design-step {
    max-width: 800px;
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

  .design-placeholder {
    text-align: center;
    padding: $spacing-3xl;
    background: $bg-primary;
    border-radius: $border-radius-md;
    border: 2px dashed $border-color-base;

    p {
      color: $text-tertiary;
      font-size: $font-size-sm;
      margin: 0 0 $spacing-lg 0;
    }
  }

  .btn {
    padding: $spacing-sm $spacing-lg;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
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

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-md;
    margin-top: $spacing-xl;
  }
</style>
