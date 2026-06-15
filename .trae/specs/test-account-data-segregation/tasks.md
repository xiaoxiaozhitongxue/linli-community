# 测试账号数据隔离与功能完善 - 任务列表

## Task 1: 修改 getDefaultBusiness 支持按手机号初始化示例数据

**Files:**
- Modify: `src/utils/storage.ts`

**Description:**
- 修改 `getDefaultBusiness` 函数，接收手机号参数
- 根据手机号返回对应账号的示例数据
- 保持向后兼容（不传参数时返回空数据）

**Acceptance Criteria Addressed:** 账号1示例数据, 账号2示例数据

- [x] **Step 1: 查看 getDefaultBusiness 完整实现**

```typescript
// 查看当前函数结构
function getDefaultBusiness(phone?: string): BusinessData
```

- [x] **Step 2: 创建两个账号的示例数据函数**

```typescript
function getAccount1Business(): BusinessData {
  const now = Date.now()
  return {
    posts: [...], // 张阿姨的帖子
    activities: [...], // 张阿姨的活动
    tasks: [...] // 张阿姨的任务
  }
}

function getAccount2Business(): BusinessData {
  const now = Date.now()
  return {
    posts: [...], // 李先生的帖子
    activities: [...], // 李先生的活动
    tasks: [...] // 李先生的任务
  }
}
```

- [x] **Step 3: 修改 getDefaultBusiness 函数**

```typescript
function getDefaultBusiness(phone?: string): BusinessData {
  if (phone === '13811112222') return getAccount1Business()
  if (phone === '13811113333') return getAccount2Business()
  return { posts: [], activities: [], tasks: [] }
}
```

- [x] **Step 4: 更新 loadBusiness 调用**
- [x] **Step 5: 验证修改**
- [x] **Step 6: Commit**

---

## Task 2: 为账号1创建示例任务

**Files:**
- Modify: `src/utils/storage.ts`

**Description:**
- 创建 2-3 个由账号1 (13811112222 - 张阿姨) 发布的示例任务
- 确保任务的 user_id, user_phone, creator 字段匹配账号1

**Test Requirements:**
- `human-judgment` TR-2.1: 账号1登录后，待接单页面显示张阿姨发布的任务

- [x] **Step 1: 添加张阿姨的示例任务**

```typescript
{
  id: 'demo-1',
  title: '帮忙取个快递',
  description: '菜鸟驿站，3 个包裹，取件码 1234。包裹大小适中，不太重。',
  category: 'delivery',
  location: '阳光社区·菜鸟驿站',
  reward: 5,
  status: 'pending',
  user_id: '13811112222',
  user_phone: '13811112222',
  creator: {
    id: '13811112222',
    nickname: '热心邻居张阿姨',
    avatar: 'https://i.pravatar.cc/100?img=1',
    credit_score: 98,
    community: '阳光社区'
  },
  created_at: now - 1000 * 60 * 10,
  updated_at: now - 1000 * 60 * 10
}
```

- [x] **Step 2: Commit**

---

## Task 3: 为账号2创建示例任务

**Files:**
- Modify: `src/utils/storage.ts`

**Description:**
- 创建 2-3 个由账号2 (13811113333 - 李先生) 发布的示例任务
- 确保任务的 user_id, user_phone, creator 字段匹配账号2

**Test Requirements:**
- `human-judgment` TR-3.1: 账号2登录后，待接单页面显示李先生发布的任务

- [x] **Step 1: 添加李先生的示例任务**

```typescript
{
  id: 'demo-4',
  title: '帮忙带份早餐',
  description: '永和大王，豆浆油条套餐，加个煎蛋。',
  category: 'shopping',
  location: '永和大王·阳光社区店',
  reward: 8,
  status: 'pending',
  user_id: '13811113333',
  user_phone: '13811113333',
  creator: {
    id: '13811113333',
    nickname: '社区达人李先生',
    avatar: 'https://i.pravatar.cc/100?img=2',
    credit_score: 92,
    community: '阳光社区'
  },
  created_at: now - 1000 * 60 * 20,
  updated_at: now - 1000 * 60 * 20
}
```

- [x] **Step 2: Commit**

---

## Task 4: 为账号1创建示例帖子

**Files:**
- Modify: `src/utils/storage.ts`

**Description:**
- 创建 2-3 条由账号1 (13811112222 - 张阿姨) 发布的示例帖子

**Test Requirements:**
- `human-judgment` TR-4.1: 账号1登录后，首页显示张阿姨的帖子

- [x] **Step 1: 添加张阿姨的示例帖子**

```typescript
{
  id: 'post-1',
  content: '今天天气真好，大家有空可以出来活动活动！',
  images: [],
  location: '阳光社区',
  visibility: 'public',
  user_id: '13811112222',
  user: {
    id: '13811112222',
    nickname: '热心邻居张阿姨',
    avatar: 'https://i.pravatar.cc/100?img=1'
  },
  like_count: 5,
  comment_count: 2,
  is_liked: false,
  created_at: now - 1000 * 60 * 30,
  updated_at: now - 1000 * 60 * 30
}
```

- [x] **Step 2: Commit**

---

## Task 5: 为账号2创建示例帖子

**Files:**
- Modify: `src/utils/storage.ts`

**Description:**
- 创建 2-3 条由账号2 (13811113333 - 李先生) 发布的示例帖子

**Test Requirements:**
- `human-judgment` TR-5.1: 账号2登录后，首页显示李先生的帖子

- [x] **Step 1: 添加李先生的示例帖子**

```typescript
{
  id: 'post-3',
  content: '推荐社区旁边新开的咖啡店，味道很不错！',
  images: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400'],
  location: '阳光社区',
  visibility: 'public',
  user_id: '13811113333',
  user: {
    id: '13811113333',
    nickname: '社区达人李先生',
    avatar: 'https://i.pravatar.cc/100?img=2'
  },
  like_count: 8,
  comment_count: 3,
  is_liked: false,
  created_at: now - 1000 * 60 * 45,
  updated_at: now - 1000 * 60 * 45
}
```

- [x] **Step 2: Commit**

---

## Task 6: 为两个账号创建示例活动

**Files:**
- Modify: `src/utils/storage.ts`

**Description:**
- 创建 1-2 个示例活动，分配给两个账号

**Test Requirements:**
- `human-judgment` TR-6.1: 账号1和账号2都能看到活动列表

- [x] **Step 1: 添加示例活动**

```typescript
{
  id: 'activity-1',
  title: '周末乒乓球友谊赛',
  description: '社区乒乓球爱好者交流活动，新手友好！',
  category: 'sports',
  location: '阳光社区活动中心',
  start_time: now + 86400000 * 3,
  end_time: now + 86400000 * 3 + 7200000,
  max_participants: 20,
  current_participants: 8,
  images: [],
  status: 'upcoming',
  user_id: '13811112222',
  user: {
    id: '13811112222',
    nickname: '热心邻居张阿姨',
    avatar: 'https://i.pravatar.cc/100?img=1'
  },
  is_participant: false,
  created_at: now - 86400000,
  updated_at: now - 86400000
}
```

- [x] **Step 2: Commit**

---

## Task 7: 构建验证

**Files:**
- None (全局构建)

**Description:**
- 运行 `npm run build` 验证所有修改无编译错误

**Test Requirements:**
- `programmatic` TR-7.1: 构建成功，无 TypeScript 错误

- [x] **Step 1: 运行构建命令**
- [x] **Step 2: 验证构建成功**
- [x] **Step 3: Commit**