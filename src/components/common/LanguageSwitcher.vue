<template>
  <div class="language-switcher">
    <button class="lang-btn" @click="toggleDropdown">
      <svg viewBox="0 0 24 24" fill="none" class="lang-icon">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <path d="M2 12H22" stroke="currentColor" stroke-width="2" />
        <path
          d="M12 2C14.5 4.7 15.5 7.5 15.5 12C15.5 16.5 14.5 19.3 12 22C9.5 19.3 8.5 16.5 8.5 12C8.5 7.5 9.5 4.7 12 2Z"
          stroke="currentColor"
          stroke-width="2"
        />
      </svg>
      <span class="lang-text">{{ currentLangLabel }}</span>
      <svg viewBox="0 0 24 24" fill="none" class="arrow-icon" :class="{ rotated: showDropdown }">
        <path
          d="M6 9L12 15L18 9"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
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

  .lang-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-md;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }
  }

  .lang-icon {
    width: 18px;
    height: 18px;
  }

  .lang-text {
    font-size: $font-size-sm;
  }

  .arrow-icon {
    width: 14px;
    height: 14px;
    transition: transform $transition-fast ease;

    &.rotated {
      transform: rotate(180deg);
    }
  }

  .lang-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: $spacing-xs;
    background: $bg-secondary;
    border: 1px solid $bg-elevated;
    border-radius: $border-radius-md;
    overflow: hidden;
    z-index: 1000;
    min-width: 120px;
  }

  .dropdown-item {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    text-align: left;
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
      background: rgba(0, 212, 255, 0.1);
    }
  }
</style>
