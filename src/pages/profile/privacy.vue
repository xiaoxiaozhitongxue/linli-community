<template>
  <div class="page">
    <div class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-content">
        <span class="back-btn" @click="goBack">‹</span>
        <span class="header-title">隐私设置</span>
      </div>
    </div>

    <div class="content">
      <div class="section">
        <div class="section-title">个人信息可见性</div>
        <div class="setting-list">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">👁️</span>
              <div class="setting-text">
                <span class="setting-name">个人资料可见</span>
                <span class="setting-desc">允许其他用户查看您的个人资料</span>
              </div>
            </div>
            <switch :checked="privacy.profileVisible" @change="(e: any) => privacy.profileVisible = e.detail.value" color="#FF8C42" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">📍</span>
              <div class="setting-text">
                <span class="setting-name">位置信息</span>
                <span class="setting-desc">允许查看您的社区位置</span>
              </div>
            </div>
            <switch :checked="privacy.locationVisible" @change="(e: any) => privacy.locationVisible = e.detail.value" color="#FF8C42" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">📊</span>
              <div class="setting-text">
                <span class="setting-name">任务记录</span>
                <span class="setting-desc">允许其他用户查看您的任务完成记录</span>
              </div>
            </div>
            <switch :checked="privacy.taskRecordVisible" @change="(e: any) => privacy.taskRecordVisible = e.detail.value" color="#FF8C42" />
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">互动权限</div>
        <div class="setting-list">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">💬</span>
              <div class="setting-text">
                <span class="setting-name">允许被联系</span>
                <span class="setting-desc">允许其他用户向您发送消息</span>
              </div>
            </div>
            <switch :checked="privacy.allowContact" @change="(e: any) => privacy.allowContact = e.detail.value" color="#FF8C42" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">🤝</span>
              <div class="setting-text">
                <span class="setting-name">接受任务邀请</span>
                <span class="setting-desc">允许接收其他用户发布的任务邀请</span>
              </div>
            </div>
            <switch :checked="privacy.acceptTaskInvite" @change="(e: any) => privacy.acceptTaskInvite = e.detail.value" color="#FF8C42" />
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">数据安全</div>
        <div class="setting-list">
          <div class="setting-item clickable" @click="clearCache">
            <div class="setting-info">
              <span class="setting-icon">🗑️</span>
              <div class="setting-text">
                <span class="setting-name">清除缓存</span>
                <span class="setting-desc">清除本地缓存数据</span>
              </div>
            </div>
            <span class="setting-arrow">›</span>
          </div>
          <div class="setting-item clickable" @click="goToAccountSecurity">
            <div class="setting-info">
              <span class="setting-icon">🔐</span>
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

const statusBarHeight = ref(20)

const privacy = ref({
  profileVisible: true,
  locationVisible: false,
  taskRecordVisible: true,
  allowContact: true,
  acceptTaskInvite: true
})

const goBack = () => {
  uni.navigateBack()
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
  background-color: var(--bg-color);
}

.header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
}

.header-content {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  color: white;
}

.back-btn {
  font-size: 28px;
  font-weight: 300;
  margin-right: var(--spacing-md);
}

.header-title {
  font-size: 18px;
  font-weight: 500;
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
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  padding-left: var(--spacing-xs);
}

.setting-list {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
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
  color: var(--text-primary);
  margin-bottom: 2px;
}

.setting-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.setting-arrow {
  font-size: 18px;
  color: var(--text-muted);
}

.save-btn {
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-top: var(--spacing-xl);
}
</style>
