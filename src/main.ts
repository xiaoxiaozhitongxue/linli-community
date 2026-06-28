import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './styles/base.css'
import { setRouterInstance } from './utils/router'

// 路由配置
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/pages/index/index'
    },
    {
      path: '/pages/index/index',
      component: () => import('./pages/index/index.vue'),
      meta: { title: '首页', tabBar: true }
    },
    {
      path: '/pages/health/index',
      component: () => import('./pages/health/index.vue'),
      meta: { title: '健康打卡', tabBar: false }
    },
    {
      path: '/pages/activities/index',
      component: () => import('./pages/activities/index.vue'),
      meta: { title: '活动中心', requiresAuth: false }
    },
    {
      path: '/pages/ai-helper/index',
      component: () => import('./pages/ai-helper/index.vue'),
      meta: { title: 'AI助手', tabBar: true }
    },
    {
      path: '/pages/ai-helper/detail',
      component: () => import('./pages/ai-helper/detail.vue'),
      meta: { title: '互助详情', requiresAuth: false }
    },
    {
      path: '/pages/ai-helper/publish',
      component: () => import('./pages/ai-helper/publish.vue'),
      meta: { title: '发布互助', requiresAuth: true }
    },
    {
      path: '/pages/elderly/index',
      component: () => import('./pages/elderly/index.vue'),
      meta: { title: '养老服务', tabBar: false }
    },
    {
      path: '/pages/business/index',
      component: () => import('./pages/business/index.vue'),
      meta: { title: '社区创业', tabBar: false }
    },
    {
      path: '/pages/messages/index',
      component: () => import('./pages/messages/index.vue'),
      meta: { title: '消息', tabBar: true }
    },
    {
      path: '/pages/messages/chat',
      component: () => import('./pages/messages/chat.vue'),
      meta: { title: '聊天', tabBar: false }
    },
    {
      path: '/pages/messages/group',
      component: () => import('./pages/messages/group.vue'),
      meta: { title: '群聊', tabBar: false }
    },
    {
      path: '/pages/profile/index',
      component: () => import('./pages/profile/index.vue'),
      meta: { title: '我的', tabBar: true }
    },
    {
      path: '/pages/profile/edit',
      component: () => import('./pages/profile/edit.vue'),
      meta: { title: '编辑资料', requiresAuth: true }
    },
    {
      path: '/pages/profile/my-posts',
      component: () => import('./pages/profile/my-posts.vue'),
      meta: { title: '我的发布', requiresAuth: true }
    },
    {
      path: '/pages/profile/my-activities',
      component: () => import('./pages/profile/my-activities.vue'),
      meta: { title: '我的活动', requiresAuth: true }
    },
    {
      path: '/pages/profile/my-favorites',
      component: () => import('./pages/profile/my-favorites.vue'),
      meta: { title: '我的收藏', requiresAuth: true }
    },
    {
      path: '/pages/profile/my-tasks',
      component: () => import('./pages/profile/my-tasks.vue'),
      meta: { title: '我的任务', requiresAuth: true }
    },
    {
      path: '/pages/profile/notifications',
      component: () => import('./pages/profile/notifications.vue'),
      meta: { title: '消息通知', requiresAuth: true }
    },
    {
      path: '/pages/profile/privacy',
      component: () => import('./pages/profile/privacy.vue'),
      meta: { title: '隐私政策' }
    },
    {
      path: '/pages/profile/about',
      component: () => import('./pages/profile/about.vue'),
      meta: { title: '关于我们' }
    },
    {
      path: '/pages/profile/settings',
      component: () => import('./pages/profile/settings.vue'),
      meta: { title: '设置' }
    },
    {
      path: '/pages/login/index',
      component: () => import('./pages/login/index.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/pages/register/index',
      component: () => import('./pages/register/index.vue'),
      meta: { title: '注册' }
    },
    {
      path: '/pages/post/create',
      component: () => import('./pages/post/create.vue'),
      meta: { title: '发布动态', requiresAuth: true }
    },
    {
      path: '/pages/activities/create',
      component: () => import('./pages/activities/create.vue'),
      meta: { title: '创建活动', requiresAuth: true }
    },
    {
      path: '/pages/activities/detail',
      component: () => import('./pages/activities/detail.vue'),
      meta: { title: '活动详情', requiresAuth: false }
    },
    {
      path: '/pages/search/index',
      component: () => import('./pages/search/index.vue'),
      meta: { title: '搜索', tabBar: false }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/pages/index/index'
    }
  ],
  // 页面切换的滚动行为
  scrollBehavior(to: any, from: any, savedPosition: any) {
    // 如果有保存的位置（浏览器前进/后退），恢复到该位置
    if (savedPosition) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(savedPosition)
        }, 300) // 等待过渡动画完成
      })
    }
    // 默认滚动到顶部
    return { top: 0, behavior: 'smooth' }
  }
})

setRouterInstance(router)

// 创建应用
const app = createApp(App)
app.use(router)
app.mount('#app')
