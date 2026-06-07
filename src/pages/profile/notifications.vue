<template>
  <div class="page">
    <div class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-content">
        <span class="back-btn" @click="goBack">‹</span>
        <span class="header-title">消息通知</span>
      </div>
    </div>

    <div class="content">
      <div class="section">
        <div class="section-title">通知类型</div>
        <div class="setting-list">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">💬</span>
              <div class="setting-text">
                <span class="setting-name">任务消息</span>
                <span class="setting-desc">接收任务申请、接单、完成任务等通知</span>
              </div>
            </div>
            <switch :checked="settings.taskMessage" @change="(e: any) => settings.taskMessage = e.detail.value" color="#FF8C42" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">🔔</span>
              <div class="setting-text">
                <span class="setting-name">系统通知</span>
                <span class="setting-desc">接收系统公告、安全提醒等通知</span>
              </div>
            </div>
            <switch :checked="settings.systemNotice" @change="(e: any) => settings.systemNotice = e.detail.value" color="#FF8C42" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">📢</span>
              <div class="setting-text">
                <span class="setting-name">活动提醒</span>
                <span class="setting-desc">接收活动开始、结束等提醒通知</span>
              </div>
            </div>
            <switch :checked="settings.activityNotice" @change="(e: any) => settings.activityNotice = e.detail.value" color="#FF8C42" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">❤️</span>
              <div class="setting-text">
                <span class="setting-name">互动通知</span>
                <span class="setting-desc">接收点赞、评论、收藏等互动通知</span>
              </div>
            </div>
            <switch :checked="settings.interactiveNotice" @change="(e: any) => settings.interactiveNotice = e.detail.value" color="#FF8C42" />
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">提醒方式</div>
        <div class="setting-list">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">🔊</span>
              <div class="setting-text">
                <span class="setting-name">声音</span>
                <span class="setting-desc">收到通知时播放提示音</span>
              </div>
            </div>
            <switch :checked="settings.sound" @change="(e: any) => settings.sound = e.detail.value" color="#FF8C42" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">📳</span>
              <div class="setting-text">
                <span class="setting-name">震动</span>
                <span class="setting-desc">收到通知时震动提醒</span>
              </div>
            </div>
            <switch :checked="settings.vibrate" @change="(e: any) => settings.vibrate = e.detail.value" color="#FF8C42" />
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
import { toastSuccess } from '../../utils/toast'

const statusBarHeight = ref(20)

const settings = ref({
  taskMessage: true,
  systemNotice: true,
  activityNotice: true,
  interactiveNotice: false,
  sound: true,
  vibrate: true
})

const goBack = () => {
  uni.navigateBack()
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
