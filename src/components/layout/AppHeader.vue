<template>
  <header class="app-header">
    <div class="app-header__left">
      <div class="app-header__logo">
        <div class="logo-icon">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="2"/>
            <path d="M12 20L18 26L28 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="logo-text">SmartLink</span>
      </div>
      <div class="app-header__breadcrumb">
        <span class="breadcrumb-item">{{ currentTitle }}</span>
      </div>
    </div>

    <div class="app-header__center">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="搜索..."
          class="search-input"
          v-model="searchQuery"
          @keyup.enter="handleSearch"
        />
        <span class="search-shortcut">Ctrl+K</span>
      </div>
    </div>

    <div class="app-header__right">
      <button class="header-icon-btn" @click="toggleConsole" :class="{ active: isConsoleVisible }">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <button class="header-icon-btn" @click="toggleTheme">
        <svg v-if="theme === 'dark'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
          <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div class="user-info">
        <div class="user-avatar">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
            <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="user-name">Admin</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store'

const route = useRoute()
const appStore = useAppStore()

const searchQuery = ref('')

const currentTitle = computed(() => {
  return route.meta.title || 'SmartLink'
})

const isConsoleVisible = computed(() => appStore.isConsoleVisible)
const theme = computed(() => appStore.theme)

const handleSearch = () => {
  console.log('Search:', searchQuery.value)
}

const toggleConsole = () => {
  appStore.toggleConsole()
}

const toggleTheme = () => {
  appStore.setTheme(theme.value === 'dark' ? 'light' : 'dark')
}
</script>

<style scoped lang="scss">
.app-header {
  height: $header-height;
  background: $bg-secondary;
  border-bottom: 1px solid $bg-elevated;
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

    .logo-icon {
      width: 32px;
      height: 32px;
      color: $primary-color;
      animation: glow 2s ease-in-out infinite alternate;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .logo-text {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      background: linear-gradient(135deg, $primary-color, $secondary-color);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  &__breadcrumb {
    .breadcrumb-item {
      color: $text-secondary;
      font-size: $font-size-sm;
    }
  }

  &__center {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 0 $spacing-2xl;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 500px;

  .search-icon {
    position: absolute;
    left: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: $text-tertiary;
  }

  .search-input {
    width: 100%;
    height: 40px;
    padding: 0 $spacing-3xl 0 $spacing-3xl;
    background: $bg-tertiary;
    border: 1px solid $bg-elevated;
    border-radius: $border-radius-lg;
    color: $text-primary;
    font-size: $font-size-sm;
    transition: all $transition-base ease;

    &::placeholder {
      color: $text-tertiary;
    }

    &:focus {
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    }
  }

  .search-shortcut {
    position: absolute;
    right: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    padding: 2px 8px;
    background: $bg-elevated;
    border-radius: $border-radius-sm;
    color: $text-tertiary;
    font-size: $font-size-xs;
  }
}

.header-icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $border-radius-md;
  color: $text-secondary;
  transition: all $transition-base ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: $bg-tertiary;
    color: $primary-color;
  }

  &.active {
    background: rgba(0, 212, 255, 0.1);
    color: $primary-color;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-xs $spacing-md;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-base ease;

  &:hover {
    background: $bg-tertiary;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: $border-radius-full;
    background: linear-gradient(135deg, $primary-color, $secondary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-primary;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .user-name {
    color: $text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }
}
</style>
