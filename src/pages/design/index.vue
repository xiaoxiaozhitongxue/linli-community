<template>
  <div class="page design-page">
    <!-- Header -->
    <div class="design-header">
      <div class="header-back" @click="goBack">
        <AppIcon name="close" :size="24" />
      </div>
      <span class="header-title">图标 & 设计规范</span>
    </div>

    <div class="design-content">
      <!-- Icon Set Showcase -->
      <section class="design-section">
        <h2 class="section-label"><AppIcon name="star" :size="20" /> 图标库</h2>
        <p class="section-desc">UI Designer 精心设计的 SVG 图标系统，统一线描风格，适配邻里社区场景</p>
        <div class="icon-grid">
          <div
            v-for="item in iconList"
            :key="item.name"
            class="icon-card"
            @click="copyIconName(item.name)"
          >
            <div class="icon-preview">
              <AppIcon :name="item.name" :size="28" />
            </div>
            <span class="icon-name">{{ item.name }}</span>
            <span class="icon-label">{{ item.label }}</span>
          </div>
        </div>
      </section>

      <!-- Design Tokens: Colors -->
      <section class="design-section">
        <h2 class="section-label"><AppIcon name="settings" :size="20" /> 色彩体系</h2>
        <p class="section-desc">暖橙色品牌主色 + 语义色彩，满足 WCAG AA 对比度标准</p>
        <div class="color-grid">
          <div v-for="c in colors" :key="c.name" class="color-card">
            <div class="color-swatch" :style="{ background: c.value }"></div>
            <span class="color-name">{{ c.name }}</span>
            <span class="color-val">{{ c.value }}</span>
          </div>
        </div>
      </section>

      <!-- Design Tokens: Typography -->
      <section class="design-section">
        <h2 class="section-label"><AppIcon name="book-open" :size="20" /> 字体层级</h2>
        <p class="section-desc">基于 4px 基准的等比缩放，保证阅读体验的一致性</p>
        <div class="type-list">
          <div v-for="t in typography" :key="t.token" class="type-row">
            <span class="type-sample" :style="{ fontSize: t.size }">{{ t.sample }}</span>
            <span class="type-token">{{ t.token }}</span>
            <span class="type-size">{{ t.size }}</span>
          </div>
        </div>
      </section>

      <!-- Component Samples -->
      <section class="design-section">
        <h2 class="section-label"><AppIcon name="flame" :size="20" /> 组件预览</h2>
        <p class="section-desc">AppIcon 在真实组件中的应用效果</p>
        <div class="component-showcase">
          <!-- Tab Bar Mock -->
          <div class="mock-tab-bar">
            <div v-for="tab in mockTabs" :key="tab.name" class="mock-tab" :class="{ active: tab.active }">
              <AppIcon :name="tab.icon" :size="24" :color="tab.active ? 'var(--color-primary)' : undefined" />
              <span>{{ tab.name }}</span>
            </div>
          </div>
          <!-- Action Bar Mock -->
          <div class="mock-actions">
            <div class="mock-action">
              <AppIcon name="heart" :size="22" />
              <span>128</span>
            </div>
            <div class="mock-action">
              <AppIcon name="comment" :size="22" />
              <span>36</span>
            </div>
            <div class="mock-action">
              <AppIcon name="share" :size="22" />
              <span>分享</span>
            </div>
          </div>
          <!-- Button Row -->
          <div class="mock-buttons">
            <button class="btn-icon-demo"><AppIcon name="camera" :size="18" /> 拍照</button>
            <button class="btn-icon-demo primary"><AppIcon name="edit" :size="18" /> 发布</button>
          </div>
        </div>
      </section>

      <!-- Tips -->
      <section class="design-section tips-section">
        <h2 class="section-label"><AppIcon name="help-circle" :size="20" /> 使用指引</h2>
        <ul class="tips-list">
          <li>点击任意图标可复制其名称，粘贴到 <code>&lt;AppIcon name="xxx" /&gt;</code> 即可使用</li>
          <li>图标支持 <code>:size</code>、<code>:color</code>、<code>:filled</code>、<code>:strokeWidth</code> 属性</li>
          <li>默认 24px 大小，建议在 16px - 40px 之间使用</li>
          <li>系统自动适配深色/浅色主题</li>
          <li>图标名称为英文 kebab-case 格式</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from '../../utils/router'
import { toastSuccess } from '../../utils/toast'
import AppIcon from '../../components/AppIcon.vue'

const iconList = ref([
  { name: 'home', label: '首页' },
  { name: 'handshake', label: '互助' },
  { name: 'message-circle', label: '消息' },
  { name: 'user', label: '我的' },
  { name: 'plus', label: '发布(加号)' },
  { name: 'search', label: '搜索' },
  { name: 'map-pin', label: '定位' },
  { name: 'heart', label: '喜欢/健康' },
  { name: 'comment', label: '评论' },
  { name: 'share', label: '分享' },
  { name: 'star', label: '收藏/活动' },
  { name: 'bell', label: '通知' },
  { name: 'calendar', label: '日历' },
  { name: 'activity', label: '活动' },
  { name: 'users', label: '人群' },
  { name: 'flame', label: '热门' },
  { name: 'target', label: '目标/近期' },
  { name: 'book-open', label: '动态/文化' },
  { name: 'megaphone', label: '公告' },
  { name: 'edit', label: '编辑' },
  { name: 'camera', label: '拍照' },
  { name: 'close', label: '关闭' },
  { name: 'settings', label: '设置' },
  { name: 'lock', label: '锁/安全' },
  { name: 'help-circle', label: '帮助' },
  { name: 'info', label: '信息' },
  { name: 'bell-off', label: '静音' },
  { name: 'trash', label: '删除' },
  { name: 'bookmark', label: '收藏' }
])

