<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ t('application.share.title') }} - {{ app?.name }}</h3>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- 访问链接 -->
        <div class="share-section">
          <h4>{{ t('application.share.accessLink') }}</h4>
          <div class="link-box">
            <input v-model="shareLink" readonly class="link-input" />
            <button class="copy-btn" @click="copyLink">{{ t('common.copy') }}</button>
          </div>
        </div>

        <!-- 链接设置 -->
        <div class="share-section">
          <h4>{{ t('application.share.linkSettings') }}</h4>
          <div class="setting-item">
            <label>
              <input type="checkbox" v-model="settings.requirePassword" />
              {{ t('application.share.requirePassword') }}
            </label>
            <input
              v-if="settings.requirePassword"
              v-model="settings.password"
              type="password"
              class="setting-input"
            />
          </div>

          <div class="setting-item">
            <label>
              <input type="checkbox" v-model="settings.hasExpiration" />
              {{ t('application.share.setExpiration') }}
            </label>
            <input
              v-if="settings.hasExpiration"
              v-model="settings.expirationDate"
              type="date"
              class="setting-input"
            />
          </div>

          <div class="setting-item">
            <label>
              <input type="checkbox" v-model="settings.limitVisits" />
              {{ t('application.share.limitVisits') }}
            </label>
            <input
              v-if="settings.limitVisits"
              v-model="settings.maxVisits"
              type="number"
              class="setting-input"
            />
          </div>
        </div>

        <!-- 嵌入代码 -->
        <div class="share-section">
          <h4>{{ t('application.share.embedCode') }}</h4>
          <div class="code-box">
            <pre>{{ embedCode }}</pre>
            <button class="copy-btn" @click="copyEmbedCode">{{ t('common.copy') }}</button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn secondary" @click="$emit('close')">{{ t('common.cancel') }}</button>
        <button class="btn primary" @click="applySettings">
          {{ t('application.share.applySettings') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { Application } from '@/types'

  const { t } = useI18n()

  const props = defineProps<{
    app: Application | null
  }>()

  const emit = defineEmits<{
    close: []
  }>()

  const settings = ref({
    requirePassword: false,
    password: '',
    hasExpiration: false,
    expirationDate: '',
    limitVisits: false,
    maxVisits: 100
  })

  const shareLink = computed(() => {
    if (!props.app) return ''
    return `${window.location.origin}/app/application/runtime/${props.app.id}`
  })

  const embedCode = computed(() => {
    if (!props.app) return ''
    return `<iframe
  src="${window.location.origin}/embed/${props.app.id}"
  width="100%"
  height="600"
  frameborder="0">
</iframe>`
  })

  function copyLink() {
    navigator.clipboard.writeText(shareLink.value)
    alert(t('common.copied'))
  }

  function copyEmbedCode() {
    navigator.clipboard.writeText(embedCode.value)
    alert(t('common.copied'))
  }

  function applySettings() {
    // TODO: 调用 API 保存分享设置
    emit('close')
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
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-lg;
    border-bottom: 1px solid $border-color-lighter;

    h3 {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: $border-radius-sm;
      color: $text-tertiary;
      cursor: pointer;

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover {
        background: $bg-tertiary;
        color: $text-secondary;
      }
    }
  }

  .modal-body {
    padding: $spacing-lg;
  }

  .share-section {
    margin-bottom: $spacing-lg;

    h4 {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0 0 $spacing-sm 0;
    }
  }

  .link-box,
  .code-box {
    display: flex;
    gap: $spacing-sm;
  }

  .link-input {
    flex: 1;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    color: $text-primary;
  }

  .code-box {
    flex-direction: column;

    pre {
      padding: $spacing-md;
      background: $bg-secondary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-sm;
      font-size: $font-size-xs;
      color: $text-secondary;
      overflow-x: auto;
      margin: 0;
    }
  }

  .copy-btn {
    padding: $spacing-sm $spacing-md;
    background: $primary-color;
    border: none;
    border-radius: $border-radius-sm;
    color: #fff;
    font-size: $font-size-sm;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      background: $primary-light;
    }
  }

  .setting-item {
    margin-bottom: $spacing-sm;

    label {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      font-size: $font-size-sm;
      color: $text-secondary;
      cursor: pointer;
    }

    .setting-input {
      margin-top: $spacing-xs;
      margin-left: 24px;
      padding: $spacing-xs $spacing-sm;
      background: $bg-secondary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-sm;
      font-size: $font-size-sm;
      color: $text-primary;
      width: 200px;
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

    &.primary {
      background: $primary-color;
      border: 1px solid $primary-color;
      color: #fff;

      &:hover {
        background: $primary-light;
      }
    }
  }
</style>
