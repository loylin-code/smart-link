<template>
  <div class="modal-overlay" @click="$emit('cancel')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ t('application.disable.title') }}</h3>
      </div>

      <div class="modal-body">
        <div class="warning-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9V11M12 15H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <p class="confirm-message">
          {{ t('application.disable.confirmMessage', { name: app?.name }) }}
        </p>

        <div class="disable-effects">
          <p>{{ t('application.disable.effects') }}:</p>
          <ul>
            <li>{{ t('application.disable.effect1') }}</li>
            <li>{{ t('application.disable.effect2') }}</li>
            <li>{{ t('application.disable.effect3') }}</li>
          </ul>
        </div>

        <div class="custom-message">
          <label>{{ t('application.disable.customMessage') }}:</label>
          <input
            v-model="customTitle"
            :placeholder="t('application.disable.customTitlePlaceholder')"
            class="input"
          />
          <textarea
            v-model="customDescription"
            :placeholder="t('application.disable.customDescPlaceholder')"
            class="textarea"
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn secondary" @click="$emit('cancel')">{{ t('common.cancel') }}</button>
        <button class="btn danger" @click="handleConfirm">
          {{ t('application.disable.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { Application } from '@/types'

  const { t } = useI18n()

  const props = defineProps<{
    app: Application | null
  }>()

  const emit = defineEmits<{
    confirm: [info: { title: string; description: string }]
    cancel: []
  }>()

  const customTitle = ref('应用暂时不可用')
  const customDescription = ref('该应用正在维护中，请稍后再试...')

  function handleConfirm() {
    emit('confirm', {
      title: customTitle.value,
      description: customDescription.value
    })
  }
</script>

<style scoped lang="scss">
  .modal-overlay {
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

  .modal-content {
    background: $bg-primary;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-lg;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    padding: $spacing-lg;
    border-bottom: 1px solid $border-color-lighter;

    h3 {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }
  }

  .modal-body {
    padding: $spacing-lg;
  }

  .warning-icon {
    display: flex;
    justify-content: center;
    margin-bottom: $spacing-md;

    svg {
      width: 48px;
      height: 48px;
      color: $warning;
    }
  }

  .confirm-message {
    text-align: center;
    font-size: $font-size-base;
    color: $text-primary;
    margin: 0 0 $spacing-lg 0;
  }

  .disable-effects {
    padding: $spacing-md;
    background: $bg-secondary;
    border-radius: $border-radius-md;
    margin-bottom: $spacing-lg;

    p {
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $text-secondary;
      margin: 0 0 $spacing-sm 0;
    }

    ul {
      margin: 0;
      padding-left: $spacing-lg;

      li {
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-bottom: 4px;
      }
    }
  }

  .custom-message {
    label {
      display: block;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $text-secondary;
      margin-bottom: $spacing-xs;
    }

    .input,
    .textarea {
      width: 100%;
      padding: $spacing-sm;
      background: $bg-secondary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-sm;
      font-size: $font-size-sm;
      color: $text-primary;
      margin-bottom: $spacing-sm;

      &::placeholder {
        color: $text-tertiary;
      }

      &:focus {
        outline: none;
        border-color: $primary-color;
      }
    }

    .textarea {
      min-height: 80px;
      resize: vertical;
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-sm;
    padding: $spacing-lg;
    border-top: 1px solid $border-color-lighter;
  }

  .btn {
    padding: $spacing-sm $spacing-lg;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    &.secondary {
      background: $bg-tertiary;
      border: 1px solid $border-color-base;
      color: $text-secondary;

      &:hover {
        border-color: $primary-color;
        color: $primary-color;
      }
    }

    &.danger {
      background: $error;
      border: 1px solid $error;
      color: #fff;

      &:hover {
        background: #ff7875;
      }
    }
  }
</style>
