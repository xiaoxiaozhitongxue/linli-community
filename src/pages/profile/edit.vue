<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="back-btn" @click="goBack">
          <text>←</text>
        </view>
        <text class="navbar-title">编辑资料</text>
        <view class="save-btn" @click="saveProfile">
          保存
        </view>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <!-- 头像区域 -->
      <view class="avatar-section">
        <view class="avatar-wrapper" @click="chooseAvatar">
          <image class="avatar" :src="form.avatar || 'https://i.pravatar.cc/100?img=10'" mode="aspectFill" />
          <view class="avatar-overlay">
            <text class="camera-icon">📷</text>
          </view>
        </view>
        <text class="avatar-tip">点击更换头像</text>
      </view>

      <!-- 表单区域 -->
      <view class="form-section">
        <view class="form-item">
          <text class="form-label">昵称</text>
          <input class="form-input" v-model="form.nickname" placeholder="请输入昵称" />
        </view>

        <view class="form-item">
          <text class="form-label">性别</text>
          <view class="gender-picker">
            <view class="gender-option" :class="{ active: form.gender === 'male' }" @click="selectGender('male')">
              男
            </view>
            <view class="gender-option" :class="{ active: form.gender === 'female' }" @click="selectGender('female')">
              女
            </view>
            <view class="gender-option" :class="{ active: form.gender === 'other' }" @click="selectGender('other')">
              保密
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">生日</text>
          <picker mode="date" :value="form.birthday" @change="onBirthdayChange">
            <view class="picker-value">
              {{ form.birthday || '请选择生日' }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">社区</text>
          <input class="form-input" v-model="form.community" placeholder="请输入社区名称" />
        </view>

        <view class="form-item">
          <text class="form-label">地址</text>
          <input class="form-input" v-model="form.address" placeholder="请输入详细地址" />
        </view>

        <view class="form-item">
          <text class="form-label">个性签名</text>
          <textarea class="form-textarea" v-model="form.bio" placeholder="介绍一下自己吧" maxlength="100" />
        </view>

        <view class="form-item">
          <text class="form-label">身份角色</text>
          <view class="role-picker">
            <view class="role-option" :class="{ active: form.role === 'resident' }" @click="selectRole('resident')">
              <text class="role-icon">🏠</text>
              <text>居民</text>
            </view>
            <view class="role-option" :class="{ active: form.role === 'volunteer' }" @click="selectRole('volunteer')">
              <text class="role-icon">❤️</text>
              <text>志愿者</text>
            </view>
            <view class="role-option" :class="{ active: form.role === 'merchant' }" @click="selectRole('merchant')">
              <text class="role-icon">🏪</text>
              <text>商家</text>
            </view>
            <view class="role-option" :class="{ active: form.role === 'elderly' }" @click="selectRole('elderly')">
              <text class="role-icon">👴</text>
              <text>老人</text>
            </view>
          </view>
        </view>
      </view>

      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../../store/index'
import { userApi } from '../../utils/api'

const { user, updateUser } = useAuth()
const statusBarHeight = ref(20)
const loading = ref(false)

const form = ref({
  nickname: '',
  avatar: '',
  gender: undefined as 'male' | 'female' | 'other' | undefined,
  birthday: '',
  community: '',
  address: '',
  bio: '',
  role: 'resident' as const
})

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  if (user.value) {
    form.value = {
      nickname: user.value.nickname || '',
      avatar: user.value.avatar || '',
      gender: user.value.gender,
      birthday: user.value.birthday || '',
      community: user.value.community || '',
      address: user.value.address || '',
      bio: user.value.bio || '',
      role: user.value.role || 'resident'
    }
  }
})

const goBack = () => {
  uni.navigateBack()
}

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.value.avatar = res.tempFilePaths[0]
    }
  })
}

const selectGender = (gender: 'male' | 'female' | 'other') => {
  form.value.gender = gender
}

const onBirthdayChange = (e: any) => {
  form.value.birthday = e.detail.value
}

const selectRole = (role: 'resident' | 'volunteer' | 'merchant' | 'elderly') => {
  form.value.role = role
}

const saveProfile = async () => {
  if (!form.value.nickname.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  try {
    loading.value = true
    uni.showLoading({ title: '保存中...' })
    
    const updatedUser = await userApi.updateProfile(form.value)
    updateUser(updatedUser)
    
    uni.hideLoading()
    uni.showToast({ title: '保存成功', icon: 'success' })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    console.error('保存失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

/* 导航栏 */
.navbar {
  background: var(--card-bg);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 44px;
}

.back-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.navbar-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.save-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.content {
  height: calc(100vh - 60px);
}

/* 头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  background: var(--card-bg);
  margin-bottom: 12px;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 12px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid var(--border-color);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:active .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  font-size: 32px;
}

.avatar-tip {
  font-size: 13px;
  color: var(--text-muted);
}

/* 表单区域 */
.form-section {
  background: var(--card-bg);
  padding: 0 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
  font-size: 15px;
  color: var(--text-primary);
  padding: 10px 0;
}

.form-textarea {
  font-size: 15px;
  color: var(--text-primary);
  padding: 10px 0;
  min-height: 80px;
  line-height: 1.6;
}

.picker-value {
  font-size: 15px;
  color: var(--text-primary);
  padding: 10px 0;
}

/* 性别选择 */
.gender-picker {
  display: flex;
  gap: 12px;
}

.gender-option {
  flex: 1;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  text-align: center;
  font-size: 15px;
  color: var(--text-secondary);
  transition: all 0.3s;
}

.gender-option.active {
  border-color: var(--primary-color);
  background: rgba(255, 140, 66, 0.1);
  color: var(--primary-color);
  font-weight: 500;
}

/* 角色选择 */
.role-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.role-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.3s;
}

.role-option.active {
  border-color: var(--primary-color);
  background: rgba(255, 140, 66, 0.1);
}

.role-option.active .role-icon {
  transform: scale(1.1);
}

.role-icon {
  font-size: 28px;
  margin-bottom: 8px;
  transition: transform 0.3s;
}

.role-option text:nth-child(2) {
  font-size: 13px;
  color: var(--text-secondary);
}

.role-option.active text:nth-child(2) {
  color: var(--primary-color);
  font-weight: 500;
}
</style>
