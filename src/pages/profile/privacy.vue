<template>
  <div class="page">
    <NavBar title="隐私政策" type="gradient" titleAlign="left" />

    <div class="content">
      <div class="section">
        <div class="section-title">个人信息可见性</div>
        <div class="setting-list">
          <div class="setting-item">
            <div class="setting-info">
              <AppIcon name="user" class="setting-icon" />
              <div class="setting-text">
                <span class="setting-name">个人资料可见</span>
                <span class="setting-desc">允许其他用户查看您的个人资料</span>
              </div>
            </div>
            <div class="toggle-switch" :class="{ active: privacy.profileVisible }" @click="privacy.profileVisible = !privacy.profileVisible">
              <div class="toggle-thumb"></div>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <AppIcon name="map-pin" class="setting-icon" />
              <div class="setting-text">
                <span class="setting-name">位置信息</span>
                <span class="setting-desc">允许查看您的社区位置</span>
              </div>
            </div>
            <div class="toggle-switch" :class="{ active: privacy.locationVisible }" @click="privacy.locationVisible = !privacy.locationVisible">
              <div class="toggle-thumb"></div>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <AppIcon name="activity" class="setting-icon" />
              <div class="setting-text">
                <span class="setting-name">任务记录</span>
                <span class="setting-desc">允许其他用户查看您的任务完成记录</span>
              </div>
            </div>
            <div class="toggle-switch" :class="{ active: privacy.taskRecordVisible }" @click="privacy.taskRecordVisible = !privacy.taskRecordVisible">
              <div class="toggle-thumb"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">互动权限</div>
        <div class="setting-list">
          <div class="setting-item">
            <div class="setting-info">
              <AppIcon name="message-circle" class="setting-icon" />
              <div class="setting-text">
                <span class="setting-name">允许被联系</span>
                <span class="setting-desc">允许其他用户向您发送消息</span>
              </div>
            </div>
            <div class="toggle-switch" :class="{ active: privacy.allowContact }" @click="privacy.allowContact = !privacy.allowContact">
              <div class="toggle-thumb"></div>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <AppIcon name="handshake" class="setting-icon" />
              <div class="setting-text">
                <span class="setting-name">接受任务邀请</span>
                <span class="setting-desc">允许接收其他用户发布的任务邀请</span>
              </div>
            </div>
            <div class="toggle-switch" :class="{ active: privacy.acceptTaskInvite }" @click="privacy.acceptTaskInvite = !privacy.acceptTaskInvite">
              <div class="toggle-thumb"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">数据安全</div>
        <div class="setting-list">
          <div class="setting-item clickable" @click="clearCache">
            <div class="setting-info">
              <AppIcon name="trash" class="setting-icon" />
              <div class="setting-text">
                <span class="setting-name">清除缓存</span>
                <span class="setting-desc">清除本地缓存数据</span>
              </div>
            </div>
            <span class="setting-arrow">›</span>
          </div>
          <div class="setting-item clickable" @click="goToAccountSecurity">
            <div class="setting-info">
              <AppIcon name="lock" class="setting-icon" />
              <div class="setting-text">
                <span class="setting-name">账号安全</span>
                <span class="setting-desc">修改密码、绑定手机等</span>
              </div>
            </div>
            <span class="setting-arrow">›</span>
          </div>
        </div>
      </div>

      <div class="save-btn" @click="saveSettings">
        保存设置
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toastSuccess, toastInfo } from '../../utils/toast'
import { navigateBackSmart } from '../../utils/router'
import AppIcon from '../../components/AppIcon.vue'
import NavBar from '../../components/NavBar.vue'

const statusBarHeight = ref(20)

const privacy = ref({
  profileVisible: true,
  locationVisible: false,
  taskRecordVisible: true,
  allowContact: true,
  acceptTaskInvite: true
})

const goBack = () => {
  navigateBackSmart()
}

const clearCache = () => {
  toastInfo('缓存已清除')
}

const goToAccountSecurity = () => {
  toastInfo('账号安全功能即将上线')
}

const saveSettings = () => {
  toastSuccess('设置已保存')
  setTimeout(() => {
    goBack()
  }, 1000)
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

/* 自定义开关 */
.toggle-switch {
  position: relative;
  width: 48px;
  height: 26px;
  background: var(--color-border-light);
  border-radius: var(--radius-full);
  transition: all var(--transition-smooth);
  cursor: pointer;
}

.toggle-switch.active {
  background: var(--color-primary);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  background: var(--color-text-white);
  border-radius: var(--radius-full);
  transition: transform var(--transition-smooth);
  box-shadow: var(--shadow-sm);
}

.toggle-switch.active .toggle-thumb {
  transform: translateX(22px);
}

.content {
  padding: var(--spacing-lg);
}

.section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
  padding-left: var(--spacing-xs);
}

.setting-list {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
  transition: background-color var(--transition-fast);
}

.setting-item:hover {
  background-color: var(--color-bg-tertiary);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.clickable {
  cursor: pointer;
}

.setting-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.setting-icon {
  font-size: 20px;
  margin-right: var(--spacing-md);
}

.setting-text {
  display: flex;
  flex-direction: column;
}

.setting-name {
  font-size: 15px;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.setting-desc {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.setting-arrow {
  font-size: 18px;
  color: var(--color-text-muted);
}

.save-btn {
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-top: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-smooth);
}

.save-btn:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
</style>
