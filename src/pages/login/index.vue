<template>
  <div class="page">
    <div class="login-container">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo">
          <span class="logo-emoji">🏘️</span>
        </div>
        <span class="app-name">邻里社区</span>
        <span class="app-slogan">连接邻里，共建美好社区</span>
      </div>

      <!-- 登录表单 -->
      <div class="form-section">
        <div class="input-group">
          <div class="input-label">手机号</div>
          <div class="input-row">
            <input 
              class="input-field" 
              type="number" 
              v-model="phone" 
              placeholder="请输入手机号"
              maxlength="11"
            />
          </div>
        </div>

        <div class="input-group">
          <div class="input-label">验证码</div>
          <div class="input-row">
            <input 
              class="input-field" 
              type="number" 
              v-model="code" 
              placeholder="请输入验证码"
              maxlength="6"
            />
            <div 
              class="code-btn" 
              :class="{ disabled: counting }"
              @click="sendCode"
            >
              {{ counting ? `${countdown}s` : '获取验证码' }}
            </div>
          </div>
        </div>

        <!-- 协议 -->
        <div class="agreement">
          <div 
            class="agreement-check" 
            :class="{ checked: agreed }"
            @click="agreed = !agreed"
          >
            <span v-if="agreed">✓</span>
          </div>
          <span class="agreement-text">
            同意并阅读<span class="agreement-link" @click.stop="showAgreement">《用户协议》</span>
            和<span class="agreement-link" @click.stop="showPrivacy">《隐私政策》</span>
          </span>
        </div>

        <!-- 登录按钮 -->
        <div class="login-btn" @click="handleLogin">
          <span>登录</span>
        </div>

        <!-- 演示账号快捷登录 -->
        <div class="demo-section">
          <div class="divider">
            <div class="divider-line"></div>
            <span class="divider-text">演示账号</span>
            <div class="divider-line"></div>
          </div>
          <div class="demo-btn" @click="demoLogin">
            <span class="demo-icon">🚀</span>
            <span class="demo-text">一键体验（免登录）</span>
          </div>
          <div class="demo-hint">
            手机号：13800138000 | 验证码：123456
          </div>
        </div>

        <!-- 其他登录方式 -->
        <div class="divider">
          <div class="divider-line"></div>
          <span class="divider-text">其他登录方式</span>
          <div class="divider-line"></div>
        </div>

        <div class="third-party">
          <div class="third-party-btn" @click="loginWithWechat">
            <span class="third-party-icon">💬</span>
            <span>微信</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toastSuccess, toastError, toastInfo } from '../../utils/toast'
import { navigateTo, switchTab } from '../../utils/router'
import { showLoading, hideLoading } from '../../utils/ui'
import { useAuth } from '../../store'
import { authApi } from '../../utils/api'

const { setUser } = useAuth()
const phone = ref('')
const code = ref('')
const agreed = ref(false)
const counting = ref(false)
const countdown = ref(60)

const sendCode = () => {
  if (counting.value) return
  
  if (!phone.value || phone.value.length !== 11) {
    toastError('请输入正确的手机号')
    return
  }
  
  counting.value = true
  countdown.value = 60
  
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      counting.value = false
      clearInterval(timer)
    }
  }, 1000)
  
  toastSuccess('验证码已发送（测试验证码：123456）')
}

const handleLogin = async () => {
  if (!phone.value || phone.value.length !== 11) {
    toastError('请输入正确的手机号')
    return
  }
  
  if (!code.value || code.value.length !== 6) {
    toastError('请输入6位验证码')
    return
  }
  
  if (!agreed.value) {
    toastError('请先同意用户协议')
    return
  }
  
  // 验证测试验证码
  if (code.value !== '123456') {
    toastError('验证码不正确，请使用 123456 进行测试')
    return
  }
  
  try {
    showLoading('登录中...')
    
    const result: any = await authApi.login({ code: code.value })
    setUser(result.user, result.token)
    
    hideLoading()
    toastSuccess('登录成功')
    
    setTimeout(() => {
      switchTab('/pages/index/index')
    }, 1000)
  } catch (error) {
    hideLoading()
    toastError('登录失败，请重试')
    console.error('Login error:', error)
  }
}

const demoLogin = () => {
  showLoading('登录中...')
  
  const demoUser = {
    id: 'demo_001',
    phone: '13800138000',
    nickname: '邻里小明',
    avatar: '',
    community: '阳光社区',
    bio: '热爱社区，乐于助人',
    role: 'volunteer' as const,
    credit_score: 95,
    is_verified: true,
    created_at: Date.now(),
    updated_at: Date.now(),
    last_active_at: Date.now()
  }
  
  setUser(demoUser, 'demo_token_' + Date.now())
  
  setTimeout(() => {
    hideLoading()
    toastSuccess('欢迎回来，邻里小明！')
    setTimeout(() => {
      switchTab('/pages/index/index')
    }, 800)
  }, 500)
}

const loginWithWechat = () => {
  toastError('微信登录功能开发中')
}

const showAgreement = () => {
  toastInfo('用户协议页面开发中')
}

const showPrivacy = () => {
  toastInfo('隐私政策页面开发中')
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF8F0 0%, #FFFFFF 100%);
}

.login-container {
  padding: var(--spacing-lg);
  padding-top: 60px;
}

/* Logo区域 */
.logo-section {
  text-align: center;
  margin-bottom: var(--spacing-xxl);
}

.logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md);
  box-shadow: 0 8px 24px rgba(255, 140, 66, 0.3);
}

.logo-emoji {
  font-size: 40px;
}

.app-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  margin-bottom: var(--spacing-sm);
}

.app-slogan {
  font-size: 14px;
  color: var(--text-muted);
}

/* 表单区域 */
.form-section {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.input-group {
  margin-bottom: var(--spacing-lg);
}

.input-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.input-row {
  display: flex;
  align-items: center;
  background: var(--bg-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.input-field {
  flex: 1;
  font-size: 15px;
  color: var(--text-primary);
  border: none;
  background: transparent;
  outline: none;
}

.code-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.3s;
}

.code-btn.disabled {
  background: var(--text-muted);
  cursor: not-allowed;
}

/* 协议 */
.agreement {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
}

.agreement-check {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  margin-right: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  flex-shrink: 0;
  margin-top: 2px;
  cursor: pointer;
}

.agreement-check.checked {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.agreement-text {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

.agreement-link {
  color: var(--primary-color);
  cursor: pointer;
}

/* 登录按钮 */
.login-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: var(--spacing-lg);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 140, 66, 0.3);
}

/* 分隔符 */
.divider {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.divider-text {
  font-size: 12px;
  color: var(--text-muted);
  padding: 0 var(--spacing-md);
}

/* 第三方登录 */
.third-party {
  display: flex;
  justify-content: center;
}

.third-party-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  cursor: pointer;
  transition: transform 0.2s;
}

.third-party-btn:hover {
  transform: scale(1.05);
}

.third-party-icon {
  font-size: 32px;
  margin-bottom: var(--spacing-xs);
}

/* 演示账号 */
.demo-section {
  margin-bottom: var(--spacing-lg);
}

.demo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 14px;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: var(--spacing-sm);
}

.demo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.demo-icon {
  font-size: 20px;
}

.demo-text {
  font-size: 15px;
}

.demo-hint {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  padding: 4px 0;
}
</style>
