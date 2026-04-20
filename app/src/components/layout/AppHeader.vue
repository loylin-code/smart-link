<template>
  <header class="app-header">
    <div class="app-header__left">
      <router-link to="/" class="app-header__logo">
        <div class="logo-icon">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect
              x="8"
              y="10"
              width="24"
              height="20"
              rx="4"
              stroke="currentColor"
              stroke-width="2"
            />
            <line x1="20" y1="4" x2="20" y2="10" stroke="currentColor" stroke-width="2" />
            <circle cx="20" cy="4" r="2" fill="currentColor" />
            <circle cx="15" cy="18" r="2" fill="currentColor" class="eye" />
            <circle cx="25" cy="18" r="2" fill="currentColor" class="eye" />
            <line
              x1="14"
              y1="24"
              x2="26"
              y2="24"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <rect
              x="4"
              y="16"
              width="4"
              height="8"
              rx="1"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <rect
              x="32"
              y="16"
              width="4"
              height="8"
              rx="1"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
        </div>
        <span class="logo-text">SmartLink</span>
      </router-link>
      <div class="app-header__breadcrumb">
        <span class="breadcrumb-item">{{ currentTitle }}</span>
      </div>
    </div>

    <div class="app-header__right">
      <!-- 主题切换按钮 -->
      <button
        class="theme-toggle-btn"
        :title="isDark ? t('common.switchToLight') : t('common.switchToDark')"
        @click="handleToggleTheme"
      >
        <svg class="theme-icon" viewBox="0 0 24 24" fill="none">
          <!-- 太阳图标 - 亮色模式时显示 -->
          <template v-if="!isDark">
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" />
            <path
              d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </template>
          <!-- 月亮图标 - 暗色模式时显示 -->
          <template v-else>
            <path
              d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.97-4.03-9-9-9z"
              stroke="currentColor"
              stroke-width="2"
              fill="currentColor"
              fill-opacity="0.1"
            />
          </template>
        </svg>
      </button>
      <LanguageSwitcher />
      <div class="user-info">
        <div class="user-avatar">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" />
            <path
              d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <span class="user-name">Admin</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useSettingsStore } from '@/store/modules/settings'
  import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'

  const route = useRoute()
  const { t } = useI18n()
  const settingsStore = useSettingsStore()

  const isDark = computed(() => settingsStore.appearance.theme === 'dark')
  const handleToggleTheme = () => {
    settingsStore.toggleTheme()
  }

  const currentTitle = computed(() => {
    return route.meta.title || 'SmartLink'
  })
</script>

<style scoped lang="scss">
  .app-header {
    height: $header-height;
    background: $bg-primary;
    border-bottom: 1px solid $border-color-base;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $spacing-lg;
    position: relative;
    z-index: 100;

    &__left {
      display: flex;
      align-items: center;
      gap: $spacing-lg;
    }

    &__logo {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      text-decoration: none;
      transition: opacity $transition-fast $ease-out;

      &:hover {
        opacity: 0.85;
      }

      .logo-icon {
        width: 32px;
        height: 32px;
        color: $primary-color;
        transition: transform $transition-base $ease-out;

        svg {
          width: 100%;
          height: 100%;
        }

        .eye {
          transition: fill $transition-fast $ease-out;
        }
      }

      &:hover .logo-icon {
        transform: scale(1.05);
      }

      .logo-text {
        font-family: $font-family-display;
        font-size: $font-size-xl;
        font-weight: $font-weight-bold;
        color: $text-primary;
        letter-spacing: -0.02em;
      }
    }

    &__breadcrumb {
      .breadcrumb-item {
        color: $text-tertiary;
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
      }
    }

    &__right {
      display: flex;
      align-items: center;
      gap: $spacing-md;
    }
  }

  // 主题切换按钮样式 - 与语言切换按钮保持一致
  .theme-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-md;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    .theme-icon {
      width: 18px;
      height: 18px;
      transition: transform $transition-base ease;
    }

    &:hover .theme-icon {
      transform: rotate(15deg);
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-xs $spacing-md;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-fast $ease-out;

    &:hover {
      background: $bg-secondary;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: $border-radius-full;
      background: $primary-surface;
      border: 1px solid $border-color-base;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $primary-color;
      transition: all $transition-fast $ease-out;

      svg {
        width: 18px;
        height: 18px;
      }
    }

    &:hover .user-avatar {
      border-color: $primary-color;
    }

    .user-name {
      color: $text-primary;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
    }
  }

  // 响应式设计
  @include respond-below(md) {
    .app-header {
      padding: 0 $spacing-md;

      &__breadcrumb {
        display: none;
      }

      .user-name {
        display: none;
      }
    }
  }
</style>
