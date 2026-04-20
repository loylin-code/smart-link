<template>
  <div class="language-switcher">
    <button 
      class="lang-btn" 
      :title="currentLangLabel"
      @click="toggleDropdown"
    >
      <svg viewBox="0 0 24 24" fill="none" class="lang-icon">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <path d="M2 12H22" stroke="currentColor" stroke-width="2" />
        <path
          d="M12 2C14.5 4.7 15.5 7.5 15.5 12C15.5 16.5 14.5 19.3 12 22C9.5 19.3 8.5 16.5 8.5 12C8.5 7.5 9.5 4.7 12 2Z"
          stroke="currentColor"
          stroke-width="2"
        />
      </svg>
    </button>
    <div v-if="showDropdown" class="lang-dropdown">
      <button
        v-for="lang in languages"
        :key="lang.value"
        class="dropdown-item"
        :class="{ active: locale === lang.value }"
        @click="changeLanguage(lang.value)"
      >
        {{ lang.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { locale } = useI18n()
  const showDropdown = ref(false)

  const languages = [
    { value: 'zh-CN', label: '中文' },
    { value: 'en-US', label: 'English' }
  ]

  const currentLangLabel = computed(() => {
    const lang = languages.find((l) => l.value === locale.value)
    return lang?.label || '中文'
  })

  const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value
  }

  const changeLanguage = (lang: string) => {
    locale.value = lang
    localStorage.setItem('locale', lang)
    showDropdown.value = false
  }
</script>

<style scoped lang="scss">
  .language-switcher {
    position: relative;
  }

  // 与主题切换按钮保持一致
  .lang-btn {
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

    .lang-icon {
      width: 18px;
      height: 18px;
      transition: transform $transition-base ease;
    }

    &:hover .lang-icon {
      transform: scale(1.05);
    }
  }

  .lang-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: $spacing-xs;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    overflow: hidden;
    z-index: 1000;
    min-width: 100px;
    box-shadow: $shadow-md;
  }

  .dropdown-item {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    text-align: center;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-fast ease;

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    &.active {
      color: $primary-color;
      background: $primary-surface;
    }
  }
</style>
