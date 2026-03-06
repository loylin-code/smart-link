<template>
  <div class="settings-page">
    <div class="settings-layout">
      <!-- 左侧导航 -->
      <aside class="settings-sidebar">
        <nav class="settings-nav">
          <router-link to="/app/settings/appearance" class="nav-item nav-item--active">
            <span class="nav-icon">🎨</span>
            <span class="nav-text">{{ t('settings.appearance') }}</span>
          </router-link>
          <router-link to="/app/settings/providers" class="nav-item">
            <span class="nav-icon">🤖</span>
            <span class="nav-text">{{ t('settings.providers') }}</span>
          </router-link>
        </nav>
      </aside>

      <!-- 右侧内容区 -->
      <main class="settings-content">
        <div class="settings-header">
          <h1 class="settings-title">
            ⚙️ {{ t('settings.systemSettings') }} - {{ t('settings.appearance') }}
          </h1>
        </div>

        <div class="settings-form">
          <!-- 主题模式 -->
          <section class="form-section">
            <h3 class="section-title">{{ t('settings.themeMode') }}</h3>
            <div class="radio-group">
              <label
                class="radio-item"
                :class="{ 'radio-item--active': localAppearance.theme === 'light' }"
              >
                <input
                  type="radio"
                  v-model="localAppearance.theme"
                  value="light"
                  class="radio-input"
                />
                <span class="radio-indicator"></span>
                <span class="radio-label">{{ t('settings.lightMode') }}</span>
              </label>
              <label
                class="radio-item"
                :class="{ 'radio-item--active': localAppearance.theme === 'dark' }"
              >
                <input
                  type="radio"
                  v-model="localAppearance.theme"
                  value="dark"
                  class="radio-input"
                />
                <span class="radio-indicator"></span>
                <span class="radio-label">{{ t('settings.darkMode') }}</span>
              </label>
              <label
                class="radio-item"
                :class="{ 'radio-item--active': localAppearance.theme === 'system' }"
              >
                <input
                  type="radio"
                  v-model="localAppearance.theme"
                  value="system"
                  class="radio-input"
                />
                <span class="radio-indicator"></span>
                <span class="radio-label">{{ t('settings.followSystem') }}</span>
              </label>
            </div>
          </section>

          <!-- 主题色 -->
          <section class="form-section">
            <h3 class="section-title">{{ t('settings.primaryColor') }}</h3>
            <div class="color-picker">
              <button
                v-for="color in colorOptions"
                :key="color.value"
                class="color-option"
                :class="{ 'color-option--active': localAppearance.primaryColor === color.value }"
                @click="localAppearance.primaryColor = color.value"
              >
                <span class="color-dot" :style="{ backgroundColor: color.value }"></span>
                <span class="color-label">{{ t(color.labelKey) }}</span>
                <span v-if="localAppearance.primaryColor === color.value" class="color-check"
                  >●</span
                >
              </button>
            </div>
          </section>

          <!-- 语言 -->
          <section class="form-section">
            <h3 class="section-title">{{ t('common.language') }}</h3>
            <div class="select-wrapper">
              <select v-model="localAppearance.language" class="form-select">
                <option value="zh-CN">{{ t('common.chinese') }}</option>
                <option value="en-US">{{ t('common.english') }}</option>
              </select>
              <span class="select-arrow">▼</span>
            </div>
          </section>

          <!-- 字体大小 -->
          <section class="form-section">
            <h3 class="section-title">{{ t('settings.fontSize') }}</h3>
            <div class="radio-group radio-group--horizontal">
              <label
                class="radio-item"
                :class="{ 'radio-item--active': localAppearance.fontSize === 'small' }"
              >
                <input
                  type="radio"
                  v-model="localAppearance.fontSize"
                  value="small"
                  class="radio-input"
                />
                <span class="radio-indicator"></span>
                <span class="radio-label">{{ t('settings.small') }}</span>
              </label>
              <label
                class="radio-item"
                :class="{ 'radio-item--active': localAppearance.fontSize === 'medium' }"
              >
                <input
                  type="radio"
                  v-model="localAppearance.fontSize"
                  value="medium"
                  class="radio-input"
                />
                <span class="radio-indicator"></span>
                <span class="radio-label">{{ t('settings.medium') }}</span>
              </label>
              <label
                class="radio-item"
                :class="{ 'radio-item--active': localAppearance.fontSize === 'large' }"
              >
                <input
                  type="radio"
                  v-model="localAppearance.fontSize"
                  value="large"
                  class="radio-input"
                />
                <span class="radio-indicator"></span>
                <span class="radio-label">{{ t('settings.large') }}</span>
              </label>
            </div>
          </section>
        </div>

        <!-- 操作按钮 -->
        <div class="settings-actions">
          <button class="btn btn--secondary" @click="handleCancel">
            {{ t('common.cancel') }}
          </button>
          <button class="btn btn--primary" @click="handleSave" :disabled="!hasChanges">
            {{ t('settings.saveChanges') }}
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { useSettingsStore } from '@/store/modules/settings'
  import type { AppearanceSettings } from '@/types'

  const { t, locale } = useI18n()
  const router = useRouter()
  const settingsStore = useSettingsStore()

  // 颜色选项
  const colorOptions = [
    { value: '#1890ff', labelKey: 'settings.colors.defaultBlue' },
    { value: '#52c41a', labelKey: 'settings.colors.techGreen' },
    { value: '#722ed1', labelKey: 'settings.colors.elegantPurple' },
    { value: '#fa8c16', labelKey: 'settings.colors.activeOrange' }
  ]

  // 本地状态
  const localAppearance = ref<AppearanceSettings>({
    theme: 'light',
    primaryColor: '#1890ff',
    language: 'zh-CN',
    fontSize: 'medium'
  })

  // 检测是否有变更
  const hasChanges = computed(() => {
    const store = settingsStore.appearance
    const local = localAppearance.value
    return (
      store.theme !== local.theme ||
      store.primaryColor !== local.primaryColor ||
      store.language !== local.language ||
      store.fontSize !== local.fontSize
    )
  })

  // 初始化
  onMounted(() => {
    localAppearance.value = { ...settingsStore.appearance }
  })

  // 保存
  const handleSave = () => {
    settingsStore.setTheme(localAppearance.value.theme)
    settingsStore.setPrimaryColor(localAppearance.value.primaryColor)
    settingsStore.setLanguage(localAppearance.value.language)
    settingsStore.setFontSize(localAppearance.value.fontSize)

    // 更新i18n语言
    locale.value = localAppearance.value.language

    // 应用主题
    settingsStore.applyTheme()
  }

  // 取消
  const handleCancel = () => {
    localAppearance.value = { ...settingsStore.appearance }
    router.back()
  }
