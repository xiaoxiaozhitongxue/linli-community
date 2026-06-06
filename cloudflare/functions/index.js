export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // API路由处理
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env)
    }

    // 静态文件处理
    return env.ASSETS.fetch(request)
  }
}

async function handleAPI(request, env) {
  const url = new URL(request.url)
  const path = url.pathname

  // CORS头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    let response

    // 路由匹配
    if (path === '/api/auth/login' && request.method === 'POST') {
      response = await handleLogin(request, env)
    } else if (path === '/api/user/profile' && request.method === 'GET') {
      response = await handleGetProfile(request, env)
    } else if (path === '/api/tasks' && request.method === 'POST') {
      response = await handleCreateTask(request, env)
    } else if (path.startsWith('/api/tasks/match')) {
      response = await handleMatchTasks(request, env)
    } else if (path.startsWith('/api/community/feed')) {
      response = await handleCommunityFeed(request, env)
    } else if (path === '/api/business/shop' && request.method === 'GET') {
      response = await handleGetShop(request, env)
    } else if (path === '/api/elderly/help' && request.method === 'POST') {
      response = await handleElderlyHelp(request, env)
    } else {
      response = new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 添加CORS头
    const newHeaders = new Headers(response.headers)
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value)
    })

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
}

// 模拟用户数据
const mockUsers = [
  {
    id: '1',
    name: '小明',
    phone: '13800138000',
    avatar: 'https://i.pravatar.cc/100?img=10',
    community: '阳光社区',
    role: 'volunteer'
  }
]

// 模拟任务数据
const mockTasks = []
const mockPosts = [
  {
    id: '1',
    username: '王阿姨',
    avatar: 'https://i.pravatar.cc/100?img=1',
    time: '10分钟前',
    content: '今天在社区花园看到好多邻居在遛狗，孩子们玩得可开心了！',
    likes: 128,
    comments: 23
  }
]

async function handleLogin(request, env) {
  const { phone, code } = await request.json()

  // 简单验证
  if (!phone || !code) {
    return new Response(JSON.stringify({ error: '缺少参数' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // 返回模拟token和用户信息
  return new Response(JSON.stringify({
    token: 'mock_token_' + Date.now(),
    user: mockUsers[0]
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleGetProfile(request, env) {
  return new Response(JSON.stringify(mockUsers[0]), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleCreateTask(request, env) {
  const body = await request.json()
  const task = {
    id: Date.now().toString(),
    ...body,
    status: 'open',
    created_at: Date.now()
  }
  mockTasks.push(task)

  return new Response(JSON.stringify({ taskId: task.id }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleMatchTasks(request, env) {
  // 返回模拟匹配结果
  const matches = mockUsers.slice(0, 3).map(user => ({
    ...user,
    rating: 4.8 + Math.random() * 0.2,
    distance: Math.floor(Math.random() * 500) + 50,
    completedTasks: Math.floor(Math.random() * 100) + 10
  }))

  return new Response(JSON.stringify({ matches }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleCommunityFeed(request, env) {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')

  return new Response(JSON.stringify({
    posts: mockPosts,
    page,
    hasMore: false
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleGetShop(request, env) {
  const shop = {
    id: '1',
    name: '小红的烘焙坊',
    emoji: '🧁',
    products: 12,
    orders: 89,
    rating: 4.9
  }

  return new Response(JSON.stringify({ shop }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleElderlyHelp(request, env) {
  const body = await request.json()

  return new Response(JSON.stringify({
    success: true,
    message: '帮扶请求已发送'
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
