import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './styles/base.css'
import { setRouterInstance } from './utils/router'

/**
 * 全局错误兜底提示：渲染/逻辑异常时不再白屏，直接以原生 DOM 弹出 toast。
 * 使用原生 DOM 而非组件 toast，确保即便 Vue 渲染链路异常也能正常显示。
 */
function showGlobalErrorToast(message: string): void {
  try {
    const container = document.createElement('div')
    container.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:80px',
      'transform:translateX(-50%)',
      'max-width:80%',
      'background:rgba(0,0,0,0.8)',
      'color:#fff',
      'padding:10px 16px',
      'border-radius:8px',
      'font-size:14px',
      'z-index:99999',
      'box-shadow:0 4px 12px rgba(0,0,0,0.3)'
    ].join(';')
    container.textContent = '出错了：' + (message || '未知错误')
    document.body.appendChild(container)
    window.setTimeout(() => {
      if (container.parentNode) container.parentNode.removeChild(container)
    }, 4000)
  } catch {
    // 兜底中的兜底，避免二次异常
  }
}

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
    // ===================== 养老服务子页面（B3：修复导航死链）=====================
    {
      path: '/pages/elderly/service-request',
      component: () => import('./pages/elderly/service-request.vue'),
      meta: { title: '服务申请', tabBar: false }
    },
    {
      path: '/pages/elderly/become-volunteer',
      component: () => import('./pages/elderly/become-volunteer.vue'),
      meta: { title: '成为志愿者', tabBar: false }
    },
    {
      path: '/pages/elderly/tip-detail',
      component: () => import('./pages/elderly/tip-detail.vue'),
      meta: { title: '关怀技巧', tabBar: false }
    },
    {
      path: '/pages/elderly/all-records',
      component: () => import('./pages/elderly/all-records.vue'),
      meta: { title: '帮扶记录', tabBar: false }
    },
    // ===================== 社区创业子页面（B3：修复导航死链）=====================
    {
      path: '/pages/business/edit-shop',
      component: () => import('./pages/business/edit-shop.vue'),
      meta: { title: '编辑小店', tabBar: false }
    },
    {
      path: '/pages/business/manage-products',
      component: () => import('./pages/business/manage-products.vue'),
      meta: { title: '商品管理', tabBar: false }
    },
    {
      path: '/pages/business/publish',
      component: () => import('./pages/business/publish.vue'),
      meta: { title: '发布商品', tabBar: false }
    },
    {
      path: '/pages/business/orders',
      component: () => import('./pages/business/orders.vue'),
      meta: { title: '我的订单', tabBar: false }
    },
    {
      path: '/pages/business/analytics',
      component: () => import('./pages/business/analytics.vue'),
      meta: { title: '数据统计', tabBar: false }
    },
    {
      path: '/pages/business/guide',
      component: () => import('./pages/business/guide.vue'),
      meta: { title: '创业指南', tabBar: false }
    },
    {
      path: '/pages/business/all-products',
      component: () => import('./pages/business/all-products.vue'),
      meta: { title: '全部商品', tabBar: false }
    },
    {
      path: '/pages/business/product',
      component: () => import('./pages/business/product.vue'),
      meta: { title: '商品详情', tabBar: false }
    },
    {
      path: '/pages/business/shop-detail',
      component: () => import('./pages/business/shop-detail.vue'),
      meta: { title: '店铺详情', tabBar: false }
    },
    {
      path: '/pages/business/story',
      component: () => import('./pages/business/story.vue'),
      meta: { title: '创业故事', tabBar: false }
    },
    // ===================== 帖子详情（B4）=====================
    {
      path: '/pages/post/detail',
      component: () => import('./pages/post/detail.vue'),
      meta: { title: '帖子详情', tabBar: false }
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

// 全局错误处理器：捕获渲染与逻辑错误，弹出提示而非白屏
app.config.errorHandler = (err: unknown, _instance: unknown, info: string) => {
  console.error('[GlobalError]', err, info)
  const message = err instanceof Error ? err.message : String(err)
  showGlobalErrorToast(message)
}

app.mount('#app')
