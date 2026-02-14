import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '../views/ChatView.vue'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/chat',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        title: '登录 - 聊天系统',
        requiresAuth: false,
      },
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
      meta: {
        title: '角色对话模拟器',
        requiresAuth: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/login',
    },
  ],
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // 获取认证状态
  const authStore = useAuthStore()

  // 初始化认证状态（从本地存储恢复）
  if (!authStore.isAuthenticated) {
    authStore.initAuth()
  }

  // 检查是否需要认证
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth) {
    // 需要认证的页面
    if (authStore.isAuthenticated) {
      // 已登录，验证token有效性
      const isValid = await authStore.validateToken()
      if (isValid) {
        next()
      } else {
        // token无效，跳转到登录页
        next('/login')
      }
    } else {
      // 未登录，跳转到登录页
      next('/login')
    }
  } else {
    // 不需要认证的页面（如登录页）
    if (authStore.isAuthenticated) {
      // 已登录用户访问登录页，跳转到聊天页面
      if (to.name === 'login') {
        next('/chat')
      } else {
        next()
      }
    } else {
      // 未登录，允许访问
      next()
    }
  }
})

export default router
