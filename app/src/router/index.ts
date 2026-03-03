import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { RouteMeta } from '@/types'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('@/views/welcome/WelcomePage.vue'),
    meta: {
      title: '欢迎 - SmartLink'
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
          icon: 'chat'
        } as RouteMeta
      },
      {
        path: 'application',
        name: 'Application',
        redirect: '/app/application/list',
        meta: {
          title: '应用管理',
          icon: 'app'
        } as RouteMeta,
        children: [
          {
            path: 'list',
            name: 'AppList',
            component: () => import('@/views/application/AppManagement.vue'),
            meta: {
              title: '应用列表',
              icon: 'app'
            } as RouteMeta
          },
          {
            path: 'orchestration/:id?',
            name: 'AppOrchestration',
            component: () => import('@/views/application/AppOrchestration.vue'),
            meta: {
              title: '应用编排',
              icon: 'flow',
              hidden: true
            } as RouteMeta
          }
        ]
      },
      {
        path: 'resource',
        name: 'Resource',
        redirect: '/app/resource/skills',
        meta: {
          title: '资源管理',
          icon: 'resource'
        } as RouteMeta,
        children: [
          {
            path: 'skills',
            name: 'Skills',
            component: () => import('@/views/resource/SkillsManagement.vue'),
            meta: {
              title: 'Skills管理',
              icon: 'skill'
            } as RouteMeta
          },
          {
            path: 'mcp',
            name: 'MCP',
            component: () => import('@/views/resource/MCPManagement.vue'),
            meta: {
              title: 'MCP管理',
              icon: 'mcp'
            } as RouteMeta
          },
          {
            path: 'components',
            name: 'Components',
            component: () => import('@/views/resource/ComponentManagement.vue'),
            meta: {
              title: '前端组件管理',
              icon: 'component'
            } as RouteMeta
          },
          {
            path: 'components/:type',
            name: 'ComponentDetail',
            component: () => import('@/views/resource/ComponentDetailPage.vue'),
            meta: {
              title: '组件详情',
              icon: 'component',
              hidden: true
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
      title: '页面未找到'
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
  const title = to.meta.title as string
  if (title) {
    document.title = title
  }
  next()
})

export default router
