import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { RouteMeta } from '@/types'
import i18n from '@/locales'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('@/views/welcome/WelcomePage.vue'),
    meta: {
      title: '欢迎 - SmartLink',
      titleKey: 'welcome.title'
    } as RouteMeta
  },
  {
    path: '/app',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/app/explore',
    children: [
      {
        path: 'explore',
        name: 'Explore',
        component: () => import('@/views/explore/ExploreView.vue'),
        meta: {
          title: '探索',
          titleKey: 'route.explore',
          icon: 'chat'
        } as RouteMeta
      },
      {
        path: 'application',
        name: 'Application',
        redirect: '/app/application/list',
        meta: {
          title: '应用管理',
          titleKey: 'route.application',
          icon: 'app'
        } as RouteMeta,
        children: [
          {
            path: 'list',
            name: 'AppList',
            component: () => import('@/views/application/AppRuntimeList.vue'),
            meta: {
              title: '应用列表',
              titleKey: 'route.appList',
              icon: 'app'
            } as RouteMeta
          },
          {
            path: 'design',
            name: 'AppDesign',
            component: () => import('@/views/application/AppDesignList.vue'),
            meta: {
              title: '应用设计',
              titleKey: 'route.appDesign',
              icon: 'app'
            } as RouteMeta
          },
          {
            path: 'design/create',
            name: 'AppCreate',
            component: () => import('@/views/application/AppOrchestration.vue'),
            meta: {
              title: '新建应用',
              titleKey: 'route.appCreate',
              icon: 'flow',
              hidden: true
            } as RouteMeta
          },
          {
            path: 'design/edit/:id',
            name: 'AppEdit',
            component: () => import('@/views/application/AppOrchestration.vue'),
            meta: {
              title: '编辑应用',
              titleKey: 'route.appEdit',
              icon: 'flow',
              hidden: true
            } as RouteMeta
          },
          {
            path: 'runtime/:id',
            name: 'AppRuntime',
            component: () => import('@/views/application/AppRuntime.vue'),
            meta: {
              title: '应用运行',
              titleKey: 'route.appRuntime',
              icon: 'app',
              hidden: true
            } as RouteMeta
          }
        ]
      },
      {
        path: 'resource',
        name: 'Resource',
        redirect: '/app/resource/components',
        meta: {
          title: '资源管理',
          icon: 'resource'
        } as RouteMeta,
        children: [
          {
            path: 'components',
            name: 'Components',
            component: () => import('@/views/resource/ComponentManagement.vue'),
            meta: {
              title: '组件管理',
              titleKey: 'route.components',
              icon: 'component'
            } as RouteMeta
          },
          {
            path: 'components/:type',
            name: 'ComponentDetail',
            component: () => import('@/views/resource/ComponentDetailPage.vue'),
            meta: {
              title: '组件详情',
              titleKey: 'route.componentDetail',
              icon: 'component',
              hidden: true
            } as RouteMeta
          },
          {
            path: 'datamodel',
            name: 'DataModel',
            component: () => import('@/views/resource/DataModelList.vue'),
            meta: {
              title: '数据模型',
              titleKey: 'route.dataModel',
              icon: 'data-model'
            } as RouteMeta
          },
          {
            path: 'datamodel/:id',
            name: 'DataModelDetail',
            component: () => import('@/views/resource/DataModelDetail.vue'),
            meta: {
              title: '数据模型详情',
              titleKey: 'route.dataModelDetail',
              icon: 'data-model',
              hidden: true
            } as RouteMeta
          }
        ]
      },
      {
        path: 'tool',
        name: 'Tool',
        redirect: '/app/tool/mcp',
        meta: {
          title: '工具管理',
          icon: 'tool'
        } as RouteMeta,
        children: [
          {
            path: 'mcp',
            name: 'MCP',
            component: () => import('@/views/resource/MCPManagement.vue'),
            meta: {
              title: 'MCP 管理',
              titleKey: 'route.mcp',
              icon: 'mcp'
            } as RouteMeta
          },
          {
            path: 'mcp/:id',
            name: 'MCPDetail',
            component: () => import('@/views/resource/MCPDetailPage.vue'),
            meta: {
              title: 'MCP 详情',
              titleKey: 'route.mcpDetail',
              icon: 'mcp',
              hidden: true
            } as RouteMeta
          },
          {
            path: 'skills',
            name: 'Skills',
            component: () => import('@/views/resource/SkillsManagement.vue'),
            meta: {
              title: 'Skills 管理',
              titleKey: 'route.skills',
              icon: 'skill'
            } as RouteMeta
          },
          {
            path: 'skills/:id',
            name: 'SkillDetail',
            component: () => import('@/views/resource/SkillDetailPage.vue'),
            meta: {
              title: 'Skill 详情',
              titleKey: 'route.skillDetail',
              icon: 'skill',
              hidden: true
            } as RouteMeta
          },
          {
            path: 'models',
            name: 'Models',
            component: () => import('@/views/resource/ModelManagement.vue'),
            meta: {
              title: '模型管理',
              titleKey: 'route.models',
              icon: 'model'
            } as RouteMeta
          },
          {
            path: 'models/:id',
            name: 'ModelDetail',
            component: () => import('@/views/resource/ModelDetailPage.vue'),
            meta: {
              title: '模型详情',
              titleKey: 'route.modelDetail',
              icon: 'model',
              hidden: true
            } as RouteMeta
          }
        ]
      },
      {
        path: 'settings',
        name: 'Settings',
        redirect: '/app/settings/appearance',
        meta: {
          title: '系统设置',
          titleKey: 'route.settings',
          icon: 'settings'
        } as RouteMeta,
        children: [
          {
            path: 'appearance',
            name: 'Appearance',
            component: () => import('@/views/settings/AppearanceSettings.vue'),
            meta: {
              title: '外观设置',
              titleKey: 'route.appearance',
              icon: 'appearance'
            } as RouteMeta
          },
          {
            path: 'providers',
            name: 'Providers',
            component: () => import('@/views/settings/ProviderSettings.vue'),
            meta: {
              title: '模型提供商',
              titleKey: 'route.providers',
              icon: 'provider'
            } as RouteMeta
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFound.vue'),
    meta: {
      title: '页面未找到',
      titleKey: 'route.notFound'
    } as RouteMeta
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  const titleKey = to.meta.titleKey as string | undefined
  const fallbackTitle = to.meta.title as string

  if (titleKey) {
    document.title = i18n.global.t(titleKey)
  } else if (fallbackTitle) {
    document.title = fallbackTitle
  }

  next()
})

export default router
