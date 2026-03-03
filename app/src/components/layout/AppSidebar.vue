<template>
  <aside class="app-sidebar" :class="{ 'app-sidebar--collapsed': isCollapsed }">
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div v-for="item in menuItems" :key="item.path" class="nav-item-wrapper">
          <router-link
            v-if="!item.children"
            :to="item.path"
            class="nav-item"
            :class="{ 'nav-item--active': isActive(item.path) }"
          >
            <div class="nav-item__icon">
              <component :is="item.icon" />
            </div>
            <span v-if="!isCollapsed" class="nav-item__text">{{ item.title }}</span>
          </router-link>

          <div v-else class="nav-group">
            <div
              class="nav-item"
              :class="{ 'nav-item--expanded': isExpanded(item.path) }"
              @click="toggleExpand(item.path)"
            >
              <div class="nav-item__icon">
                <component :is="item.icon" />
              </div>
              <span v-if="!isCollapsed" class="nav-item__text">{{ item.title }}</span>
              <svg
                v-if="!isCollapsed"
                class="nav-item__arrow"
                :class="{ 'nav-item__arrow--expanded': isExpanded(item.path) }"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <transition name="slide">
              <div v-if="!isCollapsed && isExpanded(item.path)" class="nav-children">
                <router-link
                  v-for="child in item.children"
                  :key="child.path"
                  :to="child.path"
                  class="nav-child"
                  :class="{ 'nav-child--active': isActive(child.path) }"
                >
                  <span class="nav-child__dot"></span>
                  <span class="nav-child__text">{{ child.title }}</span>
                </router-link>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </nav>

    <div class="sidebar-footer">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <svg
          class="toggle-icon"
          :class="{ 'toggle-icon--collapsed': isCollapsed }"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span v-if="!isCollapsed" class="toggle-text">{{ t('sidebar.collapseSidebar') }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { ref, computed, h } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useAppStore } from '@/store'

  const route = useRoute()
  const appStore = useAppStore()
  const { t } = useI18n()

  const expandedItems = ref<string[]>(['/app/application', '/app/resource'])

  const isCollapsed = computed(() => appStore.isSidebarCollapsed)

  // 图标组件
  const ChatIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', {
        d: 'M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ])

  const AppIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('rect', {
        x: 3,
        y: 3,
        width: 7,
        height: 7,
        rx: 1,
        stroke: 'currentColor',
        'stroke-width': 2
      }),
      h('rect', {
        x: 14,
        y: 3,
        width: 7,
        height: 7,
        rx: 1,
        stroke: 'currentColor',
        'stroke-width': 2
      }),
      h('rect', {
        x: 3,
        y: 14,
        width: 7,
        height: 7,
        rx: 1,
        stroke: 'currentColor',
        'stroke-width': 2
      }),
      h('rect', {
        x: 14,
        y: 14,
        width: 7,
        height: 7,
        rx: 1,
        stroke: 'currentColor',
        'stroke-width': 2
      })
    ])

  const ResourceIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', {
        d: 'M22 19V17C22 15.1362 20.7252 13.5701 19 13.126V12C19 10.3431 17.6569 9 16 9H8C6.34315 9 5 10.3431 5 12V13.126C3.27477 13.5701 2 15.1362 2 17V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19Z',
        stroke: 'currentColor',
        'stroke-width': 2
      }),
      h('path', {
        d: 'M8 9V6C8 4.34315 9.34315 3 11 3H13C14.6569 3 16 4.34315 16 6V9',
        stroke: 'currentColor',
        'stroke-width': 2
      })
    ])

  const menuItems = computed(() => [
    {
      path: '/app/explore',
      title: t('sidebar.explore'),
      icon: ChatIcon
    },
    {
      path: '/app/application',
      title: t('sidebar.appManagement'),
      icon: AppIcon,
      children: [
        { path: '/app/application/list', title: t('sidebar.appList') },
        { path: '/app/application/orchestration', title: t('sidebar.appOrchestration') }
      ]
    },
    {
      path: '/app/resource',
      title: t('sidebar.resource'),
      icon: ResourceIcon,
      children: [
        { path: '/app/resource/skills', title: t('sidebar.skillsManagement') },
        { path: '/app/resource/mcp', title: t('sidebar.mcpManagement') },
        { path: '/app/resource/components', title: t('sidebar.componentManagement') }
      ]
    }
  ])

  const isActive = (path: string) => {
    return route.path === path || route.path.startsWith(path + '/')
  }

  const isExpanded = (path: string) => {
    return expandedItems.value.includes(path) || isActive(path)
  }

  const toggleExpand = (path: string) => {
    const index = expandedItems.value.indexOf(path)
    if (index > -1) {
      expandedItems.value.splice(index, 1)
    } else {
      expandedItems.value.push(path)
    }
  }

  const toggleSidebar = () => {
    appStore.toggleSidebar()
  }
</script>

<style scoped lang="scss">
  .app-sidebar {
    width: $sidebar-width;
    height: calc(100vh - #{$header-height});
    background: $bg-secondary;
    border-right: 1px solid $bg-elevated;
    display: flex;
    flex-direction: column;
    transition: width $transition-base ease;

    &--collapsed {
      width: $sidebar-collapsed-width;

      .nav-item__text,
      .nav-item__arrow,
      .nav-children,
      .toggle-text {
        display: none;
      }

      .nav-item {
        justify-content: center;
        padding: $spacing-md;
      }
    }
  }

  .sidebar-nav {
    flex: 1;
    padding: $spacing-md;
    overflow-y: auto;
  }

  .nav-section {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .nav-item-wrapper {
    margin-bottom: $spacing-xs;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    border-radius: $border-radius-md;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-base ease;
    text-decoration: none;

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    &--active {
      background: rgba(0, 212, 255, 0.1);
      color: $primary-color;

      .nav-item__icon {
        color: $primary-color;
      }
    }

    &__icon {
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

    &__text {
      flex: 1;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
    }

    &__arrow {
      width: 16px;
      height: 16px;
      transition: transform $transition-base ease;

      &--expanded {
        transform: rotate(90deg);
      }
    }
  }

  .nav-group {
    .nav-item {
      margin-bottom: $spacing-xs;
    }
  }

  .nav-children {
    margin-left: $spacing-2xl;
    margin-top: $spacing-xs;
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .nav-child {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-sm;
    color: $text-tertiary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;
    text-decoration: none;

    &:hover {
      color: $text-primary;
      background: $bg-tertiary;
    }

    &--active {
      color: $primary-color;

      .nav-child__dot {
        background: $primary-color;
        box-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
      }
    }

    &__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: $text-tertiary;
      transition: all $transition-base ease;
    }

    &__text {
      flex: 1;
    }
  }

  .sidebar-footer {
    padding: $spacing-md;
    border-top: 1px solid $bg-elevated;
    display: flex;
    justify-content: center;
  }

  .sidebar-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background: $bg-tertiary;
    border: 1px solid $bg-elevated;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      background: rgba(0, 212, 255, 0.1);
      border-color: rgba(0, 212, 255, 0.3);
      color: $primary-color;
    }

    .toggle-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      transition: transform $transition-base ease;

      &--collapsed {
        transform: rotate(180deg);
      }
    }

    .toggle-text {
      font-weight: $font-weight-medium;
      white-space: nowrap;
    }
  }

  .app-sidebar--collapsed {
    .sidebar-footer {
      padding: $spacing-sm;
    }

    .sidebar-toggle {
      width: 32px;
      height: 32px;
      padding: 0;
      border-radius: $border-radius-sm;
    }
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.3s ease;
  }

  .slide-enter-from,
  .slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
</style>
