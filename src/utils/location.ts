// ============================================================================
// 统一位置服务：浏览器定位 → 逆地理编码 → 社区名匹配
// 后端：高德地图 JS API v2.0（https://lbs.amap.com/api/jsapi-v2/documentation）
// 备选：百度地图 JS API v3.0（https://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html）
// 兜底：浏览器 Geolocation API + 内置社区距离匹配（零配置可用）
// ============================================================================
// 使用方式：
//   const result = await getLocation()  // 返回 { longitude, latitude, city, district, address, community }
//
// 启用高德/百度（强烈推荐）：在项目根目录的 .env 文件中配置（Vite 会自动加载）：
//   VITE_AMAP_KEY=你的高德Web端JSAPIkey
//   VITE_AMAP_SECURITY=你的高德安全密钥（AMap v2.0 必需）
// 或直接修改下面 MAP_KEY / MAP_SECURITY 的默认值。
// ============================================================================

// ======= 可配置项（推荐用 Vite env 注入）====================================
// 从 Vite 环境变量读取；若无配置则自动走浏览器原生定位兜底
const AMAP_KEY: string = (import.meta as any).env?.VITE_AMAP_KEY || ''
const AMAP_SECURITY: string = (import.meta as any).env?.VITE_AMAP_SECURITY || ''
const BAIDU_KEY: string = (import.meta as any).env?.VITE_BAIDU_KEY || ''

// 是否允许发起外部逆地理编码请求（Nominatim / 高德 / 百度）。
// 仅在已配置任一地图 key，或显式开启了 VITE_ENABLE_EXTERNAL_GEOCODE 时才允许；
// 否则完全走本地社区坐标兜底，避免「未配置 key 却静默向外部服务发请求」。
const ALLOW_EXTERNAL_GEOCODE: boolean =
  !!(AMAP_KEY || BAIDU_KEY) ||
  (import.meta as any).env?.VITE_ENABLE_EXTERNAL_GEOCODE === 'true'

// 引擎优先级：高德 > 百度 > 浏览器
type Engine = 'amap' | 'baidu' | 'browser'

function pickEngine(): Engine {
  if (AMAP_KEY) return 'amap'
  if (BAIDU_KEY) return 'baidu'
  return 'browser'
}

// ======= 导出类型 ============================================================
export interface LocationResult {
  longitude: number
  latitude: number
  city: string          // 如 "上海市"
  district: string      // 如 "浦东新区"
  address: string       // 完整结构化地址
  community: string     // 展示给用户的社区名（优先 nearest community，否则 district）
  provider: Engine      // 实际使用的定位引擎
}

// ======= 本地社区列表（单一数据源，见 src/constants/communities.ts）=======
// 此前社区列表在 location.ts 与 register/index.vue 各维护一份、内容不一致；
// 现统一由 constants/communities.ts 维护，本文件仅引用并再导出。
import { COMMUNITIES, type CommunityPreset } from '../constants/communities'

export { COMMUNITIES, type CommunityPreset }

// ======= 脚本懒加载工具（避免在 index.html 中写死 script 标签）============
let scriptInjected: { [k: string]: Promise<any> } = {}

