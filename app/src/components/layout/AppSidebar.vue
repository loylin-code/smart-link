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

  const expandedItems = ref<string[]>([
    '/app/application',
    '/app/resource',
    '/app/tool',
    '/app/settings'
  ])

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

  // Tool icon
  const ToolIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', {
        d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ])

  // Settings icon
  const SettingsIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('circle', {
        cx: 12,
        cy: 12,
        r: 3,
        stroke: 'currentColor',
        'stroke-width': 2
      }),
      h('path', {
        d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
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
        { path: '/app/application/design', title: t('sidebar.appDesign') }
      ]
    },
    {
      path: '/app/resource',
      title: t('sidebar.resource'),
      icon: ResourceIcon,
      children: [
        { path: '/app/resource/components', title: t('sidebar.componentManagement') },
        { path: '/app/resource/datamodel', title: t('sidebar.dataModel') }
      ]
    },
    {
      path: '/app/tool',
      title: t('sidebar.toolManagement'),
      icon: ToolIcon,
      children: [
        { path: '/app/tool/mcp', title: t('sidebar.mcpManagement') },
        { path: '/app/tool/skills', title: t('sidebar.skillsManagement') },
        { path: '/app/tool/models', title: t('sidebar.modelManagement') }
      ]
    },
    {
      path: '/app/settings',
      title: t('sidebar.settings'),
      icon: SettingsIcon,
      children: [
        { path: '/app/settings/appearance', title: t('sidebar.appearance') },
        { path: '/app/settings/providers', title: t('sidebar.providers') }
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
  @use '@/assets/styles/variables.scss' as *;

  .app-sidebar {
    width: $sidebar-width;
    height: calc(100vh - #{$header-height});
    background: $bg-primary;
    border-right: 1px solid $border-color-light;
    display: flex;
    flex-direction: column;
    transition: width $transition-base ease;
    box-shadow: 1px 0 0 0 $border-color-lighter;

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
        padding: $spacing-sm;
      }

      .nav-child {
        padding: $spacing-sm;
        justify-content: center;
      }
    }
  }

  .sidebar-nav {
    flex: 1;
    padding: $spacing-sm;
    overflow-y: auto;

    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: $border-color-base;
      border-radius: 2px;

      &:hover {
        background: $text-tertiary;
      }
    }
  }

  .nav-section {
    display: flex;
    flex-direction: column;
  }

  .nav-item-wrapper {
    margin-bottom: 2px;
  }

  // 一级菜单项
  .nav-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    height: 40px;
    padding: 0 $spacing-md;
    border-radius: $border-radius-md;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-fast ease;
    text-decoration: none;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    position: relative;
    user-select: none;

    &:hover {
      background: $bg-secondary;
      color: $text-primary;
    }

    &:active {
      background: $bg-tertiary;
    }

    &--active {
      background: rgba($primary-color, 0.08);
      color: $primary-color;

      .nav-item__icon {
        color: $primary-color;
      }

      // 左侧激活指示条
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        background: $primary-color;
        border-radius: 0 2px 2px 0;
      }
    }

    &--expanded {
      .nav-item__arrow {
        transform: rotate(90deg);
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
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__arrow {
      width: 16px;
      height: 16px;
      transition: transform $transition-fast ease;
      flex-shrink: 0;
    }
  }

  // 菜单组
  .nav-group {
    .nav-item {
      margin-bottom: 2px;
    }
  }

  // 二级菜单容器
  .nav-children {
    margin-left: $spacing-lg;
    margin-top: 2px;
    margin-bottom: 2px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-left: 4px;
    border-left: 1px solid $border-color-lighter;
  }

  // 二级菜单项 - 与一级菜单高度一致
  .nav-child {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 $spacing-md;
    border-radius: $border-radius-md;
    color: $text-tertiary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-fast ease;
    text-decoration: none;
    position: relative;
    user-select: none;

    &:hover {
      color: $text-primary;
      background: $bg-secondary;
    }

    &:active {
      background: $bg-tertiary;
    }

    &--active {
      color: $primary-color;
      background: rgba($primary-color, 0.06);

      // 左侧激活指示条
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 16px;
        background: $primary-color;
        border-radius: 0 2px 2px 0;
      }
    }

    &__text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  // 底部折叠按钮
  .sidebar-footer {
    padding: $spacing-sm;
    border-top: 1px solid $border-color-light;
    display: flex;
    justify-content: center;
  }

  .sidebar-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    height: 36px;
    padding: 0 $spacing-md;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-fast ease;

    &:hover {
      background: $bg-secondary;
      border-color: $primary-color;
      color: $primary-color;
    }

    &:active {
      background: $bg-tertiary;
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
      padding: $spacing-xs;
    }

    .sidebar-toggle {
      width: 36px;
      height: 36px;
      padding: 0;
      border-radius: $border-radius-md;
    }
  }

  // 过渡动画
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.2s ease;
  }

  .slide-enter-from,
  .slide-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }

  // 响应式设计
  @media (max-width: 768px) {
    .app-sidebar {
      width: $sidebar-collapsed-width;

      .nav-item__text,
      .nav-item__arrow,
      .nav-children,
      .toggle-text {
        display: none;
      }

      .nav-item,
      .nav-child {
        justify-content: center;
        padding: $spacing-sm;
      }
    }
  }
</style>
