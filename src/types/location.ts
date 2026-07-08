/**
 * 位置数据类型定义
 */

/**
 * 省市区三级数据节点
 */
export interface RegionNode {
  /** 名称（如 "上海市"、"浦东新区"） */
  name: string
  /** 子级列表（市或区） */
  children?: RegionNode[]
}

/**
 * 位置表单数据结构
 */
export interface LocationForm {
  /** 国家（固定为 "中国"） */
  country: string
  /** 省 */
  province: string
  /** 市 */
  city: string
  /** 区 */
  district: string
  /** 详细地址 */
  address: string
}

/**
 * 级联选择的状态快照
 * 用于判断表单是否已完整填写
 */
export interface LocationFormSnapshot {
  province: string
  city: string
  district: string
  address: string
}
