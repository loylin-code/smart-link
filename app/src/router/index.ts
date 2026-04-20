import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
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
    path: '/app/agent/run/:id',
    name: 'AgentRunner',
    component: () => import('@/views/agent/AgentRunner.vue'),
    meta: {
      title: '数字员工运行',
      titleKey: 'route.agentRunner',
      hidden: true
    } as RouteMeta
  },
  {
    path: '/app',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/app/overview',
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('@/views/overview/OverviewDashboard.vue'),
        meta: {
          title: '平台概览',
          titleKey: 'route.overview',
          icon: 'home'
        } as RouteMeta
      },
      {
        path: 'explore',
        name: 'Explore',
        component: () => import('@/views/explore/ExploreView.vue'),
        meta: {
          title: '探索中心',
          titleKey: 'route.explore',
          icon: 'chat'
        } as RouteMeta
      },
      {
        path: 'agent',
        name: 'Agent',
        meta: {
          title: '数字员工管理',
          titleKey: 'route.agentManagement',
          icon: 'app'
        } as RouteMeta,
        children: [
          {
            path: '',
            name: 'AgentManagement',
            component: () => import('@/views/agent/AgentManagement.vue'),
            meta: {
              title: '数字员工管理',
              titleKey: 'route.agentManagement',
              icon: 'app'
            } as RouteMeta
          },
          {
            path: 'edit/:id',
            name: 'AgentDesignEdit',
            component: () => import('@/views/agent/AgentDesignPage.vue'),
            meta: {
              title: '编辑数字员工',
              titleKey: 'route.agentEdit',
              icon: 'app',
              hidden: true
            } as RouteMeta
          },
          {
            path: 'runtime/:id',
            name: 'AgentRuntime',
            component: () => import('@/views/agent/AgentRuntime.vue'),
            meta: {
              title: '数字员工运行',
              titleKey: 'route.agentRuntime',
              icon: 'app',
              hidden: true
            } as RouteMeta
          },
          {
            path: 'view/:agentId/:viewId',
            name: 'ViewOrchestration',
            component: () => import('@/views/agent/ViewOrchestration.vue'),
            meta: {
              title: '视图编排',
              titleKey: 'route.viewOrchestration',
              icon: 'flow',
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
            path: 'api',
            name: 'API',
            component: () => import('@/views/resource/APIManagement.vue'),
            meta: {
              title: 'API 管理',
              titleKey: 'route.api',
              icon: 'api'
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
          }
        ]
      },
      {
        path: 'semantic',
        name: 'Semantic',
        redirect: '/app/semantic/vocabulary',
        meta: {
          title: '语义管理',
          titleKey: 'route.semantic',
          icon: 'semantic'
        } as RouteMeta,
        children: [
          {
            path: 'vocabulary',
            name: 'Vocabulary',
            component: () => import('@/views/semantic/SemanticModel.vue'),
            meta: {
              title: '语义词库',
              titleKey: 'route.vocabulary',
              icon: 'vocabulary'
            } as RouteMeta
          },
          {
            path: 'configModel',
            name: 'ConfigModel',
            component: () => import('@/views/resource/DataModelList.vue'),
            meta: {
              title: '配置模型',
              titleKey: 'route.configModel',
              icon: 'model'
            } as RouteMeta
          },
          {
            path: 'configModel/:id',
            name: 'ConfigModelDetail',
            component: () => import('@/views/resource/DataModelDetail.vue'),
            meta: {
              title: '配置模型详情',
              titleKey: 'route.configModelDetail',
              icon: 'model',
              hidden: true
            } as RouteMeta
          }
        ]
      },
      {
        path: 'log',
        name: 'Log',
        redirect: '/app/log/operation',
        meta: {
          title: '日志管理',
          titleKey: 'route.log',
          icon: 'log'
        } as RouteMeta,
        children: [
          {
            path: 'operation',
            name: 'OperationLog',
            component: () => import('@/views/log/OperationLog.vue'),
            meta: {
              title: '运行日志',
              titleKey: 'route.runLog',
              icon: 'operation'
            } as RouteMeta
          },
          {
            path: 'system',
            name: 'SystemLog',
            component: () => import('@/views/log/SystemLog.vue'),
            meta: {
              title: '操作日志',
              titleKey: 'route.operationLog',
              icon: 'system'
            } as RouteMeta
          }
        ]
      },
      {
        path: 'task',
        name: 'Task',
        component: () => import('@/views/task/TaskManagement.vue'),
        meta: {
          title: '定时任务',
          titleKey: 'route.task',
          icon: 'task'
        } as RouteMeta
      },
      {
        path: 'settings',
        name: 'Settings',
        redirect: '/app/settings/models',
        meta: {
          title: '系统设置',
          titleKey: 'route.settings',
          icon: 'settings'
        } as RouteMeta,
        children: [
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
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