function injectScript(src: string, globalName: string, timeoutMs = 10000): Promise<any> {
  if (src in scriptInjected) return scriptInjected[src]
  scriptInjected[src] = new Promise((resolve, reject) => {
    // 已经存在
    if ((window as any)[globalName]) {
      resolve((window as any)[globalName])
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => {
      // AMap 需要等待插件 ready；百度则直接可用
      resolve((window as any)[globalName])
    }
    script.onerror = () => reject(new Error(`加载 ${globalName} SDK 失败`))
    document.head.appendChild(script)

    // 超时保护
    setTimeout(() => reject(new Error(`加载 ${globalName} SDK 超时`)), timeoutMs)
  })
  return scriptInjected[src]
}

// ======= 工具函数：Haversine 距离（km）=====================================
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function findNearestCommunity(lat: number, lng: number): CommunityPreset {
  let best = COMMUNITIES[0]
  let min = Infinity
  for (const c of COMMUNITIES) {
    const d = haversineKm(lat, lng, c.lat, c.lng)
    if (d < min) {
      min = d
      best = c
    }
  }
  return best
}

function pickCommunityByKeywords(city: string, district: string): CommunityPreset | null {
  if (!city && !district) return null
  const clean = (s: string) => (s || '').replace(/市|区|县|省/g, '')
  const cityText = clean(city)
  const districtText = clean(district)
  // 优先按 city+district 匹配
  const byDistrict = COMMUNITIES.find(
    (c) => clean(c.city || '').includes(cityText) && clean(c.district || '').includes(districtText)
  )
  if (byDistrict) return byDistrict
  const byCity = COMMUNITIES.find((c) => clean(c.city || '').includes(cityText))
  if (byCity) return byCity
  // 最后用 keywords 模糊匹配
  const keywordHit = COMMUNITIES.find((c) =>
    (c.keywords || []).some((k) =>
      clean(cityText + districtText).includes(clean(k)) || clean(k).includes(clean(districtText))
    )
  )
  return keywordHit || null
}

// ======= 浏览器 Geolocation 原始定位 ========================================
function browserGetCoords(): Promise<{ longitude: number; latitude: number }> {
  return new Promise((resolve, reject) => {
    // 1. 浏览器完全不支持
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('当前浏览器不支持定位功能'))
      return
    }
    // 2. 非 HTTPS 且非 localhost：部分浏览器在此环境下禁用 geolocation
    const isSecure =
      typeof window !== 'undefined' &&
      (window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1')
    if (!isSecure) {
      reject(new Error('请使用 HTTPS 或 localhost 访问以启用定位'))
      return
    }

    let done = false
    const onError = (msg: string) => {
      if (done) return
      done = true
      reject(new Error(msg))
    }

    // 超时保护（12s），防止系统弹窗被用户忽略或卡死
    const timeoutTimer = setTimeout(() => {
      if (done) return
      done = true
      reject(new Error('定位超时，请检查设备定位是否已开启，或手动点击定位按钮重试'))
    }, 12000)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (done) return
        done = true
        clearTimeout(timeoutTimer)
        resolve({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        })
      },
      (error) => {
        if (done) return
        done = true
        clearTimeout(timeoutTimer)
        let msg = '定位失败，请重试'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = '请在浏览器/系统设置中允许定位权限，然后重试'
            break
          case error.POSITION_UNAVAILABLE:
            msg = '位置信息不可用，请检查网络或定位服务'
            break
          case error.TIMEOUT:
            msg = '定位超时，请重试'
            break
        }
        reject(new Error(msg))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  })
}

// ======= 高德地图引擎（JS API v2.0）=========================================
// AMap 定位插件会在"浏览器+基站+WiFi"三种方式中择优，并返回经纬度 + 地址
async function locateByAmap(): Promise<LocationResult> {
  // 安全密钥（AMap v2.0 必须）
  if (AMAP_SECURITY) {
    (window as any)._AMapSecurityConfig = { securityJsCode: AMAP_SECURITY }
  }
  const plugin = await injectScript(
    `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Geolocation,AMap.Geocoder`,
    'AMap'
  )

  const coords = await new Promise<{ longitude: number; latitude: number; formattedAddress?: string; city?: string; district?: string }>(
    (resolve, reject) => {
      plugin.plugin('AMap.Geolocation', () => {
        const geolocation = new plugin.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
          showButton: false,
          showCircle: false,
          showMarker: false,
          extensions: 'all',    // 拿到更完整的 POI/地址信息
          GeoLocationFirst: true,
        })
        geolocation.getCurrentPosition((status: string, result: any) => {
          console.log('[location][AMap] 定位回调 status=', status, 'result=', result)
          if (status === 'complete') {
            const addrComp: any = (result.addressComponent as any) || {}
            resolve({
              longitude: result.position.lng,
              latitude: result.position.lat,
              formattedAddress: result.formattedAddress,
              city: addrComp.city || addrComp.province || '',
              district: addrComp.district || '',
            })
          } else {
            // 高德定位失败，fallback 到浏览器 geolocation
            browserGetCoords().then(resolve).catch(reject)
          }
        })
      })
    }
  )

  // 如果定位插件已经返回了 city/district，就直接用；否则仍调用逆地理编码补齐
  let regeo = { city: '', district: '', address: '' }
  if (coords.city || coords.district) {
    regeo = { city: coords.city ?? '', district: coords.district ?? '', address: coords.formattedAddress || '' }
  } else {
    regeo = await new Promise<{ city: string; district: string; address: string }>((resolve) => {
      plugin.plugin('AMap.Geocoder', () => {
        const gc = new plugin.Geocoder({ city: '全国' })
        gc.getAddress([coords.longitude, coords.latitude], (status: string, result: any) => {
          console.log('[location][AMap] 逆地理编码 status=', status, 'result=', result)
          if (status === 'complete' && result.regeocode) {
            const addr = result.regeocode.addressComponent
            resolve({
              city: addr.city || addr.province || '',
              district: addr.district || '',
              address: result.regeocode.formattedAddress || coords.formattedAddress || '',
            })
          } else {
            resolve({ city: '', district: '', address: coords.formattedAddress || '' })
          }
        })
      })
    })
  }

  const communityHit = pickCommunityByKeywords(regeo.city, regeo.district)
  const nearest = communityHit || findNearestCommunity(coords.latitude, coords.longitude)

  return {
    longitude: coords.longitude,
    latitude: coords.latitude,
    city: regeo.city,
    district: regeo.district,
    address: regeo.address || `${regeo.city} ${regeo.district}`,
    community: nearest.name,
    provider: 'amap',
  }
}

