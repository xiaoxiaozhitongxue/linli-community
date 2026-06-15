# 登录注册模块完善 - 任务列表

## Task 1: 创建账号存储管理工具函数

**Files:**
- Create: `src/utils/account.ts`

**Description:**
- 创建账号存储管理函数（注册、验证、登录）
- 实现简单的密码加密存储

**Acceptance Criteria Addressed:** FR-2, FR-4, FR-5

- [ ] **Step 1: 创建账号管理工具文件**

```typescript
// 账号存储键
const ACCOUNTS_KEY = 'linli_accounts'

// 简单加密函数
function encryptPassword(password: string): string {
  return btoa(password + '_linli_salt')
}

function decryptPassword(encrypted: string): string {
  return atob(encrypted).replace('_linli_salt', '')
}

// 获取所有账号
export function getAllAccounts(): Record<string, { password: string; nickname: string }> {
  const raw = localStorage.getItem(ACCOUNTS_KEY)
  if (!raw) return {}
  return JSON.parse(raw)
}

// 检查账号是否存在
export function accountExists(username: string): boolean {
  const accounts = getAllAccounts()
  return !!accounts[username]
}

// 验证密码
export function verifyPassword(username: string, password: string): boolean {
  const accounts = getAllAccounts()
  const account = accounts[username]
  if (!account) return false
  return account.password === encryptPassword(password)
}

// 注册账号
export function registerAccount(username: string, password: string, nickname: string): boolean {
  if (accountExists(username)) return false
  
  const accounts = getAllAccounts()
  accounts[username] = {
    password: encryptPassword(password),
    nickname
  }
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  return true
}

// 获取账号信息
export function getAccount(username: string): { password: string; nickname: string } | null {
  const accounts = getAllAccounts()
  return accounts[username] || null
}
```

- [ ] **Step 2: Commit**

---

## Task 2: 修改登录API，支持普通账号登录验证

**Files:**
- Modify: `src/utils/api.ts`

**Description:**
- 修改 authApi.login 函数
- 测试账号直接验证
- 普通账号先检查是否注册，再验证密码

**Acceptance Criteria Addressed:** FR-1, FR-2, FR-3, FR-4

- [ ] **Step 1: 导入账号管理函数**

```typescript
import { accountExists, verifyPassword, getAccount } from './account'
```

- [ ] **Step 2: 修改登录逻辑**

```typescript
login: (data: { phone: string; code: string; nickname?: string; community?: string }) => {
  return new Promise<{ token: string; user: User }>((resolve, reject) => {
    setTimeout(() => {
      // 测试账号
      const testAccounts: Record<string, { password: string; nickname: string; community: string; phone: string }> = {
        ADMIN1: { password: '123456', nickname: '管理员1', community: '阳光社区', phone: '13811112222' },
        ADMIN2: { password: '123456', nickname: '管理员2', community: '阳光社区', phone: '13811113333' }
      }
      
      const testAccount = testAccounts[data.phone]
      if (testAccount) {
        // 测试账号登录
        if (data.code !== testAccount.password) {
          reject(new Error('密码错误'))
          return
        }
        // 继续登录流程...
      } else {
        // 普通账号登录
        if (!accountExists(data.phone)) {
          reject(new Error('账号未注册'))
          return
        }
        if (!verifyPassword(data.phone, data.code)) {
          reject(new Error('密码错误'))
          return
        }
        // 获取账号昵称
        const account = getAccount(data.phone)
        if (account) {
          data.nickname = account.nickname
        }
      }
      // ... 继续登录流程
    }, 400)
  })
}
```

- [ ] **Step 3: Commit**

---

## Task 3: 添加注册API

**Files:**
- Modify: `src/utils/api.ts`

**Description:**
- 添加 authApi.register 函数
- 实现注册逻辑

**Acceptance Criteria Addressed:** FR-5

- [ ] **Step 1: 添加注册API**

```typescript
register: (data: { phone: string; code: string; nickname: string }) => {
  return new Promise<{ token: string; user: User }>((resolve, reject) => {
    setTimeout(() => {
      if (!data.phone || data.phone.length < 3) {
        reject(new Error('请输入账号'))
        return
      }
      if (!data.code || data.code.length < 6) {
        reject(new Error('密码至少6位'))
        return
      }
      if (!data.nickname || data.nickname.length < 2) {
        reject(new Error('昵称至少2位'))
        return
      }
      
      if (accountExists(data.phone)) {
        reject(new Error('账号已存在'))
        return
      }
      
      // 注册账号
      const success = registerAccount(data.phone, data.code, data.nickname)
      if (!success) {
        reject(new Error('注册失败'))
        return
      }
      
      // 注册成功后自动登录
      const now = Date.now()
      const user: User = {
        id: 'user_' + now,
        phone: data.phone,
        nickname: data.nickname,
        avatar: '',
        gender: undefined,
        birthday: '',
        community: '阳光社区',
        address: '',
        bio: '',
        role: 'resident',
        credit_score: 100,
        is_verified: true,
        created_at: now,
        updated_at: now,
        last_active_at: now
      }
      
      localStorage.setItem(getUserStorageKey('linli_user_profile', data.phone), JSON.stringify(user))
      onLoginSuccess(user, 'token_' + now)
      resolve({ token: 'token_' + now, user })
    }, 400)
  })
}
```

- [ ] **Step 2: Commit**

---

## Task 4: 修改登录页面，添加注册入口和提示

**Files:**
- Modify: `src/pages/login/index.vue`

**Description:**
- 添加"未注册？去注册"链接
- 添加注册弹窗
- 显示注册成功/失败提示

**Acceptance Criteria Addressed:** FR-3, FR-5

- [ ] **Step 1: 添加注册链接和弹窗**
- [ ] **Step 2: 实现注册表单**
- [ ] **Step 3: 处理注册回调**
- [ ] **Step 4: Commit**

---

## Task 5: 构建验证

**Files:**
- None (全局构建)

**Description:**
- 运行 `npm run build` 验证所有修改无编译错误

**Test Requirements:**
- `programmatic` TR-5.1: 构建成功，无 TypeScript 错误

- [ ] **Step 1: 运行构建命令**
- [ ] **Step 2: 验证构建成功**
- [ ] **Step 3: Commit**