<template>
  <header class="app-header">
    <div class="app-header__left">
      <div class="app-header__logo">
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
      </div>
      <div class="app-header__breadcrumb">
        <span class="breadcrumb-item">{{ currentTitle }}</span>
      </div>
    </div>

    <div class="app-header__right">
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

  const route = useRoute()

  const currentTitle = computed(() => {
    return route.meta.title || 'SmartLink'
  })
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

        .eye {
          animation: eyeGlow 1.5s ease-in-out infinite alternate;
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

    &__right {
      display: flex;
      align-items: center;
      gap: $spacing-md;
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

  @keyframes glow {
    from {
      filter: drop-shadow(0 0 5px rgba(0, 212, 255, 0.3));
    }
    to {
      filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.6));
    }
  }

  @keyframes eyeGlow {
    from {
      fill: $primary-color;
      filter: drop-shadow(0 0 2px rgba(0, 212, 255, 0.5));
    }
    to {
      fill: $primary-light;
      filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.8));
    }
  }
</style>
