<template>
  <div class="page">
    <div class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-content">
        <span class="back-btn" @click="goBack">‹</span>
        <span class="header-title">关于我们</span>
      </div>
    </div>

    <div class="content">
      <div class="about-card">
        <div class="app-logo">
          <span class="logo-icon">🏘️</span>
        </div>
        <div class="app-name">邻里社区</div>
        <div class="app-version">版本 1.0.0</div>
        <div class="app-desc">
          邻里社区是一款基于AI技术的社区互助平台，致力于为社区居民提供便捷、高效的互助服务。
        </div>
      </div>

      <div class="section">
        <div class="section-title">主要功能</div>
        <div class="feature-list">
          <div class="feature-item">
            <span class="feature-icon">🤖</span>
            <div class="feature-text">
              <span class="feature-name">AI智能匹配</span>
              <span class="feature-desc">基于AI算法为您匹配最合适的互助对象</span>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🤝</span>
            <div class="feature-text">
              <span class="feature-name">互助任务</span>
              <span class="feature-desc">发布任务、接受任务，轻松互助</span>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">👴</span>
            <div class="feature-text">
              <span class="feature-name">老人关怀</span>
              <span class="feature-desc">为老年人提供便捷的关怀服务</span>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🛡️</span>
            <div class="feature-text">
              <span class="feature-name">信用体系</span>
              <span class="feature-desc">完善的信用评分系统，保障互助安全</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">联系方式</div>
        <div class="contact-list">
          <div class="contact-item">
            <span class="contact-icon">📧</span>
            <span class="contact-text">service@neighbor.com</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📞</span>
            <span class="contact-text">400-888-8888</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">🌐</span>
            <span class="contact-text">www.neighbor.com</span>
          </div>
        </div>
      </div>

      <div class="copyright">
        © 2024 邻里社区 版权所有
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const statusBarHeight = ref(20)

const goBack = () => {
  uni.navigateBack()
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

.about-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);
}

.app-logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md);
}

.logo-icon {
  font-size: 40px;
}

.app-name {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.app-version {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: var(--spacing-md);
}

.app-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
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

.feature-list {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.feature-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-icon {
  font-size: 24px;
  margin-right: var(--spacing-md);
}

.feature-text {
  display: flex;
  flex-direction: column;
}

.feature-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.feature-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.contact-list {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.contact-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-icon {
  font-size: 18px;
  margin-right: var(--spacing-md);
}

.contact-text {
  font-size: 14px;
  color: var(--text-primary);
}

.copyright {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  padding: var(--spacing-lg) 0;
}
</style>
