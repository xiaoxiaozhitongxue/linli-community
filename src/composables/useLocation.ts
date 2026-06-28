import { ref } from 'vue'
import { getLocation, pickDisplayCommunity, type LocationResult } from '../utils/location'

export function useLocation() {
  const communityName = ref('点击定位')
  const locating = ref(false)
  const locationResult = ref<LocationResult | null>(null)

  let lastAutoLocateAt = 0
  let hardResetTimer: ReturnType<typeof setTimeout> | null = null

  async function chooseLocation(opts: { auto?: boolean; registeredCommunity?: string | null } = {}) {
    if (locating.value) return

    const now = Date.now()
    if (opts.auto && now - lastAutoLocateAt < 60 * 1000) {
      return
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
    } catch (err: any) {
      console.warn('[useLocation] 定位失败:', err)
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
    chooseLocation,
    startAutoLocate,
    cleanup
  }
}
