<template>
  <view class="page">
    <view class="login-container" :style="{ paddingTop: statusBarHeight + 60 + 'px' }">
      <!-- Logo区域 -->
      <view class="logo-section">
        <view class="logo">
          <text class="logo-emoji">🏘️</text>
        </view>
        <text class="app-name">邻里社区</text>
        <text class="app-slogan">连接邻里，共建美好社区</text>
      </view>

      <!-- 登录表单 -->
      <view class="form-section">
        <view class="input-group">
          <view class="input-label">手机号</view>
          <view class="input-row">
            <input 
              class="input-field" 
              type="number" 
              v-model="phone" 
              placeholder="请输入手机号"
              :maxlength="11"
            />
          </view>
        </view>

        <view class="input-group">
          <view class="input-label">验证码</view>
          <view class="input-row">
            <input 
              class="input-field" 
              type="number" 
              v-model="code" 
              placeholder="请输入验证码"
              :maxlength="6"
            />
            <view 
              class="code-btn" 
              :class="{ disabled: counting }"
              @click="sendCode"
            >
              {{ counting ? `${countdown}s` : '获取验证码' }}
            </view>
          </view>
        </view>

        <!-- 协议 -->
        <view class="agreement">
          <view 
            class="agreement-check" 
            :class="{ checked: agreed }"
            @click="agreed = !agreed"
          >
            <text v-if="agreed">✓</text>
          </view>
          <text class="agreement-text">
            同意并阅读<text class="agreement-link" @click.stop="showAgreement">《用户协议》</text>
            和<text class="agreement-link" @click.stop="showPrivacy">《隐私政策》</text>
          </text>
        </view>

        <!-- 登录按钮 -->
        <view class="login-btn" @click="handleLogin">
          <text>登录</text>
        </view>

        <!-- 其他登录方式 -->
        <view class="divider">
          <view class="divider-line"></view>
          <text class="divider-text">其他登录方式</text>
          <view class="divider-line"></view>
        </view>

        <view class="third-party">
          <view class="third-party-btn" @click="loginWithWechat">
            <text class="third-party-icon">💬</text>
            <text>微信</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const statusBarHeight = ref(20)
const phone = ref('')
const code = ref('')
const agreed = ref(false)
const counting = ref(false)
const countdown = ref(60)

const sendCode = () => {
  if (counting.value) return
  
  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
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
  
  uni.showToast({ title: '验证码已发送', icon: 'success' })
}

const handleLogin = () => {
  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  
  if (!code.value || code.value.length !== 6) {
    uni.showToast({ title: '请输入6位验证码', icon: 'none' })
    return
  }
  
  if (!agreed.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return
  }
  
  // 模拟登录
  uni.showLoading({ title: '登录中...' })
  
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '登录成功', icon: 'success' })
    
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1000)
  }, 1500)
}

const loginWithWechat = () => {
  uni.showToast({ title: '微信登录功能开发中', icon: 'none' })
}

const showAgreement = () => {
  uni.navigateTo({ url: '/pages/login/agreement?type=user' })
}

const showPrivacy = () => {
  uni.navigateTo({ url: '/pages/login/agreement?type=privacy' })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF8F0 0%, #FFFFFF 100%);
}

.login-container {
  padding: var(--spacing-lg);
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
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
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
}

.code-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.code-btn.disabled {
  background: var(--text-muted);
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
}

.third-party-icon {
  font-size: 32px;
  margin-bottom: var(--spacing-xs);
}
</style>
