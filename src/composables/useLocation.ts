import { ref, computed } from 'vue'
import { getLocation, pickDisplayCommunity, type LocationResult } from '../utils/location'

export function useLocation() {
  const communityName = ref('点击定位')
  const locating = ref(false)
  const locationResult = ref<LocationResult | null>(null)

  let lastAutoLocateAt = 0
  let hardResetTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 格式化后的城市-区域字符串
   * 用于首页 NavBar 展示
   * 格式: "市-区" 如 "上海市-浦东新区"
   */
  const cityDistrict = computed(() => {
    const result = locationResult.value
    if (!result) return '定位失败'
    if (!result.city && !result.district) return '定位失败'
    if (result.city && result.district) {
      return `${result.city}-${result.district}`
    }
    return result.city || result.district || '定位失败'
  })

  async function chooseLocation(opts: { auto?: boolean; registeredCommunity?: string | null } = {}): Promise<LocationResult | null> {
    if (locating.value) return null

    const now = Date.now()
    if (opts.auto && now - lastAutoLocateAt < 60 * 1000) {
      return locationResult.value
    }
    lastAutoLocateAt = now

    locating.value = true

    if (hardResetTimer) clearTimeout(hardResetTimer)
    hardResetTimer = setTimeout(() => {
      if (locating.value) {
        locating.value = false
        if (!communityName.value || communityName.value === '点击定位') {
          communityName.value = '点击定位'
        }
      }
    }, 20000)

    try {
      const result = await getLocation({ forceRefresh: true })
      locationResult.value = result
      const display = pickDisplayCommunity(result, opts.registeredCommunity || null)
      communityName.value = display
      return result
    } catch (err: any) {
      console.warn('[useLocation] 定位失败:', err)
      return null
    } finally {
      locating.value = false
      if (hardResetTimer) {
        clearTimeout(hardResetTimer)
        hardResetTimer = null
      }
    }
  }

  function startAutoLocate(registeredCommunity?: string | null) {
    chooseLocation({ auto: true, registeredCommunity }).catch((err) => {
      console.warn('[useLocation] 自动定位出错:', err)
    })
  }

  function cleanup() {
    if (hardResetTimer) {
      clearTimeout(hardResetTimer)
      hardResetTimer = null
    }
  }

  return {
    communityName,
    locating,
    locationResult,
    cityDistrict,
    chooseLocation,
    startAutoLocate,
    cleanup
  }
}