// ======= 百度地图引擎（JS API v3.0）=========================================
async function locateByBaidu(): Promise<LocationResult> {
  const BMap = await injectScript(
    `https://api.map.baidu.com/api?v=3.0&ak=${BAIDU_KEY}`,
    'BMap'
  )

  const geo = new BMap.Geolocation()
  const coords = await new Promise<{ longitude: number; latitude: number; city?: string; district?: string; address?: string }>(
    (resolve, reject) => {
      geo.getCurrentPosition(
        (result: any) => {
          console.log('[location][Baidu] 定位回调 result =', result)
          if (result) {
            const addrComp: any = result.address || result.addressComponents || {}
            resolve({
              longitude: result.point.lng,
              latitude: result.point.lat,
              city: addrComp.city || '',
              district: addrComp.district || '',
              address: result.address || (addrComp.province || '') + (addrComp.city || '') + (addrComp.district || ''),
            })
          } else {
            browserGetCoords().then(resolve).catch(reject)
          }
        },
        (err: any) => {
          console.warn('[location][Baidu] 定位失败 err =', err)
          browserGetCoords().then(resolve).catch(reject)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  )

  // 如定位已返回 city/district，直接使用；否则调百度逆地理编码补齐
  let regeo = { city: '', district: '', address: '' }
  if (coords.city || coords.district) {
    regeo = { city: coords.city ?? '', district: coords.district ?? '', address: coords.address || '' }
  } else {
    const myGeo = new BMap.Geocoder()
    regeo = await new Promise<{ city: string; district: string; address: string }>((resolve) => {
      myGeo.getLocation(new BMap.Point(coords.longitude, coords.latitude), (result: any) => {
        console.log('[location][Baidu] 逆地理编码 result =', result)
        if (result) {
          resolve({
            city: result.addressComponents.city || '',
            district: result.addressComponents.district || '',
            address: result.address || '',
          })
        } else {
          resolve({ city: '', district: '', address: '' })
        }
      })
    })
  }

  const communityHit = pickCommunityByKeywords(regeo.city, regeo.district)
  const nearest = communityHit || findNearestCommunity(coords.latitude, coords.longitude)

  return {
    longitude: coords.longitude,
    latitude: coords.latitude,
    city: regeo.city,
    district: regeo.district,
    address: regeo.address,
    community: nearest.name,
    provider: 'baidu',
  }
}

// ======= 浏览器兜底（经纬度 → OSM Nominatim 逆地理编码 → 真实 city/district/address）=======
// 无高德/百度 key 时也能展示真实地理位置
async function locateByBrowser(): Promise<LocationResult> {
  const coords = await browserGetCoords()

  // 仅在允许外部 geocode 时才调用 Nominatim；否则直接走本地社区坐标兜底，
  // 避免「未配置 key 却静默向外部服务发请求」。
  let regeo = { city: '', district: '', address: '' }
  if (ALLOW_EXTERNAL_GEOCODE) {
    regeo = await nominatimReverseGeocode(coords.latitude, coords.longitude)
  }
  console.log('[location][browser] 原始坐标 + 逆地理结果:', regeo, coords)

  if (regeo.city || regeo.district) {
    // 成功拿到真实地址
    return {
      longitude: coords.longitude,
      latitude: coords.latitude,
      city: regeo.city,
      district: regeo.district,
      address: regeo.address || `${regeo.city} ${regeo.district}`,
      community: `${regeo.city}${regeo.district}`,
      provider: 'browser',
    }
  }
  // Nominatim 也失败时再回退到社区列表最近社区
  const nearest = findNearestCommunity(coords.latitude, coords.longitude)
  return {
    longitude: coords.longitude,
    latitude: coords.latitude,
    city: nearest.city || '',
    district: nearest.district || '',
    address: `${nearest.city || ''} · ${nearest.district || ''} · ${nearest.name}附近`,
    community: nearest.name,
    provider: 'browser',
  }
}

// ======= 对外统一 API =======================================================
let lastLocation: LocationResult | null = null

export async function getLocation(options: { forceRefresh?: boolean } = {}): Promise<LocationResult> {
  if (!options.forceRefresh && lastLocation) return lastLocation

  const engine = pickEngine()
  console.log('[location] 使用引擎 =', engine)

  // 定位时不显示 toast 提示，静默定位，避免闪烁
  // 用户可在地址栏看到定位状态变化

  // 顶层 Promise.race 超时保护（15秒），无论哪个引擎都不能永远挂起
  const overallTimeout = new Promise<LocationResult>((_, reject) => {
    setTimeout(() => reject(new Error('定位超时（15秒未完成），请点击定位按钮重试')), 15000)
  })

  const actualWork = (async (): Promise<LocationResult> => {
    try {
      let result: LocationResult
      if (engine === 'amap') {
        result = await locateByAmap()
      } else if (engine === 'baidu') {
        result = await locateByBaidu()
      } else {
        result = await locateByBrowser()
      }
      return result
    } catch (err: any) {
      console.warn('[location] 主引擎失败，错误 =', err)
      // 引擎失败时再试一下浏览器原生定位（避免白配置了 key 但是网络问题导致失败）
      if (engine !== 'browser') {
        const fallback = await locateByBrowser()
        console.log('[location] 降级至浏览器兜底，结果 =', fallback)
        return fallback
      }
      throw err
    }
  })()

  const finalResult = await Promise.race([actualWork, overallTimeout])
  lastLocation = finalResult
  console.log('[location] 最终定位结果 =', finalResult)
  return finalResult
}

export function getLastLocation(): LocationResult | null {
  return lastLocation
}

// 展示给用户的社区名：优先用真实地理编码返回的城市+区域，避免被默认社区名（如"阳光社区"）覆盖
export function pickDisplayCommunity(
  result: LocationResult,
  registeredCommunity?: string | null
): string {
  // 1. 优先：逆地理编码返回的真实"市+区"
  if (result.city && result.district) {
    return `${result.city} - ${result.district}`
  }
  if (result.city) {
    return result.city
  }
  if (result.district) {
    return result.district
  }
  if (result.address && result.address.trim()) {
    return result.address
  }
  // 2. 次要：用户注册时的社区名
  if (registeredCommunity && registeredCommunity.trim()) {
    return registeredCommunity
  }
  // 3. 兜底：预设社区
  return result.community || '未知社区'
}

// ======= 免费逆地理编码：OpenStreetMap Nominatim（无需 API key，HTTP(S)）=======
// 用于"浏览器 Geolocation + OSM"的兜底链路：即使用户没配高德/百度 key，
// 也能拿到真实 city/district/address，而不是仅从 COMMUNITIES 列表找最近预设
async function nominatimReverseGeocode(
  lat: number,
  lng: number
): Promise<{ city: string; district: string; address: string }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)  // 6 秒超时 — 拿不到地址就走兜底
  try {
    const url =
      'https://nominatim.openstreetmap.org/reverse?format=json&accept-language=zh-CN' +
      `&lat=${lat}&lon=${lng}&zoom=14`
    const resp = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (!resp.ok) {
      console.warn('[location][Nominatim] HTTP 错误:', resp.status)
      return { city: '', district: '', address: '' }
    }
    // 容错：响应可能不是合法 JSON（Nominatim 429/503 会返回 HTML）
    const text = await resp.text()
    let data: any
    try {
      data = JSON.parse(text)
    } catch (jsonErr) {
      console.warn('[location][Nominatim] 响应非 JSON，已跳过')
      return { city: '', district: '', address: '' }
    }
    const addr = data.address || {}
    const city =
      addr.city || addr.town || addr.municipality || addr.village || addr.county ||
      addr.state || addr.state_district || ''
    const district = addr.suburb || addr.neighbourhood || addr.district || addr.quarter || ''
    const address = data.display_name || `${city} ${district}`
    return { city, district, address }
  } catch (e: any) {
    clearTimeout(timeoutId)
    if (e?.name === 'AbortError') {
      console.warn('[location][Nominatim] 6 秒超时，跳过逆地理编码')
    } else {
      console.warn('[location][Nominatim] 逆地理编码失败：', e)
    }
    return { city: '', district: '', address: '' }
  }
}
