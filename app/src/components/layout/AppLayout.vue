<template>
  <div class="app-layout">
    <app-header />
    <div class="app-layout__container">
      <app-sidebar />
      <main class="app-layout__content">
        <router-view v-slot="{ Component }">
          <transition name="route" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppHeader from './AppHeader.vue'
  import AppSidebar from './AppSidebar.vue'
</script>

<style scoped lang="scss">
  .app-layout {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: $bg-secondary;
    overflow: hidden;

    &__container {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    &__content {
      flex: 1;
      overflow: hidden;
      background: $bg-primary;
      position: relative;
    }
  }

  // 路由过渡动画 - 优雅淡入
  .route-enter-active,
  .route-leave-active {
    transition: all 0.25s $ease-out;
  }

  .route-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }

  .route-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }

  // 动画减少模式
  @include reduced-motion {
    .route-enter-active,
    .route-leave-active {
      transition: opacity 0.15s ease;
    }

    .route-enter-from,
    .route-leave-to {
      transform: none;
    }
  }
</style>
