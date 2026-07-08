/**
 * useLocationForm — 位置表单状态管理 composable
 *
 * 功能：
 * - 省市区三级级联选择
 * - 从定位结果 autoFill
 * - 格式化提交值 "省-市-区 详细地址"
 * - 表单重置
 */
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { LocationForm, RegionNode } from '../types/location'
import { REGIONS, isMunicipality, matchProvince, getCityList, getDistrictList } from '../constants/regions'
import type { LocationResult } from '../utils/location'

/** 创建默认空表单 */
function createEmptyForm(): LocationForm {
  return {
    country: '中国',
    province: '',
    city: '',
    district: '',
    address: ''
  }
}

export function useLocationForm() {
  /** 表单数据 */
  const form: Ref<LocationForm> = ref(createEmptyForm())

  /** 所有省份列表 */
  const provinces: ComputedRef<string[]> = computed(() => {
    return REGIONS.map((p: RegionNode) => p.name)
  })

  /** 当前省下的所有市 */
  const cities: ComputedRef<string[]> = computed(() => {
    if (!form.value.province) return []
    return getCityList(form.value.province)
  })

  /** 当前市下的所有区 */
  const districts: ComputedRef<string[]> = computed(() => {
    if (!form.value.province || !form.value.city) return []
    return getDistrictList(form.value.province, form.value.city)
  })

  /** 是否已选择完整的省市区 */
  const isRegionComplete: ComputedRef<boolean> = computed(() => {
    return !!(form.value.province && form.value.city && form.value.district)
  })

  /** 格式化后的位置字符串 "省-市-区 详细地址" */
  const formattedLocation: ComputedRef<string> = computed(() => {
    return getSubmitValue()
  })

  /**
   * 从定位结果自动填充表单
   * 自动匹配省市区下拉选项
   */
  function autoFill(result: LocationResult): void {
    if (!result) return

    // city 可能是 ""，但 district 或 address 可能有值
    const cityName = result.city || ''
    const districtName = result.district || ''
    const addr = result.address || ''

    // 尝试匹配省和市
    const matched = matchProvince(cityName, districtName)

    if (matched) {
      form.value.province = matched.province
      form.value.city = matched.city

      // 如果是直辖市，city 自动与 province 相同
      if (isMunicipality(matched.province)) {
        form.value.city = matched.province
      }

      // 尝试匹配区
      const districtList = getDistrictList(form.value.province, form.value.city)
      if (districtName && districtList.length > 0) {
        // 精确匹配区名
        const exactMatch = districtList.find(
          (d: string) => d === districtName || d.includes(districtName.replace(/区$/, ''))
        )
        if (exactMatch) {
          form.value.district = exactMatch
        } else {
          // 模糊匹配：取第一个包含关键字的区
          const fuzzyMatch = districtList.find((d: string) => districtName.includes(d.replace(/区$/, '')))
          if (fuzzyMatch) {
            form.value.district = fuzzyMatch
          } else {
            form.value.district = ''
          }
        }
      }

      // 详细地址
      form.value.address = addr || ''
    } else {
      // 无法匹配省市时，只填充地址
      form.value.address = addr || districtName || cityName || ''
    }
  }

  /** 重置表单 */
  function reset(): void {
    form.value = createEmptyForm()
  }

  /**
   * 获取提交用的位置字符串
   * 格式: "省-市-区 详细地址"
   * 如: "上海市-浦东新区 张江路100号"
   */
  function getSubmitValue(): string {
    const parts: string[] = []

    if (form.value.province) parts.push(form.value.province)
    if (form.value.city && form.value.city !== form.value.province) {
      parts.push(form.value.city)
    } else if (form.value.city) {
      // 直辖市：省=市，只加一次
      // 但格式要求"省-市-区"，所以需要重复一次
      parts.push(form.value.city)
    }
    if (form.value.district) parts.push(form.value.district)

    const regionStr = parts.join('-')
    const addressStr = form.value.address.trim()

    if (regionStr && addressStr) {
      return `${regionStr} ${addressStr}`
    }
    if (regionStr) return regionStr
    if (addressStr) return addressStr
    return ''
  }

  return {
    form,
    provinces,
    cities,
    districts,
    isRegionComplete,
    formattedLocation,
    autoFill,
    reset,
    getSubmitValue
  }
}
