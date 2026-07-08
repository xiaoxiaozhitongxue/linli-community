<template>
  <div class="location-picker">
    <!-- 自动定位按钮 -->
    <div class="locate-btn-row">
      <button
        class="locate-btn"
        :disabled="locating"
        @click="handleLocate"
      >
        <span v-if="locating" class="locate-spinner"></span>
        <AppIcon v-else name="map-pin" :size="16" />
        <span>{{ locating ? '定位中...' : '自动定位' }}</span>
      </button>
      <span v-if="located" class="locate-done">已定位 ✓</span>
    </div>

    <!-- 国家（固定显示） -->
    <div class="field-row">
      <label class="field-label">国家</label>
      <div class="field-value-static">中国</div>
    </div>

    <!-- 省市区级联选择 -->
    <div class="cascade-row">
      <div class="cascade-item">
        <label class="field-label">省</label>
        <select
          class="cascade-select"
          v-model="internalForm.province"
          @change="onProvinceChange"
        >
          <option value="" disabled>请选择省</option>
          <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>

      <div class="cascade-item">
        <label class="field-label">市</label>
        <select
          class="cascade-select"
          v-model="internalForm.city"
          @change="onCityChange"
          :disabled="!internalForm.province"
        >
          <option value="" disabled>请选择市</option>
          <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div class="cascade-item">
        <label class="field-label">区</label>
        <select
          class="cascade-select"
          v-model="internalForm.district"
          @change="emitChange"
          :disabled="!internalForm.city"
        >
          <option value="" disabled>请选择区</option>
          <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>
    </div>

    <!-- 详细地址 -->
    <div class="field-row">
      <label class="field-label">详细地址</label>
      <input
        class="address-input"
        v-model="internalForm.address"
        placeholder="请输入详细地址（如：张江路100号）"
        @input="emitChange"
      />
    </div>

    <!-- 加载状态 / 错误提示 -->
    <div v-if="errorText && !locating" class="status-text error">
      {{ errorText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { LocationForm } from '../types/location'
import { useLocationForm } from '../composables/useLocationForm'
import { getLocation } from '../utils/location'

interface LocationPickerProps {
  modelValue?: LocationForm
  errorText?: string
  locatingText?: string
}

const props = withDefaults(defineProps<LocationPickerProps>(), {
  modelValue: undefined,
  errorText: '',
  locatingText: '定位中...'
})

interface Emits {
  (e: 'update:modelValue', value: LocationForm): void
  (e: 'change', value: LocationForm): void
}

const emit = defineEmits<Emits>()

// 使用 composable 获取级联数据
const locationForm = useLocationForm()
const { provinces, cities, districts, autoFill } = locationForm

const locating = ref(false)
const located = ref(false)
const locateError = ref('')

// 内部表单数据
const internalForm = ref<LocationForm>({
  country: '中国',
  province: '',
  city: '',
  district: '',
  address: ''
})

// 当外部 modelValue 变化时同步到内部
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      internalForm.value = { ...val, country: '中国' }
    }
  },
  { immediate: true }
)

// 同步 internalForm → locationForm.composable
watch(() => internalForm.value.province, (v) => { locationForm.form.value.province = v })
watch(() => internalForm.value.city, (v) => { locationForm.form.value.city = v })
watch(() => internalForm.value.district, (v) => { locationForm.form.value.district = v })

/** 省变更时，重置市和区 */
function onProvinceChange() {
  internalForm.value.city = ''
  internalForm.value.district = ''
  locationForm.form.value.province = internalForm.value.province
  locationForm.form.value.city = ''
  locationForm.form.value.district = ''
  emitChange()
}

/** 市变更时，重置区 */
function onCityChange() {
  internalForm.value.district = ''
  locationForm.form.value.city = internalForm.value.city
  locationForm.form.value.district = ''
  emitChange()
}

/** 触发外部 v-model 更新 */
function emitChange() {
  emit('update:modelValue', { ...internalForm.value })
  emit('change', { ...internalForm.value })
}

/** 点击自动定位 */
async function handleLocate() {
  if (locating.value) return
  locating.value = true
  located.value = false
  locateError.value = ''
  try {
    const result = await getLocation({ forceRefresh: true })
    if (result) {
      autoFill(result)
      // 将 composable 的填充结果同步到 internalForm
      internalForm.value = {
        ...internalForm.value,
        province: locationForm.form.value.province,
        city: locationForm.form.value.city,
        district: locationForm.form.value.district,
        address: locationForm.form.value.address
      }
      located.value = true
      emitChange()
    } else {
      locateError.value = '定位失败，请检查定位权限'
    }
  } catch (e: any) {
    locateError.value = e?.message || '定位失败，请重试'
  } finally {
    locating.value = false
  }
}
</script>

<style scoped>
.location-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* 自动定位按钮行 */
.locate-btn-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.locate-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  border: 1px solid var(--color-primary-light);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.locate-btn:hover {
  background: rgba(255, 107, 53, 0.18);
}

.locate-btn:active {
  transform: scale(0.96);
}

.locate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.locate-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-primary-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.locate-done {
  font-size: 13px;
  color: var(--color-success);
  font-weight: 500;
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.field-value-static {
  font-size: 15px;
  color: var(--color-text-primary);
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.cascade-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.cascade-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.cascade-select {
  width: 100%;
  padding: 10px 8px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  outline: none;
  transition: all var(--transition-fast);
  appearance: auto;
  -webkit-appearance: auto;
  min-height: 40px;
}

.cascade-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-soft);
}

.cascade-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.address-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  outline: none;
  transition: all var(--transition-fast);
  box-sizing: border-box;
}

.address-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-soft);
}

.address-input::placeholder {
  color: var(--color-text-placeholder);
}

.status-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 6px 0;
}

.status-text.loading {
  color: var(--color-primary);
}

.status-text.error {
  color: var(--color-error);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.loading-dot {
  background: var(--color-primary);
  animation: dotPulse 1.4s infinite ease-in-out;
}

@keyframes dotPulse {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
