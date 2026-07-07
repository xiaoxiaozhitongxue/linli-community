/**
 * 社区列表 —— 单一数据源（Single Source of Truth）
 * ----------------------------------------------------------------------------
 * 此前社区列表分散在：
 *   - src/utils/location.ts（带经纬度的预设社区，用于定位兜底）
 *   - src/pages/register/index.vue（注册时选择社区的下拉项）
 * 两者各自维护、内容不一致。本文件统一维护，其他模块一律从这里引用。
 */

export interface CommunityPreset {
  name: string
  lat: number
  lng: number
  city?: string
  district?: string
  keywords?: string[]
}

/**
 * 标准社区列表（并集）：
 *  - 保留 location.ts 中带经纬度的预设社区（用于定位兜底匹配）；
 *  - 并入 register 中独有、但无坐标的社区，补全默认坐标（上海），保证下拉选项完整。
 */
export const COMMUNITIES: CommunityPreset[] = [
  { name: '阳光社区', lat: 31.2304, lng: 121.4737, city: '上海', district: '浦东新区', keywords: ['浦东', '陆家嘴', '黄浦'] },
  { name: '幸福家园', lat: 31.2345, lng: 121.4821, city: '上海', district: '黄浦区', keywords: ['黄浦', '人民广场', '南京东路'] },
  { name: '和谐里', lat: 31.2289, lng: 121.4654, city: '上海', district: '静安区', keywords: ['静安', '南京路', '曹家渡'] },
  { name: '温馨苑', lat: 31.2387, lng: 121.4912, city: '上海', district: '虹口区', keywords: ['虹口', '四川北路'] },
  { name: '美好社区', lat: 31.2412, lng: 121.4589, city: '上海', district: '普陀区', keywords: ['普陀', '长寿路'] },
  { name: '康乐家园', lat: 31.2256, lng: 121.4798, city: '上海', district: '徐汇区', keywords: ['徐汇', '漕河泾'] },
  { name: '朝阳社区', lat: 39.9219, lng: 116.4439, city: '北京', district: '朝阳区', keywords: ['朝阳', '国贸', '三里屯'] },
  { name: '海淀家园', lat: 39.959, lng: 116.298, city: '北京', district: '海淀区', keywords: ['海淀', '中关村', '五道口'] },
  { name: '天河里', lat: 23.1291, lng: 113.2644, city: '广州', district: '天河区', keywords: ['天河', '珠江新城'] },
  { name: '南山社区', lat: 22.5431, lng: 113.9344, city: '深圳', district: '南山区', keywords: ['南山', '科技园', '蛇口'] },
  // 以下为 register 独有社区，默认归入上海（仅用于下拉选择，不参与定位匹配）
  { name: '幸福社区', lat: 31.2304, lng: 121.4737, city: '上海', district: '浦东新区' },
  { name: '花园社区', lat: 31.2304, lng: 121.4737, city: '上海', district: '浦东新区' },
  { name: '和平社区', lat: 31.2304, lng: 121.4737, city: '上海', district: '浦东新区' },
  { name: '东风社区', lat: 31.2304, lng: 121.4737, city: '上海', district: '浦东新区' },
  { name: '向日葵小镇', lat: 31.2304, lng: 121.4737, city: '上海', district: '浦东新区' },
]

/** 仅社区名称列表（用于注册/资料编辑的社区下拉选择器） */
export const COMMUNITY_NAMES: string[] = COMMUNITIES.map((c) => c.name)

/** 按名称查找社区预设 */
export function findCommunityByName(name?: string | null): CommunityPreset | undefined {
  if (!name) return undefined
  return COMMUNITIES.find((c) => c.name === name)
}