const colors = ref([
  { name: '品牌主色', value: '#FF6B35' },
  { name: '主色浅色', value: '#FF8A5C' },
  { name: '主色深色', value: '#E55A2B' },
  { name: '暖橙背景', value: '#FFF3ED' },
  { name: '成功绿', value: '#10B981' },
  { name: '警告橙', value: '#F59E0B' },
  { name: '错误红', value: '#EF4444' },
  { name: '信息蓝', value: '#3B82F6' },
  { name: '文字主色', value: '#1F2937' },
  { name: '文字副色', value: '#6B7280' },
  { name: '文字浅色', value: '#9CA3AF' },
  { name: '背景色', value: '#F9FAFB' }
])

const typography = ref([
  { token: '--font-size-xs', size: '12px', sample: '辅助文字' },
  { token: '--font-size-sm', size: '14px', sample: '正文辅助' },
  { token: '--font-size-base', size: '16px', sample: '正文字体' },
  { token: '--font-size-lg', size: '18px', sample: '小标题字体' },
  { token: '--font-size-xl', size: '20px', sample: '中等标题' },
  { token: '--font-size-2xl', size: '24px', sample: '大号标题' },
  { token: '--font-size-3xl', size: '30px', sample: '页面大标题' },
  { token: '--font-size-4xl', size: '36px', sample: '超大标题' }
])

const mockTabs = ref([
  { name: '首页', icon: 'home', active: true },
  { name: '互助', icon: 'handshake', active: false },
  { name: '消息', icon: 'message-circle', active: false },
  { name: '我的', icon: 'user', active: false }
])

let copyTimer: any = null

function copyIconName(name: string) {
  try {
    navigator.clipboard.writeText(name)
    toastSuccess(`已复制: ${name}`)
  } catch {
    toastSuccess(`图标: ${name}`)
  }
}

function goBack() {
  navigateTo('/pages/profile/index')
}
</script>

<style scoped>
.design-page {
  background: var(--color-bg);
  min-height: 100vh;
  padding-bottom: 32px;
}

.design-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-primary-gradient);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
}

.header-back:hover {
  background: rgba(255, 255, 255, 0.2);
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  margin-left: 8px;
}

.design-content {
  padding: 16px;
  max-width: 720px;
  margin: 0 auto;
}

.design-section {
  background: var(--color-card-bg, #fff);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}

.section-desc {
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin: 0 0 16px;
  line-height: 1.5;
}

/* Icon Grid */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.icon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.icon-card:hover {
  background: var(--color-primary-bg, #FFF3ED);
  border-color: var(--color-primary, #FF6B35);
  transform: translateY(-2px);
}

.icon-preview {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--color-bg-secondary, #F3F4F6);
}

.icon-card:hover .icon-preview {
  background: #fff;
}

.icon-name {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-primary, #FF6B35);
  font-weight: 500;
}

.icon-label {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

/* Color Grid */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 10px;
}

.color-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.color-swatch {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  border: 2px solid var(--color-border, #E5E7EB);
}

.color-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.color-val {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-text-tertiary);
}

/* Typography */
.type-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.type-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-border, #E5E7EB);
}

.type-row:last-child {
  border-bottom: none;
}

.type-sample {
  flex: 1;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.type-token {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-primary, #FF6B35);
  min-width: 110px;
  text-align: right;
}

.type-size {
  font-size: 11px;
  color: var(--color-text-tertiary);
  min-width: 40px;
  text-align: right;
}

/* Component Showcase */
.component-showcase {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mock-tab-bar {
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  border-top: 1px solid var(--color-border, #E5E7EB);
  background: var(--color-card-bg, #fff);
  border-radius: 8px;
}

.mock-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: var(--color-text-tertiary);
  padding: 4px 12px;
}

.mock-tab.active {
  color: var(--color-primary, #FF6B35);
}

.mock-actions {
  display: flex;
  justify-content: space-around;
  padding: 12px;
  border-radius: 8px;
  background: var(--color-bg-secondary, #F3F4F6);
}

.mock-action {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.mock-buttons {
  display: flex;
  gap: 12px;
}

.btn-icon-demo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border, #E5E7EB);
  background: var(--color-card-bg, #fff);
  color: var(--color-text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-demo.primary {
  background: var(--color-primary, #FF6B35);
  color: #fff;
  border-color: transparent;
}

.btn-icon-demo:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

/* Tips */
.tips-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tips-list li {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.tips-list code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  background: var(--color-bg-secondary, #F3F4F6);
  padding: 1px 6px;
  border-radius: 4px;
  color: var(--color-primary, #FF6B35);
}

@media (max-width: 480px) {
  .icon-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .style-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .type-token {
    min-width: 80px;
    font-size: 10px;
  }
}
</style>
