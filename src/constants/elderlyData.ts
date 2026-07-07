/**
 * 养老服务相关静态数据（单一数据源）
 * ----------------------------------------------------------------------------
 * 此前老人关怀页的「关怀技巧(careTips)」「帮扶记录(recentRecords)」等数据
 * 直接硬编码在 elderly/index.vue 内，导致 tip-detail / all-records 等子页面
 * 无法复用。现统一收口到本文件，子页面直接引用，避免重复维护。
 */

export interface CareTip {
  id: string
  title: string
  desc: string
  icon: string
  bgColor: string
  /** 详情页正文（多段落） */
  content: string[]
}

export const CARE_TIPS: CareTip[] = [
  {
    id: '1',
    title: '如何与老人有效沟通',
    desc: '倾听、耐心、尊重是沟通的关键...',
    icon: '💡',
    bgColor: '#FFF9C4',
    content: [
      '与老人沟通时，语速要适中、吐字要清晰，必要时配合手势或书写。',
      '多用封闭式提问降低理解成本，例如「您是想喝水还是吃水果？」',
      '倾听比表达更重要：当老人重复讲述往事时，请给予积极回应，这能极大缓解孤独感。',
      '尊重老人的意愿与节奏，不替他们做决定，而是提供选项让其自主选择。'
    ]
  },
  {
    id: '2',
    title: '老人心理关怀要点',
    desc: '关注情绪变化，及时疏导...',
    icon: '🧠',
    bgColor: '#E1BEE7',
    content: [
      '退休、丧偶、空巢等生活事件容易引发失落与焦虑，需要家人持续关注。',
      '鼓励老人培养兴趣爱好、参与社区活动，建立新的社会连接。',
      '发现持续情绪低落、失眠、食欲下降超过两周，应及时寻求专业帮助。',
      '陪伴本身即是最好的关怀：定期电话或上门探望胜过物质给予。'
    ]
  },
  {
    id: '3',
    title: '急救知识科普',
    desc: '心肺复苏、海姆立克急救法...',
    icon: '🏥',
    bgColor: '#FFCCBC',
    content: [
      '心肺复苏（CPR）：确认无意识无呼吸后，双手交叠于胸骨中下段，垂直按压，频率 100-120 次/分，深度约 5 厘米。',
      '海姆立克急救法：站于患者背后，一手握拳抵住其上腹部（肚脐上方两横指），另一手包住拳头，快速向内上方冲击。',
      '突发跌倒不要急于扶起，先判断有无骨折或意识问题，必要时原地等待急救。',
      '家中应常备急救电话卡与常用药清单，放在老人易取处。'
    ]
  },
  {
    id: '4',
    title: '老人防跌倒指南',
    desc: '居家安全改造、防滑措施...',
    icon: '🦯',
    bgColor: '#C8E6C9',
    content: [
      '地面：去除门槛、地毯固定、卫生间铺设防滑垫并安装扶手。',
      '照明：走廊、卧室、卫生间保持夜间柔光照明，避免摸黑行走。',
      '着装：选择防滑鞋底的软底鞋，避免过长裤脚拖地。',
      '运动：适度进行平衡与力量训练（如太极），增强下肢稳定性。'
    ]
  }
]

/** 初始帮扶记录（首次进入时作为本地种子数据） */
export interface CareRecord {
  id: string
  type: string
  icon: string
  date: string
  status: string
  bgColor: string
}

export const INITIAL_RECORDS: CareRecord[] = [
  { id: '1', type: '帮买菜', icon: '🛒', date: '今天 10:30', status: 'completed', bgColor: '#E8F5E9' },
  { id: '2', type: '陪诊服务', icon: '🏥', date: '昨天 14:00', status: 'completed', bgColor: '#E3F2FD' },
  { id: '3', type: '定期探访', icon: '👵', date: '3天前', status: 'completed', bgColor: '#FFF3E0' },
  { id: '4', type: '家政服务', icon: '🧹', date: '本周一', status: 'ongoing', bgColor: '#FCE4EC' },
  { id: '5', type: '代取快递', icon: '📦', date: '6月3日', status: 'pending', bgColor: '#F3E5F5' }
]

/** 老人关怀服务类型（service-request 页使用） */
export const SERVICE_TYPES: { id: string; name: string; icon: string; desc: string; bgColor: string }[] = [
  { id: '1', name: '帮买菜', icon: '🛒', desc: '代购生活用品', bgColor: '#E8F5E9' },
  { id: '2', name: '陪诊服务', icon: '🏥', desc: '陪同就医', bgColor: '#E3F2FD' },
  { id: '3', name: '暖心陪聊', icon: '💬', desc: '视频/语音陪伴', bgColor: '#FFF3E0' },
  { id: '4', name: '家政服务', icon: '🧹', desc: '打扫卫生', bgColor: '#FCE4EC' },
  { id: '5', name: '代取快递', icon: '📦', desc: '帮忙取件', bgColor: '#F3E5F5' },
  { id: '6', name: '维修服务', icon: '🔧', desc: '小修小补', bgColor: '#E0F2F1' },
  { id: '7', name: '代缴水电', icon: '💡', desc: '生活缴费', bgColor: '#FFF9C4' },
  { id: '8', name: '理发服务', icon: '💇', desc: '上门理发', bgColor: '#FFE0B2' },
  { id: '9', name: '送餐服务', icon: '🍱', desc: '爱心送餐', bgColor: '#F8BBD0' }
]
