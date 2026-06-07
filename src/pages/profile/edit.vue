<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="navbar-content">
        <div class="back-btn" @click="goBack">
          <span>←</span>
        </div>
        <span class="navbar-title">编辑资料</span>
        <div class="save-btn" @click="saveProfile">
          保存
        </div>
      </div>
    </div>

    <div class="scroll-content">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-wrapper" @click="chooseAvatar">
          <img class="avatar" :src="form.avatar || 'https://i.pravatar.cc/100?img=10'" alt="头像" />
          <div class="avatar-overlay">
            <span class="camera-icon">📷</span>
          </div>
        </div>
        <span class="avatar-tip">点击更换头像</span>
        <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="onAvatarChange" />
      </div>

      <!-- 表单区域 -->
      <div class="form-section">
        <div class="form-item">
          <span class="form-label">昵称</span>
          <input class="form-input" v-model="form.nickname" placeholder="请输入昵称" />
        </div>

        <div class="form-item">
          <span class="form-label">性别</span>
          <div class="gender-picker">
            <div class="gender-option" :class="{ active: form.gender === 'male' }" @click="selectGender('male')">
              男
            </div>
            <div class="gender-option" :class="{ active: form.gender === 'female' }" @click="selectGender('female')">
              女
            </div>
            <div class="gender-option" :class="{ active: form.gender === 'other' }" @click="selectGender('other')">
              保密
            </div>
          </div>
        </div>

        <div class="form-item">
          <span class="form-label">生日</span>
          <input type="date" class="form-input" v-model="form.birthday" />
        </div>

        <div class="form-item">
          <span class="form-label">社区</span>
          <input class="form-input" v-model="form.community" placeholder="请输入社区名称" />
        </div>

        <div class="form-item">
          <span class="form-label">地址</span>
          <input class="form-input" v-model="form.address" placeholder="请输入详细地址" />
        </div>

        <div class="form-item">
          <span class="form-label">个性签名</span>
          <textarea class="form-textarea" v-model="form.bio" placeholder="介绍一下自己吧" maxlength="100" />
        </div>

        <div class="form-item">
          <span class="form-label">身份角色</span>
          <div class="role-picker">
            <div class="role-option" :class="{ active: form.role === 'resident' }" @click="selectRole('resident')">
              <span class="role-icon">🏠</span>
              <span>居民</span>
            </div>
            <div class="role-option" :class="{ active: form.role === 'volunteer' }" @click="selectRole('volunteer')">
              <span class="role-icon">❤️</span>
              <span>志愿者</span>
            </div>
            <div class="role-option" :class="{ active: form.role === 'merchant' }" @click="selectRole('merchant')">
              <span class="role-icon">🏪</span>
              <span>商家</span>
            </div>
            <div class="role-option" :class="{ active: form.role === 'elderly' }" @click="selectRole('elderly')">
              <span class="role-icon">👴</span>
              <span>老人</span>
            </div>
          </div>
        </div>
      </div>

      <div class="safe-area-bottom"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../../store/index'
import { userApi } from '../../utils/api'
import { navigateBack } from '../../utils/router'
import { toastSuccess, toastError } from '../../utils/toast'
import { showLoading, hideLoading } from '../../utils/ui'

const { user, updateUser } = useAuth()
const statusBarHeight = ref(20)
const loading = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

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
  statusBarHeight.value = 20
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
  navigateBack()
}

const chooseAvatar = () => {
  avatarInput.value?.click()
}

const onAvatarChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      form.value.avatar = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const selectGender = (gender: 'male' | 'female' | 'other') => {
  form.value.gender = gender
}

const selectRole = (role: 'resident' | 'volunteer' | 'merchant' | 'elderly') => {
  form.value.role = role
}

const saveProfile = async () => {
  if (!form.value.nickname.trim()) {
    toastError('请输入昵称')
    return
  }

  try {
    loading.value = true
    showLoading('保存中...')

    const updatedUser = await userApi.updateProfile(form.value)
    updateUser(updatedUser)

    hideLoading()
    toastSuccess('保存成功')

    setTimeout(() => {
      navigateBack()
    }, 1500)
  } catch (error) {
    hideLoading()
    toastError('保存失败')
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
  cursor: pointer;
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
  cursor: pointer;
}

.scroll-content {
  overflow-y: auto;
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
  cursor: pointer;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid var(--border-color);
  object-fit: cover;
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

.avatar-wrapper:hover .avatar-overlay {
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
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
}

.form-textarea {
  font-size: 15px;
  color: var(--text-primary);
  padding: 10px 0;
  min-height: 80px;
  line-height: 1.6;
  border: none;
  outline: none;
  background: transparent;
  resize: none;
  width: 100%;
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
  cursor: pointer;
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
  cursor: pointer;
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

.role-option span:nth-child(2) {
  font-size: 13px;
  color: var(--text-secondary);
}

.role-option.active span:nth-child(2) {
  color: var(--primary-color);
  font-weight: 500;
}
</style>