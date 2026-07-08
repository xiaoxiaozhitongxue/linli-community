/**
 * 中国省市区三级数据（覆盖一线 + 新一线城市，约 20 个省市）
 *
 * 数据结构：
 * Province → City[] → District[]
 *
 * 直辖市特殊处理：
 * 北京/上海/天津/重庆：省=市名，市下拉唯一选项即省名
 *
 * 数据来源：民政部行政区划信息
 */
import type { RegionNode } from '../types/location'

export const REGIONS: RegionNode[] = [
  // ==================== 直辖市 ====================
  {
    name: '北京市',
    children: [
      {
        name: '北京市',
        children: [
          { name: '东城区' },
          { name: '西城区' },
          { name: '朝阳区' },
          { name: '海淀区' },
          { name: '丰台区' },
          { name: '石景山区' },
          { name: '通州区' },
          { name: '大兴区' },
          { name: '顺义区' },
          { name: '昌平区' },
          { name: '房山区' },
          { name: '门头沟区' },
          { name: '平谷区' },
          { name: '怀柔区' },
          { name: '密云区' },
          { name: '延庆区' }
        ]
      }
    ]
  },
  {
    name: '天津市',
    children: [
      {
        name: '天津市',
        children: [
          { name: '和平区' },
          { name: '河东区' },
          { name: '河西区' },
          { name: '南开区' },
          { name: '河北区' },
          { name: '红桥区' },
          { name: '东丽区' },
          { name: '西青区' },
          { name: '津南区' },
          { name: '北辰区' },
          { name: '武清区' },
          { name: '宝坻区' },
          { name: '滨海新区' },
          { name: '宁河区' },
          { name: '静海区' },
          { name: '蓟州区' }
        ]
      }
    ]
  },
  {
    name: '上海市',
    children: [
      {
        name: '上海市',
        children: [
          { name: '黄浦区' },
          { name: '徐汇区' },
          { name: '长宁区' },
          { name: '静安区' },
          { name: '普陀区' },
          { name: '虹口区' },
          { name: '杨浦区' },
          { name: '闵行区' },
          { name: '宝山区' },
          { name: '嘉定区' },
          { name: '浦东新区' },
          { name: '金山区' },
          { name: '松江区' },
          { name: '青浦区' },
          { name: '奉贤区' },
          { name: '崇明区' }
        ]
      }
    ]
  },
  {
    name: '重庆市',
    children: [
      {
        name: '重庆市',
        children: [
          { name: '渝中区' },
          { name: '江北区' },
          { name: '沙坪坝区' },
          { name: '九龙坡区' },
          { name: '南岸区' },
          { name: '北碚区' },
          { name: '渝北区' },
          { name: '巴南区' },
          { name: '万州区' },
          { name: '涪陵区' },
          { name: '永川区' },
          { name: '合川区' },
          { name: '江津区' },
          { name: '大渡口区' },
          { name: '綦江区' },
          { name: '璧山区' }
        ]
      }
    ]
  },

  // ==================== 广东省 ====================
  {
    name: '广东省',
    children: [
      {
        name: '广州市',
        children: [
          { name: '越秀区' },
          { name: '海珠区' },
          { name: '荔湾区' },
          { name: '天河区' },
          { name: '白云区' },
          { name: '黄埔区' },
          { name: '花都区' },
          { name: '番禺区' },
          { name: '南沙区' },
          { name: '从化区' },
          { name: '增城区' }
        ]
      },
      {
        name: '深圳市',
        children: [
          { name: '福田区' },
          { name: '罗湖区' },
          { name: '南山区' },
          { name: '盐田区' },
          { name: '宝安区' },
          { name: '龙岗区' },
          { name: '龙华区' },
          { name: '坪山区' },
          { name: '光明区' }
        ]
      },
      {
        name: '佛山市',
        children: [
          { name: '禅城区' },
          { name: '南海区' },
          { name: '顺德区' },
          { name: '高明区' },
          { name: '三水区' }
        ]
      },
      {
        name: '东莞市',
        children: [
          { name: '莞城区' },
          { name: '南城区' },
          { name: '万江区' },
          { name: '东城区' },
          { name: '松山湖区' },
          { name: '虎门镇' },
          { name: '长安镇' },
          { name: '厚街镇' },
          { name: '寮步镇' },
          { name: '大朗镇' },
          { name: '塘厦镇' }
        ]
      }
    ]
  },

  // ==================== 浙江省 ====================
  {
    name: '浙江省',
    children: [
      {
        name: '杭州市',
        children: [
          { name: '上城区' },
          { name: '拱墅区' },
          { name: '西湖区' },
          { name: '滨江区' },
          { name: '萧山区' },
          { name: '余杭区' },
          { name: '临平区' },
          { name: '钱塘区' },
          { name: '富阳区' },
          { name: '临安区' },
          { name: '桐庐县' },
          { name: '淳安县' },
          { name: '建德市' }
        ]
      },
      {
        name: '宁波市',
        children: [
          { name: '海曙区' },
          { name: '江北区' },
          { name: '北仑区' },
          { name: '镇海区' },
          { name: '鄞州区' },
          { name: '奉化区' },
          { name: '余姚市' },
          { name: '慈溪市' },
          { name: '宁海县' },
          { name: '象山县' }
        ]
      },
      {
        name: '温州市',
        children: [
          { name: '鹿城区' },
          { name: '龙湾区' },
          { name: '瓯海区' },
          { name: '洞头区' },
          { name: '瑞安市' },
          { name: '乐清市' },
          { name: '永嘉县' },
          { name: '平阳县' },
          { name: '苍南县' },
          { name: '文成县' },
          { name: '泰顺县' }
        ]
      }
    ]
  },

  // ==================== 江苏省 ====================
  {
    name: '江苏省',
    children: [
      {
        name: '南京市',
        children: [
          { name: '玄武区' },
          { name: '秦淮区' },
          { name: '建邺区' },
          { name: '鼓楼区' },
          { name: '浦口区' },
          { name: '栖霞区' },
          { name: '雨花台区' },
          { name: '江宁区' },
          { name: '六合区' },
          { name: '溧水区' },
          { name: '高淳区' }
        ]
      },
      {
        name: '苏州市',
        children: [
          { name: '姑苏区' },
          { name: '虎丘区' },
          { name: '吴中区' },
          { name: '相城区' },
          { name: '吴江区' },
          { name: '常熟市' },
          { name: '张家港市' },
          { name: '昆山市' },
          { name: '太仓市' }
        ]
      },
      {
        name: '无锡市',
        children: [
          { name: '梁溪区' },
          { name: '锡山区' },
          { name: '惠山区' },
          { name: '滨湖区' },
          { name: '新吴区' },
          { name: '江阴市' },
          { name: '宜兴市' }
        ]
      }
    ]
  },

  // ==================== 四川省 ====================
  {
    name: '四川省',
    children: [
      {
        name: '成都市',
        children: [
          { name: '锦江区' },
          { name: '青羊区' },
          { name: '金牛区' },
          { name: '武侯区' },
          { name: '成华区' },
          { name: '龙泉驿区' },
          { name: '青白江区' },
          { name: '新都区' },
          { name: '温江区' },
          { name: '双流区' },
          { name: '郫都区' },
          { name: '新津区' },
          { name: '都江堰市' },
          { name: '彭州市' },
          { name: '邛崃市' },
          { name: '崇州市' },
          { name: '金堂县' },
          { name: '大邑县' },
          { name: '蒲江县' }
        ]
      }
    ]
  },

  // ==================== 湖北省 ====================
  {
    name: '湖北省',
    children: [
      {
        name: '武汉市',
        children: [
          { name: '江岸区' },
          { name: '江汉区' },
          { name: '硚口区' },
          { name: '汉阳区' },
          { name: '武昌区' },
          { name: '青山区' },
          { name: '洪山区' },
          { name: '东西湖区' },
          { name: '汉南区' },
          { name: '蔡甸区' },
          { name: '江夏区' },
          { name: '黄陂区' },
          { name: '新洲区' }
        ]
      }
    ]
  },

  // ==================== 湖南省 ====================
  {
    name: '湖南省',
    children: [
      {
        name: '长沙市',
        children: [
          { name: '芙蓉区' },
          { name: '天心区' },
          { name: '岳麓区' },
          { name: '开福区' },
          { name: '雨花区' },
          { name: '望城区' },
          { name: '长沙县' },
          { name: '浏阳市' },
          { name: '宁乡市' }
        ]
      }
    ]
  },

  // ==================== 河南省 ====================
  {
    name: '河南省',
    children: [
      {
        name: '郑州市',
        children: [
          { name: '中原区' },
          { name: '二七区' },
          { name: '管城回族区' },
          { name: '金水区' },
          { name: '上街区' },
          { name: '惠济区' },
          { name: '中牟县' },
          { name: '巩义市' },
          { name: '荥阳市' },
          { name: '新密市' },
          { name: '新郑市' },
          { name: '登封市' }
        ]
      }
    ]
  },

  // ==================== 陕西省 ====================
  {
    name: '陕西省',
    children: [
      {
        name: '西安市',
        children: [
          { name: '新城区' },
          { name: '碑林区' },
          { name: '莲湖区' },
          { name: '灞桥区' },
          { name: '未央区' },
          { name: '雁塔区' },
          { name: '阎良区' },
          { name: '临潼区' },
          { name: '长安区' },
          { name: '高陵区' },
          { name: '鄠邑区' },
          { name: '蓝田县' },
          { name: '周至县' }
        ]
      }
    ]
  },

  // ==================== 安徽省 ====================
  {
    name: '安徽省',
    children: [
      {
        name: '合肥市',
        children: [
          { name: '瑶海区' },
          { name: '庐阳区' },
          { name: '蜀山区' },
          { name: '包河区' },
          { name: '长丰县' },
          { name: '肥东县' },
          { name: '肥西县' },
          { name: '庐江县' },
          { name: '巢湖市' }
        ]
      }
    ]
  },

  // ==================== 福建省 ====================
  {
    name: '福建省',
    children: [
      {
        name: '福州市',
        children: [
          { name: '鼓楼区' },
          { name: '台江区' },
          { name: '仓山区' },
          { name: '马尾区' },
          { name: '晋安区' },
          { name: '长乐区' },
          { name: '闽侯县' },
          { name: '连江县' },
          { name: '罗源县' },
          { name: '闽清县' },
          { name: '永泰县' },
          { name: '平潭县' },
          { name: '福清市' }
        ]
      },
      {
        name: '厦门市',
        children: [
          { name: '思明区' },
          { name: '海沧区' },
          { name: '湖里区' },
          { name: '集美区' },
          { name: '同安区' },
          { name: '翔安区' }
        ]
      }
    ]
  },

  // ==================== 山东省 ====================
  {
    name: '山东省',
    children: [
      {
        name: '济南市',
        children: [
          { name: '历下区' },
          { name: '市中区' },
          { name: '槐荫区' },
          { name: '天桥区' },
          { name: '历城区' },
          { name: '长清区' },
          { name: '章丘区' },
          { name: '济阳区' },
          { name: '莱芜区' },
          { name: '钢城区' },
          { name: '平阴县' },
          { name: '商河县' }
        ]
      },
      {
        name: '青岛市',
        children: [
          { name: '市南区' },
          { name: '市北区' },
          { name: '黄岛区' },
          { name: '崂山区' },
          { name: '李沧区' },
          { name: '城阳区' },
          { name: '即墨区' },
          { name: '胶州市' },
          { name: '平度市' },
          { name: '莱西市' }
        ]
      }
    ]
  }
]

