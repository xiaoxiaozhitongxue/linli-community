import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './styles/base.css'
import { setRouterInstance } from './utils/router'

// 路由配置
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/pages/index/index'
    },
    {
      path: '/pages/index/index',
      component: () => import('./pages/index/index.vue')
    },
    {
      path: '/pages/neighborhood/index',
      component: () => import('./pages/neighborhood/index.vue')
    },
    {
      path: '/pages/ai-helper/index',
      component: () => import('./pages/ai-helper/index.vue')
    },
    {
      path: '/pages/ai-helper/detail',
      component: () => import('./pages/ai-helper/detail.vue')
    },
    {
      path: '/pages/business/index',
      component: () => import('./pages/business/index.vue')
    },
    {
      path: '/pages/elderly/index',
      component: () => import('./pages/elderly/index.vue')
    },
    {
      path: '/pages/profile/index',
      component: () => import('./pages/profile/index.vue')
    },
    {
      path: '/pages/profile/edit',
      component: () => import('./pages/profile/edit.vue')
    },
    {
      path: '/pages/profile/my-posts',
      component: () => import('./pages/profile/my-posts.vue')
    },
    {
      path: '/pages/profile/my-activities',
      component: () => import('./pages/profile/my-activities.vue')
    },
    {
      path: '/pages/profile/my-favorites',
      component: () => import('./pages/profile/my-favorites.vue')
    },
    {
      path: '/pages/profile/settings',
      component: () => import('./pages/profile/settings.vue')
    },
    {
      path: '/pages/login/index',
      component: () => import('./pages/login/index.vue')
    },
    {
      path: '/pages/post/create',
      component: () => import('./pages/post/create.vue')
    },
    {
      path: '/pages/activities/create',
      component: () => import('./pages/activities/create.vue')
    },
    {
      path: '/pages/activities/detail',
      component: () => import('./pages/activities/detail.vue')
    }
  ]
})

setRouterInstance(router)

// 创建应用
const app = createApp(App)
app.use(router)
app.mount('#app')
