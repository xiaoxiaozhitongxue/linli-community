<template>
  <div class="page">
    <div class="header">
      <span class="back" @click="goBack">‹</span>
      <span class="title">服务申请</span>
    </div>

    <div class="content">
      <div class="banner" v-if="selectedService">
        <span class="banner-icon" :style="{ background: selectedService.bgColor }">{{ selectedService.icon }}</span>
        <div class="banner-text">
          <div class="banner-name">{{ selectedService.name }}</div>
          <div class="banner-desc">{{ selectedService.desc }}</div>
        </div>
      </div>
      <div class="banner empty" v-else>
        <span class="banner-icon"><AppIcon name="handshake" :size="24" /></span>
        <div class="banner-text">
          <div class="banner-name">通用志愿服务</div>
          <div class="banner-desc">未指定具体项目，将按备注安排</div>
        </div>
      </div>

      <div class="form">
        <div class="field">
          <label>老人姓名<span class="req">*</span></label>
          <input v-model="form.elderName" placeholder="请输入需要帮助的老人姓名" />
        </div>
        <div class="field">
          <label>联系电话<span class="req">*</span></label>
          <input v-model="form.phone" type="tel" placeholder="请输入联系电话" />
        </div>
        <div class="field">
          <label>服务地址</label>
          <input v-model="form.address" placeholder="如：阳光社区 5号楼 301" />
        </div>
        <div class="field">
          <label>期望时间</label>
          <input v-model="form.expectedTime" placeholder="如：今天下午 14:00" />
        </div>
        <div class="field">
          <label>备注说明</label>
          <textarea v-model="form.note" rows="3" placeholder="补充需求细节（选填）"></textarea>
        </div>
      </div>

      <div class="submit-btn" @click="submit">提交申请</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '../../components/AppIcon.vue'
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { navigateBackSmart } from '../../utils/router'
import { toastSuccess, toastError } from '../../utils/toast'
import { useAuth } from '../../store'
import { localStore } from '../../services/localStore'
import { SERVICE_TYPES } from '../../constants/elderlyData'

const route = useRoute()
const { getCurrentPhone } = useAuth()

const selectedService = computed(
  () =>
    SERVICE_TYPES.find((s) => s.id === route.query.type) ||
    SERVICE_TYPES.find((s) => s.name === route.query.name) ||
    null
)

const form = reactive({
  elderName: '',
  phone: '',
  address: '',
  expectedTime: '',
  note: ''
})

const goBack = () => navigateBackSmart('/pages/elderly/index')

const submit = () => {
  if (!form.elderName.trim()) return toastError('请填写老人姓名')
  if (!form.phone.trim()) return toastError('请填写联系电话')

  const phone = getCurrentPhone() || undefined
  const record = {
    id: 'sr' + Date.now(),
    serviceId: selectedService.value?.id || '',
    serviceName: selectedService.value?.name || '通用志愿服务',
    elderName: form.elderName,
    phone: form.phone,
    address: form.address,
    expectedTime: form.expectedTime,
    note: form.note,
    status: 'pending',
    createdAt: Date.now()
  }
  localStore.append('elderly_service_requests', record, phone)
  toastSuccess('申请已提交，志愿者会尽快与您联系')
  setTimeout(() => goBack(), 800)
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-primary); }
.header {
  display: flex; align-items: center; gap: 8px;
  padding: var(--spacing-lg); padding-top: calc(var(--spacing-lg) + 20px);
  background: linear-gradient(135deg, #E91E63, #F48FB1); color: #fff;
}
.back { font-size: 28px; cursor: pointer; line-height: 1; }
.title { font-size: 18px; font-weight: 600; }
.content { padding: var(--spacing-lg); }
.banner { display: flex; align-items: center; gap: 12px; background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); }
.banner-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.banner-name { font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
.banner-desc { font-size: 12px; color: var(--color-text-muted); }
.form { margin-top: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-md); }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; color: var(--color-text-secondary); font-weight: 500; }
.req { color: var(--color-error); }
.field input, .field textarea {
  border: 1px solid var(--color-border-light); border-radius: var(--radius-md);
  padding: var(--spacing-md); font-size: 14px; color: var(--color-text-primary);
  background: var(--color-bg-secondary); outline: none; resize: none;
}
.field input:focus, .field textarea:focus { border-color: var(--color-primary); }
.submit-btn {
  margin-top: var(--spacing-xl); background: linear-gradient(135deg, #E91E63, #F48FB1);
  color: #fff; text-align: center; padding: var(--spacing-md); border-radius: var(--radius-md);
  font-weight: 600; cursor: pointer;
}
.submit-btn:active { opacity: 0.85; }
</style>
