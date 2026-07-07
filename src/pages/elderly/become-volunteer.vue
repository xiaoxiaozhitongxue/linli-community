<template>
  <div class="page">
    <div class="header">
      <span class="back" @click="goBack">‹</span>
      <span class="title">成为志愿者</span>
    </div>

    <div class="content">
      <div class="intro">
        <span class="intro-emoji">❤️</span>
        <p>加入「邻里志愿者」队伍，用一点点时间，温暖身边的人。填写下方信息，我们会在 1-2 个工作日内与您联系。</p>
      </div>

      <div class="form">
        <div class="field">
          <label>姓名<span class="req">*</span></label>
          <input v-model="form.name" placeholder="请输入您的姓名" />
        </div>
        <div class="field">
          <label>手机号<span class="req">*</span></label>
          <input v-model="form.phone" type="tel" maxlength="11" placeholder="请输入手机号" />
        </div>
        <div class="field">
          <label>所在社区</label>
          <input v-model="form.community" placeholder="如：阳光社区" />
        </div>
        <div class="field">
          <label>擅长 / 可提供的服务</label>
          <input v-model="form.skills" placeholder="如：陪诊、代买、维修" />
        </div>
        <div class="field">
          <label>可服务时间</label>
          <input v-model="form.availableTime" placeholder="如：周末全天 / 工作日晚间" />
        </div>
        <div class="field">
          <label>自我介绍</label>
          <textarea v-model="form.intro" rows="3" placeholder="简单介绍一下自己（选填）"></textarea>
        </div>
      </div>

      <div class="submit-btn" @click="submit">提交报名</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { navigateBackSmart } from '../../utils/router'
import { toastSuccess, toastError } from '../../utils/toast'
import { useAuth } from '../../store'
import { localStore } from '../../services/localStore'

const { getCurrentPhone } = useAuth()

const form = reactive({
  name: '',
  phone: '',
  community: '',
  skills: '',
  availableTime: '',
  intro: ''
})

const goBack = () => navigateBackSmart('/pages/elderly/index')

const submit = () => {
  if (!form.name.trim()) return toastError('请填写姓名')
  if (!/^1[3-9]\d{9}$/.test(form.phone.trim())) return toastError('请填写正确的手机号')

  const phone = getCurrentPhone() || undefined
  const record = {
    id: 'vol' + Date.now(),
    name: form.name,
    phone: form.phone,
    community: form.community,
    skills: form.skills,
    availableTime: form.availableTime,
    intro: form.intro,
    status: 'pending',
    createdAt: Date.now()
  }
  localStore.append('elderly_volunteers', record, phone)
  toastSuccess('报名成功，感谢您的热心！')
  setTimeout(() => goBack(), 800)
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-primary); }
.header { display: flex; align-items: center; gap: 8px; padding: var(--spacing-lg); padding-top: calc(var(--spacing-lg) + 20px); background: linear-gradient(135deg, #FF5252, #FF4081); color: #fff; }
.back { font-size: 28px; cursor: pointer; line-height: 1; }
.title { font-size: 18px; font-weight: 600; }
.content { padding: var(--spacing-lg); }
.intro { display: flex; gap: 10px; background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-lg); }
.intro-emoji { font-size: 28px; }
.intro p { font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; margin: 0; }
.form { display: flex; flex-direction: column; gap: var(--spacing-md); }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; color: var(--color-text-secondary); font-weight: 500; }
.req { color: var(--color-error); }
.field input, .field textarea { border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: var(--spacing-md); font-size: 14px; color: var(--color-text-primary); background: var(--color-bg-secondary); outline: none; resize: none; }
.field input:focus, .field textarea:focus { border-color: var(--color-primary); }
.submit-btn { margin-top: var(--spacing-xl); background: linear-gradient(135deg, #FF5252, #FF4081); color: #fff; text-align: center; padding: var(--spacing-md); border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
.submit-btn:active { opacity: 0.85; }
</style>