/**
 * 获取所有省份名称列表
 */
export function getProvinceList(): string[] {
  return REGIONS.map((p) => p.name)
}

/**
 * 根据省份名称获取城市列表
 */
export function getCityList(provinceName: string): string[] {
  const province = REGIONS.find((p) => p.name === provinceName)
  if (!province || !province.children) return []
  return province.children.map((c) => c.name)
}

/**
 * 根据省份名称和城市名称获取区县列表
 */
export function getDistrictList(provinceName: string, cityName: string): string[] {
  const province = REGIONS.find((p) => p.name === provinceName)
  if (!province || !province.children) return []
  const city = province.children.find((c) => c.name === cityName)
  if (!city || !city.children) return []
  return city.children.map((d) => d.name)
}

/**
 * 判断是否为直辖市
 */
export function isMunicipality(provinceName: string): boolean {
  return ['北京市', '天津市', '上海市', '重庆市'].includes(provinceName)
}

/**
 * 根据城市名/区名自动匹配所在省
 * 用于 autoFill 定位
 */
export function matchProvince(cityName: string, districtName: string): { province: string; city: string } | null {
  // 1. 精确匹配直辖市（省=市）
  const munMap: Record<string, string> = {
    '北京': '北京市',
    '上海': '上海市',
    '天津': '天津市',
    '重庆': '重庆市'
  }
  for (const [short, full] of Object.entries(munMap)) {
    if (cityName.includes(short) || districtName.includes(short)) {
      return { province: full, city: full }
    }
  }

  // 2. 遍历所有省找城市匹配
  for (const province of REGIONS) {
    if (!province.children) continue
    for (const city of province.children) {
      // 城市名匹配（cityName 可能含 "市" 后缀）
      const cleanCityName = city.name.replace(/市$/, '')
      const cleanMatch = cityName.replace(/市$/, '')
      if (cleanCityName === cleanMatch || city.name === cityName) {
        return { province: province.name, city: city.name }
      }
    }
  }

  return null
}
