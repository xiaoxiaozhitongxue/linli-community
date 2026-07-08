<template>
  <div class="location-picker">
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
    <div v-if="loading" class="status-text loading">
      <span class="status-dot loading-dot"></span>
      {{ locatingText || '定位中...' }}
    </div>
    <div v-else-if="errorText" class="status-text error">
      {{ errorText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { LocationForm } from '../types/location'
import { useLocationForm } from '../composables/useLocationForm'

interface LocationPickerProps {
  modelValue?: LocationForm
  loading?: boolean
  errorText?: string
  locatingText?: string
}

const props = withDefaults(defineProps<LocationPickerProps>(), {
  modelValue: undefined,
  loading: false,
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
const { provinces, cities, districts } = locationForm

// 内部表单数据（用于级联选择器的本地状态）
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

// 当内部表单的省变化时同步到 composable（用于更新 cities/districts computed）
watch(
  () => internalForm.value.province,
  (newProv) => {
    locationForm.form.value.province = newProv
  }
)

watch(
  () => internalForm.value.city,
  (newCity) => {
    locationForm.form.value.city = newCity
  }
)

watch(
  () => internalForm.value.district,
  (newDistrict) => {
    locationForm.form.value.district = newDistrict
  }
)

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
  const value = { ...internalForm.value }
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
.location-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
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
