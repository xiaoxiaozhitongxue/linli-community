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
          <div class="avatar-wrap" v-if="form.avatar">
            <img class="avatar" :src="form.avatar" alt="头像" />
          </div>
          <div v-else class="avatar avatar-placeholder">{{ (user?.nickname || '邻').charAt(0) }}</div>
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
import { userService } from '../../services/userService'
import type { User } from '../../types/models'
import { navigateBackSmart } from '../../utils/router'
import { toastSuccess, toastError } from '../../utils/toast'

const { user, updateUser } = useAuth()
const statusBarHeight = ref(20)
const saving = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

const form = ref({
  nickname: '',
  avatar: '',
  gender: undefined as 'male' | 'female' | 'other' | undefined,
  birthday: '',
  community: '',
  address: '',
  bio: '',
  role: 'resident'
})

const formErrors = ref<Record<string, string>>({})

const validateForm = (): boolean => {
  const errors: Record<string, string> = {}
  if (!form.value.nickname.trim()) {
    errors.nickname = '请输入昵称'
  } else if (form.value.nickname.trim().length > 20) {
    errors.nickname = '昵称不能超过20个字符'
  }
  if (form.value.bio && form.value.bio.length > 100) {
    errors.bio = '个性签名不能超过100个字符'
  }
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

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
  navigateBackSmart()
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
  if (!validateForm()) {
    const firstError = Object.values(formErrors.value)[0]
    if (firstError) toastError(firstError)
    return
  }

  try {
    saving.value = true
    const updatedUser = await userService.updateProfile(form.value as Partial<User>)
    updateUser(updatedUser)
    toastSuccess('保存成功')
    setTimeout(() => {
      navigateBackSmart()
    }, 1500)
  } catch {
    toastError('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

/* 导航栏 */
.navbar {
  background: var(--color-bg-secondary);
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
  border-radius: var(--radius-full);
  transition: background-color var(--transition-fast);
}

.back-btn:hover {
  background-color: var(--color-bg-tertiary);
}

.navbar-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.save-btn {
  padding: 8px 16px;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-smooth);
}

.save-btn:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
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
  background: var(--color-bg-secondary);
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
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
  border-radius: var(--radius-full);
  border: 3px solid var(--color-border-light);
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-bg-overlay);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  font-size: 32px;
}

.avatar-tip {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

/* 表单区域 */
.form-section {
  background: var(--color-bg-secondary);
  padding: 0 16px;
  box-shadow: var(--shadow-sm);
}

.form-item {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  font-size: 14px;
  color: var(--color-text-primary);
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
  font-size: 15px;
  color: var(--color-text-primary);
  padding: 10px 0;
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
}

.form-textarea {
  font-size: 15px;
  color: var(--color-text-primary);
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
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  text-align: center;
  font-size: 15px;
  color: var(--color-text-secondary);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.gender-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 500;
}

.gender-option:hover {
  background-color: var(--color-bg-tertiary);
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
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.role-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.role-option.active .role-icon {
  transform: scale(1.1);
}

.role-option:hover {
  background-color: var(--color-bg-tertiary);
}

.role-icon {
  font-size: 28px;
  margin-bottom: 8px;
  transition: transform var(--transition-normal);
}

.role-option span:nth-child(2) {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.role-option.active span:nth-child(2) {
  color: var(--color-primary);
  font-weight: 500;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-soft, rgba(255,107,53,0.1));
  color: var(--color-primary, #FF6B35);
  font-size: 14px;
  font-weight: 600;
}
</style>