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
            <div class="toggle-switch" :class="{ active: settings.taskMessage }" @click="settings.taskMessage = !settings.taskMessage">
              <div class="toggle-thumb"></div>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">🔔</span>
              <div class="setting-text">
                <span class="setting-name">系统通知</span>
                <span class="setting-desc">接收系统公告、安全提醒等通知</span>
              </div>
            </div>
            <div class="toggle-switch" :class="{ active: settings.systemNotice }" @click="settings.systemNotice = !settings.systemNotice">
              <div class="toggle-thumb"></div>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">📢</span>
              <div class="setting-text">
                <span class="setting-name">活动提醒</span>
                <span class="setting-desc">接收活动开始、结束等提醒通知</span>
              </div>
            </div>
            <div class="toggle-switch" :class="{ active: settings.activityNotice }" @click="settings.activityNotice = !settings.activityNotice">
              <div class="toggle-thumb"></div>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">❤️</span>
              <div class="setting-text">
                <span class="setting-name">互动通知</span>
                <span class="setting-desc">接收点赞、评论、收藏等互动通知</span>
              </div>
            </div>
            <div class="toggle-switch" :class="{ active: settings.interactiveNotice }" @click="settings.interactiveNotice = !settings.interactiveNotice">
              <div class="toggle-thumb"></div>
            </div>
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
            <div class="toggle-switch" :class="{ active: settings.sound }" @click="settings.sound = !settings.sound">
              <div class="toggle-thumb"></div>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">📳</span>
              <div class="setting-text">
                <span class="setting-name">震动</span>
                <span class="setting-desc">收到通知时震动提醒</span>
              </div>
            </div>
            <div class="toggle-switch" :class="{ active: settings.vibrate }" @click="settings.vibrate = !settings.vibrate">
              <div class="toggle-thumb"></div>
            </div>
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
import { navigateBackSmart } from '../../utils/router'

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
  navigateBackSmart()
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

.header {
  background: var(--color-primary-gradient);
}

.header-content {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--color-text-white);
}

.back-btn {
  font-size: 28px;
  font-weight: 300;
  margin-right: var(--spacing-md);
  border-radius: var(--radius-full);
  transition: background-color var(--transition-fast);
  padding: 4px;
  cursor: pointer;
}

.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
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
