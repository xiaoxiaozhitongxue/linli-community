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

import { toastInfo } from './toast'

// ======= 可配置项（推荐用 Vite env 注入）====================================
// 从 Vite 环境变量读取；若无配置则自动走浏览器原生定位兜底
const AMAP_KEY: string = (import.meta as any).env?.VITE_AMAP_KEY || ''
const AMAP_SECURITY: string = (import.meta as any).env?.VITE_AMAP_SECURITY || ''
const BAIDU_KEY: string = (import.meta as any).env?.VITE_BAIDU_KEY || ''

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

// ======= 本地社区列表（按城市+区域做关键词匹配兜底）=======================
export interface CommunityPreset {
  name: string
  lat: number
  lng: number
  city?: string
  district?: string
  keywords?: string[]   // 用于和逆地理编码结果做模糊匹配
}

export const COMMUNITIES: CommunityPreset[] = [
  { name: '阳光社区', lat: 31.2304, lng: 121.4737, city: '上海', district: '浦东新区', keywords: ['浦东', '陆家嘴', '黄浦'] },
  { name: '幸福家园', lat: 31.2345, lng: 121.4821, city: '上海', district: '黄浦区', keywords: ['黄浦', '人民广场', '南京东路'] },
  { name: '和谐里', lat: 31.2289, lng: 121.4654, city: '上海', district: '静安区', keywords: ['静安', '南京路', '曹家渡'] },
  { name: '温馨苑', lat: 31.2387, lng: 121.4912, city: '上海', district: '虹口区', keywords: ['虹口', '四川北路'] },
  { name: '美好社区', lat: 31.2412, lng: 121.4589, city: '上海', district: '普陀区', keywords: ['普陀', '长寿路'] },
  { name: '康乐家园', lat: 31.2256, lng: 121.4798, city: '上海', district: '徐汇区', keywords: ['徐汇', '漕河泾'] },
  { name: '朝阳社区', lat: 39.9219, lng: 116.4439, city: '北京', district: '朝阳区', keywords: ['朝阳', '国贸', '三里屯'] },
  { name: '海淀家园', lat: 39.9590, lng: 116.2980, city: '北京', district: '海淀区', keywords: ['海淀', '中关村', '五道口'] },
  { name: '天河里', lat: 23.1291, lng: 113.2644, city: '广州', district: '天河区', keywords: ['天河', '珠江新城'] },
  { name: '南山社区', lat: 22.5431, lng: 113.9344, city: '深圳', district: '南山区', keywords: ['南山', '科技园', '蛇口'] },
]

// ======= 脚本懒加载工具（避免在 index.html 中写死 script 标签）============
let scriptInjected: { [k: string]: Promise<any> } = {}

function injectScript(src: string, globalName: string, timeoutMs = 10000): Promise<any> {
  if (scriptInjected[src]) return scriptInjected[src]
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
    if (!('geolocation' in navigator)) {
      reject(new Error('您的浏览器不支持定位功能'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        })
      },
      (error) => {
        let msg = '定位失败'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = '请在浏览器设置中允许获取位置信息'
            break
          case error.POSITION_UNAVAILABLE:
            msg = '当前无法获取位置信息'
            break
          case error.TIMEOUT:
            msg = '获取位置超时，请重试'
            break
        }
        reject(new Error(msg))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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

  const coords = await new Promise<{ longitude: number; latitude: number; formattedAddress?: string }>(
    (resolve, reject) => {
      plugin.plugin('AMap.Geolocation', () => {
        const geolocation = new plugin.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
          showButton: false,
          showCircle: false,
          showMarker: false,
        })
        geolocation.getCurrentPosition((status: string, result: any) => {
          if (status === 'complete') {
            resolve({
              longitude: result.position.lng,
              latitude: result.position.lat,
              formattedAddress: result.formattedAddress,
            })
          } else {
            // 高德定位失败，fallback 到浏览器 geolocation
            browserGetCoords().then(resolve).catch(reject)
          }
        })
      })
    }
  )

  // 逆地理编码（city/district）
  const regeo = await new Promise<{ city: string; district: string; address: string }>((resolve) => {
    plugin.plugin('AMap.Geocoder', () => {
      const gc = new plugin.Geocoder({ city: '全国' })
      gc.getAddress([coords.longitude, coords.latitude], (status: string, result: any) => {
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
  const coords = await new Promise<{ longitude: number; latitude: number }>((resolve, reject) => {
    geo.getCurrentPosition(
      (result: any) => {
        if (result) {
          resolve({
            longitude: result.point.lng,
            latitude: result.point.lat,
          })
        } else {
          browserGetCoords().then(resolve).catch(reject)
        }
      },
      (err: any) => {
        browserGetCoords().then(resolve).catch(reject)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })

  // 百度逆地理编码
  const myGeo = new BMap.Geocoder()
  const regeo = await new Promise<{ city: string; district: string; address: string }>((resolve) => {
    myGeo.getLocation(new BMap.Point(coords.longitude, coords.latitude), (result: any) => {
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

// ======= 浏览器兜底（仅经纬度 + 距离匹配社区）===============================
async function locateByBrowser(): Promise<LocationResult> {
  const coords = await browserGetCoords()
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

  // 浏览器定位前提示用户（部分浏览器需要用户手动授权）
  toastInfo(
    engine === 'browser'
      ? '正在使用浏览器定位，请在弹窗中允许...'
      : '正在定位中，请稍候...'
  )

  try {
    let result: LocationResult
    if (engine === 'amap') {
      result = await locateByAmap()
    } else if (engine === 'baidu') {
      result = await locateByBaidu()
    } else {
      result = await locateByBrowser()
    }
    lastLocation = result
    return result
  } catch (err: any) {
    // 引擎失败时再试一下浏览器原生定位（避免白配置了 key 但是网络问题导致失败）
    if (engine !== 'browser') {
      try {
        const fallback = await locateByBrowser()
        lastLocation = fallback
        return fallback
      } catch (_) { /* ignore */ }
    }
    throw err
  }
}

export function getLastLocation(): LocationResult | null {
  return lastLocation
}

// 展示给用户的社区名（优先使用当前用户注册的 community）
export function pickDisplayCommunity(
  result: LocationResult,
  registeredCommunity?: string | null
): string {
  if (registeredCommunity && registeredCommunity.trim()) {
    return registeredCommunity
  }
  if (result.district && result.city) {
    return `${result.city.replace(/市$/, '')} · ${result.district.replace(/区$/, '')}`
  }
  return result.community || '未知社区'
}
