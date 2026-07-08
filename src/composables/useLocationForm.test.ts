/**
 * useLocationForm 单元测试
 * 测试核心功能：级联选择、autoFill、getSubmitValue、直辖市处理
 */
import { describe, it, expect } from 'vitest'
import { useLocationForm } from './useLocationForm'
import type { LocationResult } from '../utils/location'

describe('useLocationForm', () => {
  it('provinces 返回所有省份列表', () => {
    const { provinces } = useLocationForm()
    expect(provinces.value.length).toBeGreaterThan(10)
    expect(provinces.value).toContain('北京市')
    expect(provinces.value).toContain('上海市')
    expect(provinces.value).toContain('广东省')
  })

  it('cities 根据省份变化联动', () => {
    const { form, cities, provinces } = useLocationForm()
    // 初始为空
    expect(cities.value).toEqual([])

    // 选中北京市
    form.value.province = '北京市'
    expect(cities.value).toEqual(['北京市'])

    // 选中广东省
    form.value.province = '广东省'
    expect(cities.value.length).toBeGreaterThan(1)
    expect(cities.value).toContain('广州市')
    expect(cities.value).toContain('深圳市')
  })

  it('districts 根据省份和城市联动', () => {
    const { form, districts } = useLocationForm()
    form.value.province = '上海市'
    form.value.city = '上海市'
    expect(districts.value.length).toBeGreaterThan(5)
    expect(districts.value).toContain('浦东新区')
    expect(districts.value).toContain('黄浦区')
  })

  it('districts 为空当省份或城市未选时', () => {
    const { form, districts } = useLocationForm()
    form.value.province = '上海市'
    expect(districts.value).toEqual([]) // city 还没选
  })

  it('直辖市 isMunicipality 判断正确', () => {
    const { form, districts } = useLocationForm()
    form.value.province = '北京市'
    form.value.city = '北京市'
    expect(districts.value.length).toBeGreaterThan(5)
    expect(districts.value).toContain('海淀区')
  })

  it('autoFill 从定位结果正确填充省市区', () => {
    const { form, autoFill, provinces } = useLocationForm()

    const mockResult: LocationResult = {
      longitude: 121.47,
      latitude: 31.23,
      city: '上海市',
      district: '浦东新区',
      address: '上海市浦东新区张江路100号',
      community: '张江镇',
      provider: 'browser'
    }

    autoFill(mockResult)

    expect(form.value.country).toBe('中国')
    expect(form.value.province).toBe('上海市')
    expect(form.value.city).toBe('上海市') // 直辖市处理
    expect(form.value.district).toBe('浦东新区')
    expect(form.value.address).toBe('上海市浦东新区张江路100号')
  })

  it('autoFill 广东省非直辖市填充', () => {
    const { form, autoFill } = useLocationForm()

    const mockResult: LocationResult = {
      longitude: 113.26,
      latitude: 23.13,
      city: '广州市',
      district: '天河区',
      address: '广州市天河区珠江新城',
      community: '天河',
      provider: 'browser'
    }

    autoFill(mockResult)

    expect(form.value.province).toBe('广东省')
    expect(form.value.city).toBe('广州市')
    expect(form.value.district).toBe('天河区')
    expect(form.value.address).toBe('广州市天河区珠江新城')
  })

  it('autoFill 定位结果 district 模糊匹配', () => {
    const { form, autoFill } = useLocationForm()

    const mockResult: LocationResult = {
      longitude: 116.39,
      latitude: 39.91,
      city: '北京市',
      district: '朝阳',
      address: '北京市朝阳区望京',
      community: '望京',
      provider: 'browser'
    }

    autoFill(mockResult)
    expect(form.value.province).toBe('北京市')
    // "朝阳" 应模糊匹配到 "朝阳区"
    expect(form.value.district).toContain('朝阳')
  })

  it('getSubmitValue 格式化为 "省-市-区 详细地址"', () => {
    const { form, getSubmitValue } = useLocationForm()
    form.value.province = '广东省'
    form.value.city = '深圳市'
    form.value.district = '南山区'
    form.value.address = '科技园南区'

    expect(getSubmitValue()).toBe('广东省-深圳市-南山区 科技园南区')
  })

  it('getSubmitValue 直辖市格式正确', () => {
    const { form, getSubmitValue } = useLocationForm()
    form.value.province = '上海市'
    form.value.city = '上海市'
    form.value.district = '浦东新区'
    form.value.address = '张江路100号'

    expect(getSubmitValue()).toBe('上海市-上海市-浦东新区 张江路100号')
  })

  it('getSubmitValue 无详细地址时只返回省市区', () => {
    const { form, getSubmitValue } = useLocationForm()
    form.value.province = '浙江省'
    form.value.city = '杭州市'
    form.value.district = '西湖区'

    expect(getSubmitValue()).toBe('浙江省-杭州市-西湖区')
  })

  it('isRegionComplete 判断完整度', () => {
    const { form, isRegionComplete } = useLocationForm()
    expect(isRegionComplete.value).toBe(false)

    form.value.province = '广东省'
    expect(isRegionComplete.value).toBe(false)

    form.value.city = '广州市'
    expect(isRegionComplete.value).toBe(false)

    form.value.district = '天河区'
    expect(isRegionComplete.value).toBe(true)
  })

  it('reset 清空表单', () => {
    const { form, reset, autoFill } = useLocationForm()

    const mockResult: LocationResult = {
      longitude: 121.47,
      latitude: 31.23,
      city: '上海市',
      district: '浦东新区',
      address: '上海市浦东新区',
      community: '张江',
      provider: 'browser'
    }

    autoFill(mockResult)
    expect(form.value.province).toBe('上海市')

    reset()
    expect(form.value.province).toBe('')
    expect(form.value.city).toBe('')
    expect(form.value.district).toBe('')
    expect(form.value.address).toBe('')
  })
})
