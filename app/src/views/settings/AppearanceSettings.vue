<template>
  <div class="settings-page">
    <div class="settings-layout">
      <!-- 左侧导航 -->
      <aside class="settings-sidebar">
        <nav class="settings-nav">
          <router-link
            to="/app/settings/appearance"
            class="nav-item"
            :class="{ 'nav-item--active': isActive('/app/settings/appearance') }"
          >
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                <path
                  d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="nav-text">{{ t('settings.appearance') }}</span>
          </router-link>
          <router-link
            to="/app/settings/providers"
            class="nav-item"
            :class="{ 'nav-item--active': isActive('/app/settings/providers') }"
          >
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <rect
                  x="2"
                  y="3"
                  width="20"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M8 21H16M12 17V21"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="nav-text">{{ t('settings.providers') }}</span>
          </router-link>
        </nav>
      </aside>

      <!-- 右侧内容区 -->
      <main class="settings-content">
        <div class="settings-header">
          <h1 class="settings-title">{{ t('settings.appearance') }}</h1>
          <p class="settings-subtitle">
            {{ t('settings.appearanceDesc') || '自定义应用的外观和主题设置' }}
          </p>
        </div>

        <div class="settings-form">
          <!-- 主题模式 -->
          <section class="form-section">
            <div class="section-header">
              <h3 class="section-title">{{ t('settings.themeMode') }}</h3>
              <span class="section-badge">{{
                localAppearance.theme === 'light'
                  ? t('settings.lightMode')
                  : localAppearance.theme === 'dark'
                    ? t('settings.darkMode')
                    : t('settings.followSystem')
              }}</span>
            </div>
            <div class="theme-cards">
              <button
                class="theme-card"
                :class="{ 'theme-card--active': localAppearance.theme === 'light' }"
                @click="localAppearance.theme = 'light'"
              >
                <div class="theme-card__preview theme-card__preview--light">
                  <div class="preview-sun"></div>
                </div>
                <span class="theme-card__label">{{ t('settings.lightMode') }}</span>
                <span v-if="localAppearance.theme === 'light'" class="theme-card__check">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12L10 17L19 8"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
              <button
                class="theme-card"
                :class="{ 'theme-card--active': localAppearance.theme === 'dark' }"
                @click="localAppearance.theme = 'dark'"
              >
                <div class="theme-card__preview theme-card__preview--dark">
                  <div class="preview-moon"></div>
                </div>
                <span class="theme-card__label">{{ t('settings.darkMode') }}</span>
                <span v-if="localAppearance.theme === 'dark'" class="theme-card__check">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12L10 17L19 8"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
              <button
                class="theme-card"
                :class="{ 'theme-card--active': localAppearance.theme === 'system' }"
                @click="localAppearance.theme = 'system'"
              >
                <div class="theme-card__preview theme-card__preview--system">
                  <div class="preview-system"></div>
                </div>
                <span class="theme-card__label">{{ t('settings.followSystem') }}</span>
                <span v-if="localAppearance.theme === 'system'" class="theme-card__check">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12L10 17L19 8"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </section>

          <!-- 主题色 -->
          <section class="form-section">
            <div class="section-header">
              <h3 class="section-title">{{ t('settings.primaryColor') }}</h3>
            </div>
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
                <span v-if="localAppearance.primaryColor === color.value" class="color-check">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12L10 17L19 8"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </section>

          <!-- 语言 -->
          <section class="form-section">
            <div class="section-header">
              <h3 class="section-title">{{ t('common.language') }}</h3>
            </div>
            <div class="select-wrapper">
              <select v-model="localAppearance.language" class="form-select">
                <option value="zh-CN">{{ t('common.chinese') }}</option>
                <option value="en-US">{{ t('common.english') }}</option>
              </select>
              <span class="select-arrow">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </div>
          </section>

          <!-- 字体大小 -->
          <section class="form-section">
            <div class="section-header">
              <h3 class="section-title">{{ t('settings.fontSize') }}</h3>
              <span class="section-badge">{{
                localAppearance.fontSize === 'small'
                  ? t('settings.small')
                  : localAppearance.fontSize === 'medium'
                    ? t('settings.medium')
                    : t('settings.large')
              }}</span>
            </div>
            <div class="font-size-slider">
              <button
                class="size-option"
                :class="{ 'size-option--active': localAppearance.fontSize === 'small' }"
                @click="localAppearance.fontSize = 'small'"
              >
                <span class="size-preview size-preview--sm">Aa</span>
                <span class="size-label">{{ t('settings.small') }}</span>
              </button>
              <button
                class="size-option"
                :class="{ 'size-option--active': localAppearance.fontSize === 'medium' }"
                @click="localAppearance.fontSize = 'medium'"
              >
                <span class="size-preview size-preview--md">Aa</span>
                <span class="size-label">{{ t('settings.medium') }}</span>
              </button>
              <button
                class="size-option"
                :class="{ 'size-option--active': localAppearance.fontSize === 'large' }"
                @click="localAppearance.fontSize = 'large'"
              >
                <span class="size-preview size-preview--lg">Aa</span>
                <span class="size-label">{{ t('settings.large') }}</span>
              </button>
            </div>
          </section>
        </div>

        <!-- 操作按钮 -->
        <div class="settings-actions">
          <button class="btn btn--secondary" @click="handleCancel">
            {{ t('common.cancel') }}
          </button>
          <button class="btn btn--primary" @click="handleSave" :disabled="!hasChanges">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12L10 17L19 8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
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
  import { useRouter, useRoute } from 'vue-router'
  import { useSettingsStore } from '@/store/modules/settings'
  import type { AppearanceSettings } from '@/types'

  const { t, locale } = useI18n()
  const router = useRouter()
  const route = useRoute()
  const settingsStore = useSettingsStore()

  // 颜色选项
  const colorOptions = [
    { value: '#1e40af', labelKey: 'settings.colors.professionalBlue' },
    { value: '#059669', labelKey: 'settings.colors.emeraldGreen' },
    { value: '#7c3aed', labelKey: 'settings.colors.elegantPurple' },
    { value: '#dc2626', labelKey: 'settings.colors.vibrantRed' }
  ]

  // 本地状态
  const localAppearance = ref<AppearanceSettings>({
    theme: 'light',
    primaryColor: '#1e40af',
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

  // 检查路由激活状态
  const isActive = (path: string) => {
    return route.path === path
  }

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
    background: $bg-secondary;

    @include respond-below(md) {
      padding: $spacing-md;
    }
  }

  .settings-layout {
    display: flex;
    gap: $spacing-xl;
    max-width: 1200px;
    margin: 0 auto;

    @include respond-below(lg) {
      flex-direction: column;
      gap: $spacing-lg;
    }
  }

  // ================================
  // 侧边栏导航
  // ================================
  .settings-sidebar {
    flex-shrink: 0;
    width: 220px;

    @include respond-below(lg) {
      width: 100%;
    }
  }

  .settings-nav {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    padding: $spacing-sm;

    @include respond-below(lg) {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-md;
    border-radius: $border-radius-md;
    color: $text-secondary;
    text-decoration: none;
    transition: all $transition-fast $ease-out;

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    &--active {
      background: $primary-surface;
      color: $primary-color;

      .nav-icon {
        color: $primary-color;
      }

      .nav-text {
        font-weight: $font-weight-semibold;
      }
    }
  }

  .nav-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .nav-text {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  // ================================
  // 内容区
  // ================================
  .settings-content {
    flex: 1;
    min-width: 0;
  }

  .settings-header {
    margin-bottom: $spacing-xl;
  }

  .settings-title {
    font-family: $font-family-display;
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin: 0 0 $spacing-xs 0;

    @include respond-below(md) {
      font-size: $font-size-2xl;
    }
  }

  .settings-subtitle {
    font-size: $font-size-sm;
    color: $text-tertiary;
    margin: 0;
  }

  .settings-form {
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    padding: $spacing-xl;

    @include respond-below(md) {
      padding: $spacing-lg;
    }
  }

  .form-section {
    margin-bottom: $spacing-2xl;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-md;
  }

  .section-title {
    font-family: $font-family-display;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }

  .section-badge {
    font-size: $font-size-xs;
    color: $primary-color;
    background: $primary-surface;
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-sm;
    font-weight: $font-weight-medium;
  }

  // ================================
  // 主题选择卡片
  // ================================
  .theme-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-md;

    @include respond-below(md) {
      grid-template-columns: 1fr;
    }
  }

  .theme-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-lg;
    background: $bg-secondary;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-lg;
    cursor: pointer;
    transition: all $transition-fast $ease-out;
    position: relative;

    &:hover {
      border-color: $primary-color;
      background: $bg-tertiary;
    }

    &--active {
      border-color: $primary-color;
      background: $primary-surface;
    }
  }

  .theme-card__preview {
    width: 64px;
    height: 64px;
    border-radius: $border-radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    &--light {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border: 1px solid $border-color-base;
    }

    &--dark {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid #334155;
    }

    &--system {
      background: linear-gradient(135deg, #f8fafc 0%, #1e293b 100%);
      border: 1px solid $border-color-base;
    }
  }

  .preview-sun {
    width: 24px;
    height: 24px;
    background: $warning;
    border-radius: 50%;
    box-shadow: 0 0 12px rgba($warning, 0.4);
  }

  .preview-moon {
    width: 20px;
    height: 20px;
    background: #64748b;
    border-radius: 50%;
    box-shadow: inset 4px 0 0 #334155;
  }

  .preview-system {
    width: 16px;
    height: 16px;
    background: linear-gradient(135deg, $warning 50%, #64748b 50%);
    border-radius: 50%;
  }

  .theme-card__label {
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: $font-weight-medium;
  }

  .theme-card__check {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    width: 20px;
    height: 20px;
    color: $primary-color;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  // ================================
  // 颜色选择器
  // ================================
  .color-picker {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: $spacing-md;

    @include respond-below(md) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .color-option {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-md;
    background: $bg-secondary;
    border: 2px solid transparent;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-fast $ease-out;
    position: relative;

    &:hover {
      border-color: $border-color-dark;
    }

    &--active {
      border-color: var(--active-color, $primary-color);
      background: $bg-tertiary;
    }
  }

  .color-dot {
    width: 24px;
    height: 24px;
    border-radius: $border-radius-full;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .color-label {
    font-size: $font-size-sm;
    color: $text-primary;
    flex: 1;
    text-align: left;
  }

  .color-check {
    width: 16px;
    height: 16px;
    color: inherit;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  // ================================
  // 下拉选择
  // ================================
  .select-wrapper {
    position: relative;
    max-width: 320px;
  }

  .form-select {
    width: 100%;
    padding: $spacing-md $spacing-2xl $spacing-md $spacing-lg;
    font-size: $font-size-sm;
    color: $text-primary;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    cursor: pointer;
    appearance: none;
    transition: all $transition-fast $ease-out;

    &:hover {
      border-color: $primary-color;
    }

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: $ring-primary;
    }
  }

  .select-arrow {
    position: absolute;
    right: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: $text-tertiary;
    pointer-events: none;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  // ================================
  // 字体大小选择
  // ================================
  .font-size-slider {
    display: flex;
    gap: $spacing-md;

    @include respond-below(sm) {
      flex-direction: column;
    }
  }

  .size-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-lg;
    background: $bg-secondary;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-fast $ease-out;

    &:hover {
      border-color: $primary-color;
    }

    &--active {
      border-color: $primary-color;
      background: $primary-surface;
    }
  }

  .size-preview {
    font-weight: $font-weight-semibold;
    color: $text-primary;

    &--sm {
      font-size: $font-size-sm;
    }

    &--md {
      font-size: $font-size-lg;
    }

    &--lg {
      font-size: $font-size-xl;
    }
  }

  .size-label {
    font-size: $font-size-xs;
    color: $text-secondary;
  }

  // ================================
  // 操作按钮
  // ================================
  .settings-actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-md;
    margin-top: $spacing-xl;
    padding-top: $spacing-xl;
    border-top: 1px solid $border-color-base;

    @include respond-below(sm) {
      flex-direction: column;
    }
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-xl;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-fast $ease-out;

    svg {
      width: 16px;
      height: 16px;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &--primary {
      background: $primary-color;
      border: none;
      color: $text-inverse;

      &:hover:not(:disabled) {
        background: $primary-dark;
        box-shadow: $shadow-primary;
      }
    }

    &--secondary {
      background: $bg-secondary;
      border: 1px solid $border-color-base;
      color: $text-primary;

      &:hover:not(:disabled) {
        background: $bg-tertiary;
        border-color: $primary-color;
        color: $primary-color;
      }
    }
  }

  // ================================
  // 动画减少模式
  // ================================
  @include reduced-motion {
    .nav-item,
    .theme-card,
    .color-option,
    .size-option,
    .btn {
      transition: none;
    }
  }
</style>
