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
    <app-console />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppConsole from './AppConsole.vue'
import { useAppStore } from '@/store'

const appStore = useAppStore()

const isConsoleVisible = computed(() => appStore.isConsoleVisible)
const consoleHeight = computed(() => appStore.consoleHeight)
</script>

<style scoped lang="scss">
.app-layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg-primary;
  overflow: hidden;

  &__container {
    flex: 1;
    display: flex;
    overflow: hidden;
    padding-bottom: v-bind('isConsoleVisible ? consoleHeight + "px" : "0"');
  }

  &__content {
    flex: 1;
    overflow: hidden;
    background: $bg-primary;
    position: relative;
  }
}

// 路由过渡动画
.route-enter-active,
.route-leave-active {
  transition: all 0.3s ease;
}

.route-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.route-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
