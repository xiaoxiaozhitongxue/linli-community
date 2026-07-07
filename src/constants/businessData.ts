/**
 * 社区创业相关静态数据（单一数据源）
 * ----------------------------------------------------------------------------
 * 此前 business/index.vue 内的热门商品 / 附近小店 / 创业故事 / 订单 等数据
 * 直接硬编码在页面里，导致 product / shop-detail / story / orders 等子页面
 * 无法按 id 取到对应数据。现统一收口到本文件，子页面通过 id 查询复用。
 */

export interface HotProduct {
  id: string
  name: string
  emoji: string
  bgColor: string
  price: number
  sales: number
  isHot: boolean
  shopName: string
  distance: number
  category: string
  desc?: string
}

export const HOT_PRODUCTS: HotProduct[] = [
  { id: '1', name: '柠檬磅蛋糕', emoji: '🍰', bgColor: '#FFF9C4', price: 38, sales: 234, isHot: true, shopName: '小红的烘焙坊', distance: 120, category: 'food', desc: '选用新鲜柠檬手工烘焙，酸甜不腻，适合下午茶与送礼。' },
  { id: '2', name: '私房红烧肉', emoji: '🍖', bgColor: '#FFCCBC', price: 68, sales: 156, isHot: true, shopName: '王阿姨私房菜', distance: 200, category: 'cooking', desc: '传承家味的慢炖红烧肉，肥而不腻、入口即化。' },
  { id: '3', name: '手工编织包', emoji: '👜', bgColor: '#E1BEE7', price: 128, sales: 45, isHot: false, shopName: '手工达人小坊', distance: 350, category: 'handmade', desc: '纯手工钩针编织，每一只都是独一无二。' },
  { id: '4', name: '鲜榨果汁', emoji: '🍹', bgColor: '#B2DFDB', price: 18, sales: 567, isHot: true, shopName: '健康果汁铺', distance: 80, category: 'food', desc: '当季鲜果现榨，0 添加，健康又好喝。' },
  { id: '5', name: '雪花酥礼盒', emoji: '🍬', bgColor: '#F8BBD0', price: 48, sales: 312, isHot: true, shopName: '小红的烘焙坊', distance: 120, category: 'food', desc: '酥香可口的雪花酥，独立包装送礼体面。' },
  { id: '6', name: '家传卤味拼盘', emoji: '🍗', bgColor: '#FFE0B2', price: 88, sales: 198, isHot: false, shopName: '王阿姨私房菜', distance: 200, category: 'cooking', desc: '多种卤味拼盘，下饭下酒都合适。' },
  { id: '7', name: '钩针杯垫套装', emoji: '🧶', bgColor: '#D1C4E9', price: 35, sales: 67, isHot: false, shopName: '手工达人小坊', distance: 350, category: 'handmade', desc: '三件装钩针杯垫，环保棉线、隔热防滑。' },
  { id: '8', name: '宠物上门喂养', emoji: '🐱', bgColor: '#C8E6C9', price: 50, sales: 89, isHot: true, shopName: '宠物生活馆', distance: 250, category: 'service', desc: '出差旅行不用愁，专人上门喂猫遛狗。' }
]

export interface NearbyShop {
  id: string
  name: string
  emoji: string
  bgColor: string
  description: string
  rating: number
  monthlySales: number
  distance: number
}

export const NEARBY_SHOPS: NearbyShop[] = [
  { id: '1', name: '王阿姨私房菜', emoji: '🍳', bgColor: '#FFCCBC', description: '20年厨艺，为邻居带来家的味道', rating: 4.8, monthlySales: 456, distance: 150 },
  { id: '2', name: '老张的早餐铺', emoji: '🥟', bgColor: '#C8E6C9', description: '手工水饺、包子，现包现蒸', rating: 4.7, monthlySales: 789, distance: 200 },
  { id: '3', name: '手工DIY工作坊', emoji: '🎨', bgColor: '#F3E5F5', description: '亲子手工、创意DIY', rating: 4.9, monthlySales: 234, distance: 300 },
  { id: '4', name: '宠物生活馆', emoji: '🐾', bgColor: '#E8F5E9', description: '宠物零食、玩具、上门服务', rating: 4.6, monthlySales: 345, distance: 250 },
  { id: '5', name: '绿植盆栽小铺', emoji: '🌿', bgColor: '#E0F2F1', description: '多肉植物、空气凤梨，美化你的家', rating: 4.8, monthlySales: 267, distance: 180 }
]