</script>

<style scoped lang="scss">
  .settings-page {
    height: 100%;
    padding: $spacing-xl;
    overflow-y: auto;
  }

  .settings-layout {
    display: flex;
    gap: $spacing-xl;
    max-width: 1200px;
    margin: 0 auto;
  }

  .settings-sidebar {
    flex-shrink: 0;
    width: 200px;
  }

  .settings-nav {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    overflow: hidden;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-md $spacing-lg;
    color: $text-secondary;
    text-decoration: none;
    transition: all $transition-base ease;
    border-bottom: 1px solid $border-color-light;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: rgba($primary-color, 0.05);
      color: $primary-color;
    }

    &--active,
    &.router-link-active {
      background: rgba($primary-color, 0.1);
      color: $primary-color;
      font-weight: $font-weight-medium;
    }
  }

  .nav-icon {
    font-size: $font-size-lg;
  }

  .nav-text {
    font-size: $font-size-sm;
  }

  .settings-content {
    flex: 1;
    min-width: 0;
  }

  .settings-header {
    margin-bottom: $spacing-xl;
  }

  .settings-title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  .settings-form {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-xl;
  }

  .form-section {
    margin-bottom: $spacing-xl;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }

  // 单选组
  .radio-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    &--horizontal {
      flex-direction: row;
      gap: $spacing-lg;
    }
  }

  .radio-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      background: rgba($primary-color, 0.05);
    }

    &--active {
      background: rgba($primary-color, 0.1);
    }
  }

  .radio-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .radio-indicator {
    width: 16px;
    height: 16px;
    border: 2px solid $border-color-base;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all $transition-base ease;

    &::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $primary-color;
      opacity: 0;
      transition: opacity $transition-base ease;
    }

    .radio-item--active & {
      border-color: $primary-color;

      &::after {
        opacity: 1;
      }
    }
  }

  .radio-label {
    font-size: $font-size-sm;
    color: $text-primary;
  }

  // 颜色选择器
  .color-picker {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: $spacing-md;
  }

  .color-option {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-md;
    background: $bg-tertiary;
    border: 2px solid transparent;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $border-color-base;
    }

    &--active {
      border-color: $primary-color;
      background: rgba($primary-color, 0.05);
    }
  }

  .color-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .color-label {
    font-size: $font-size-sm;
    color: $text-primary;
    flex: 1;
  }

  .color-check {
    font-size: $font-size-xs;
    color: $primary-color;
  }

  // 下拉选择
  .select-wrapper {
    position: relative;
    max-width: 320px;
  }

  .form-select {
    width: 100%;
    padding: $spacing-sm $spacing-lg;
    padding-right: 40px;
    font-size: $font-size-sm;
    color: $text-primary;
    background: $bg-tertiary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    cursor: pointer;
    appearance: none;
    transition: all $transition-base ease;

    &:hover {
      border-color: $border-color-dark;
    }

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
    }
  }

  .select-arrow {
    position: absolute;
    right: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    color: $text-tertiary;
    pointer-events: none;
  }

  // 操作按钮
  .settings-actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-md;
    margin-top: $spacing-xl;
    padding-top: $spacing-xl;
    border-top: 1px solid $border-color-light;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-lg;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-base ease;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--primary {
      background: $primary-color;
      border: 1px solid $primary-color;
      color: #fff;

      &:hover:not(:disabled) {
        background: $primary-light;
        border-color: $primary-light;
      }
    }

    &--secondary {
      background: $bg-tertiary;
      border: 1px solid $border-color-base;
      color: $text-primary;

      &:hover:not(:disabled) {
        border-color: $border-color-dark;
        background: $bg-secondary;
      }
    }
  }
</style>
