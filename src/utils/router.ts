import { useRouter } from 'vue-router'

let routerInstance: any = null

export function setRouterInstance(router: any) {
  routerInstance = router
}

function ensureRouter() {
  if (!routerInstance) {
    console.error('Router 实例未初始化，请确保 main.ts 中已调用 setRouterInstance')
    return null
  }
  return routerInstance
}

export function navigateTo(url: string) {
  const router = ensureRouter()
  if (router) {
    router.push(url)
  }
}

export function switchTab(url: string) {
  const router = ensureRouter()
  if (router) {
    router.push(url)
  }
}

export function redirectTo(url: string) {
  const router = ensureRouter()
  if (router) {
    router.replace(url)
  }
}

export function navigateBack(delta: number = 1) {
  const router = ensureRouter()
  if (router) {
    router.go(-delta)
  }
}