export interface SuccessStory {
  id: string
  title: string
  excerpt: string
  cover: string
  avatar: string
  author: string
  content: string
}

export const SUCCESS_STORIES: SuccessStory[] = [
  {
    id: '1',
    title: '从家庭主妇到月入过万的烘焙店主',
    excerpt: '王阿姨的烘焙之路，从给邻居送蛋糕开始，如今已是社区里的明星店主...',
    cover: 'https://picsum.photos/300/200?random=10',
    avatar: '',
    author: '王阿姨',
    content: '王阿姨退休后喜欢在家研究烘焙，起初只是送给邻里尝鲜。口碑传开后，订单越来越多，她干脆在「邻里社区」开通了小店。如今她雇了两名兼职邻居，月入过万，还带出了一批烘焙爱好者。'
  },
  {
    id: '2',
    title: '程序员下班后做私房菜的真实故事',
    excerpt: '小李利用周末时间为邻居做健康私房菜，不仅赚了零花钱，还交到了朋友...',
    cover: 'https://picsum.photos/300/200?random=11',
    avatar: '',
    author: '小李',
    content: '小李是一名普通程序员，周末喜欢下厨。他在社区发布私房菜预订后，意外收获了一批「铁粉」。做菜让他放松，邻居的反馈让他有成就感，副业与社交一举两得。'
  },
  {
    id: '3',
    title: '退休教师的手工编织创业记',
    excerpt: '刘老师退休后重拾编织爱好，现在她的手工包要排队一个月才能买到...',
    cover: 'https://picsum.photos/300/200?random=12',
    avatar: '',
    author: '刘老师',
    content: '刘老师退休后重拾年轻时的编织手艺，在平台上分享作品后被大量收藏。如今她的手工包需要提前一个月预订，她还开设了免费编织课堂，把快乐传递给更多邻居。'
  }
]

export interface ShopOrder {
  id: string
  productName: string
  buyerName: string
  price: number
  date: string
  status: string
}

export const INITIAL_ORDERS: ShopOrder[] = [
  { id: '1', productName: '柠檬磅蛋糕 x2', buyerName: '李邻居', price: 76, date: '今天 10:30', status: 'paid' },
  { id: '2', productName: '手工编织包 x1', buyerName: '赵女士', price: 128, date: '昨天 14:20', status: 'shipped' },
  { id: '3', productName: '私房红烧肉 x1', buyerName: '周先生', price: 68, date: '昨天 18:00', status: 'completed' },
  { id: '4', productName: '鲜榨果汁 x3', buyerName: '吴阿姨', price: 54, date: '前天 09:00', status: 'completed' },
  { id: '5', productName: '雪花酥礼盒 x1', buyerName: '郑邻居', price: 48, date: '3天前', status: 'completed' }
]

export const DEFAULT_SHOP = {
  name: '小红的烘焙坊',
  emoji: '🧁',
  bgColor: '#FFE0B2',
  products: 12,
  orders: 89,
  rating: 4.9
}

export const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'food', label: '🍰 烘焙' },
  { key: 'cooking', label: '🍳 私房菜' },
  { key: 'handmade', label: '🎨 手工' },
  { key: 'service', label: '🛠️ 服务' }
]

/** 订单状态 -> 中文标签（统一来源，供 index / orders 页复用） */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  paid: '待发货',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消'
}

export function getOrderStatusName(status: string): string {
  return ORDER_STATUS_LABELS[status] || status
}
