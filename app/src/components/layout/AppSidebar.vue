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
    '/app/agent',
    '/app/resource',
    '/app/tool',
    '/app/semantic',
    '/app/log',
    '/app/settings'
  ])

  const isCollapsed = computed(() => appStore.isSidebarCollapsed)

  // 图标组件 - 统一风格：24x24 viewBox，stroke-width: 2，简洁线条

  // 平台概览：仪表盘 - 数据监控
  const DashboardIcon = () =>
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
        height: 4,
        rx: 1,
        stroke: 'currentColor',
        'stroke-width': 2
      })
    ])

  // 探索中心：对话气泡 - AI交互
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

  // 数字员工：机器人 - AI Agent
  const AppIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('rect', {
        x: 5,
        y: 7,
        width: 14,
        height: 10,
        rx: 3,
        stroke: 'currentColor',
        'stroke-width': 2
      }),
      h('circle', { cx: 9, cy: 12, r: 1.5, fill: 'currentColor' }),
      h('circle', { cx: 15, cy: 12, r: 1.5, fill: 'currentColor' }),
      h('path', {
        d: 'M9 16H15',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round'
      }),
      h('path', {
        d: 'M12 3V7',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round'
      }),
      h('circle', { cx: 12, cy: 3, r: 1.5, stroke: 'currentColor', 'stroke-width': 2 })
    ])

  // 定时任务：时钟 - 周期执行
  const ScheduleIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('circle', { cx: 12, cy: 12, r: 9, stroke: 'currentColor', 'stroke-width': 2 }),
      h('path', {
        d: 'M12 7V12L15 15',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round'
      })
    ])

  // 工具管理：扳手 - 工具集
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

  // 资源管理：堆叠层 - 资源库
  const ResourceIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('rect', {
        x: 4,
        y: 4,
        width: 16,
        height: 5,
        rx: 1,
        stroke: 'currentColor',
        'stroke-width': 2
      }),
      h('rect', {
        x: 4,
        y: 10,
        width: 16,
        height: 5,
        rx: 1,
        stroke: 'currentColor',
        'stroke-width': 2
      }),
      h('rect', {
        x: 4,
        y: 16,
        width: 16,
        height: 5,
        rx: 1,
        stroke: 'currentColor',
        'stroke-width': 2
      })
    ])

  // 语义管理：词典 - 语义词库
  const SemanticIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', {
        d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round'
      }),
      h('path', {
        d: 'M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z',
        stroke: 'currentColor',
        'stroke-width': 2
      }),
      h('line', { x1: 8, y1: 7, x2: 16, y2: 7, stroke: 'currentColor', 'stroke-width': 2 }),
      h('line', { x1: 8, y1: 12, x2: 16, y2: 12, stroke: 'currentColor', 'stroke-width': 2 }),
      h('line', { x1: 8, y1: 17, x2: 12, y2: 17, stroke: 'currentColor', 'stroke-width': 2 })
    ])

  // 日志管理：文档 - 运行记录
  const LogIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', {
        d: 'M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z',
        stroke: 'currentColor',
        'stroke-width': 2
      }),
      h('polyline', { points: '14,2 14,8 20,8', stroke: 'currentColor', 'stroke-width': 2 }),
      h('line', { x1: 8, y1: 13, x2: 16, y2: 13, stroke: 'currentColor', 'stroke-width': 2 }),
      h('line', { x1: 8, y1: 17, x2: 16, y2: 17, stroke: 'currentColor', 'stroke-width': 2 })
    ])

  // 系统配置：齿轮 - 参数设置
  const SettingsIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('circle', { cx: 12, cy: 12, r: 3, stroke: 'currentColor', 'stroke-width': 2 }),
      h('path', {
        d: 'M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round'
      })
    ])

  const menuItems = computed(() => [
    {
      key: 'overview',
      icon: DashboardIcon,
      title: t('route.overview'),
      path: '/app/overview'
    },
    {
      key: 'explore',
      icon: ChatIcon,
      title: t('route.explore'),
      path: '/app/explore'
    },
    {
      key: 'agent',
      icon: AppIcon,
      title: t('sidebar.agent'),
      path: '/app/agent'
    },
    {
      key: 'task',
      icon: ScheduleIcon,
      title: t('route.task'),
      path: '/app/task'
    },
    {
      key: 'tool',
      icon: ToolIcon,
      title: t('sidebar.toolManagement'),
      path: '/app/tool',
      children: [
        { key: 'skills', title: t('sidebar.skillManagement'), path: '/app/tool/skills' },
        { key: 'mcp', title: t('sidebar.mcpManagement'), path: '/app/tool/mcp' }
      ]
    },
    {
      key: 'resource',
      icon: ResourceIcon,
      title: t('sidebar.resource'),
      path: '/app/resource',
      children: [
        {
          key: 'components',
          title: t('sidebar.componentManagement'),
          path: '/app/resource/components'
        },
        { key: 'api', title: t('route.apiManagement'), path: '/app/resource/api' }
      ]
    },
    {
      key: 'semantic',
      icon: SemanticIcon,
      title: t('route.semantic'),
      path: '/app/semantic',
      children: [
        { key: 'vocabulary', title: t('route.vocabulary'), path: '/app/semantic/vocabulary' },
        { key: 'configModel', title: t('route.configModel'), path: '/app/semantic/configModel' }
      ]
    },
    {
      key: 'log',
      icon: LogIcon,
      title: t('route.log'),
      path: '/app/log',
      children: [
        { key: 'run-log', title: t('route.runLog'), path: '/app/log/operation' },
        { key: 'operation-log', title: t('route.operationLog'), path: '/app/log/system' }
      ]
    },
    {
      key: 'settings',
      icon: SettingsIcon,
      title: t('sidebar.settings'),
      path: '/app/settings',
      children: [
        { key: 'providers', title: t('sidebar.providers'), path: '/app/settings/providers' },
        { key: 'models', title: t('sidebar.modelManagement'), path: '/app/settings/models' }
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
    background: $bg-primary;
    border-right: 1px solid $border-color-base;
    display: flex;
    flex-direction: column;
    transition: width $transition-base $ease-out;

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
    height: 48px;
    padding: 0 $spacing-md;
    border-radius: $border-radius-md;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-fast $ease-out;
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
      background: $primary-surface;
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
      transition: transform $transition-fast $ease-out;
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
    border-left: 1px solid $border-color-light;
  }

  // 二级菜单项
  .nav-child {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 $spacing-md;
    border-radius: $border-radius-md;
    color: $text-tertiary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-fast $ease-out;
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
      background: $primary-surface;

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
    border-top: 1px solid $border-color-base;
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
    transition: all $transition-fast $ease-out;

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
      transition: transform $transition-base $ease-out;

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
    transition: all 0.2s $ease-out;
  }

  .slide-enter-from,
  .slide-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }

  // 响应式设计
  @include respond-below(md) {
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
