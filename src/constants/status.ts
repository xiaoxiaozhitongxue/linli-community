/**
 * 统一状态枚举与中文标签
 * ----------------------------------------------------------------------------
 * 用于「互助任务(Task)」与「社区活动(Activity)」的状态展示，消除此前
 * pending / open / upcoming 等各处不一致、以及 pending_confirm（待确认/待验收）
 * 在不同页面含义混乱的问题。
 *
 * 设计原则：
 *  1. 对外只暴露「归一化后的标准 key」，任何来源的脏值都先经 normalize 处理；
 *  2. 展示统一走 getXxxStatusLabel，避免模板里散落各种 map；
 *  3. 标准 key 集合固定，新增状态请在此处登记。
 */

// ============================ 任务状态 ======================================

/** 任务状态的标准 key（归一化后的取值集合） */
export type TaskStatusKey =
  | 'pending'
  | 'pending_confirm'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

/** 任务状态 -> 中文标签 */
export const TASK_STATUS_LABELS: Record<TaskStatusKey, string> = {
  pending: '待接单',
  pending_confirm: '待确认',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
}

/** 任务状态对应的展示样式（用于 badge 着色，统一在 base.css 中以 class 使用） */
export const TASK_STATUS_CLASS: Record<TaskStatusKey, string> = {
  pending: 'status-pending',
  pending_confirm: 'status-pending-confirm',
  in_progress: 'status-progress',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
}

/**
 * 将任意任务状态字符串归一化为标准 key。
 * 处理历史脏值：
 *  - open / 待接单 是「待接单」的旧别名，统一归一到 pending（待接单）；
 *  - pending_confirm / 待确认 / 待验收 归一到 pending_confirm（待确认/待验收）；
 *  - in_progress / ongoing / accepted 归一到 in_progress（进行中）；
 * 其余未知值默认 pending。
 */
export function normalizeTaskStatus(status?: string | null): TaskStatusKey {
  if (!status) return 'pending'
  const s = String(status).toLowerCase().trim()
  switch (s) {
    case 'pending':
    case 'open':
    case '待接单':
      return 'pending'
    case 'pending_confirm':
    case 'pendingconfirm':
    case '待确认':
    case '待验收':
      return 'pending_confirm'
    case 'in_progress':
    case 'ongoing':
    case 'accepted':
    case '进行中':
      return 'in_progress'
    case 'completed':
    case 'done':
    case 'finish':
    case 'finished':
    case '已完成':
      return 'completed'
    case 'cancelled':
    case 'cancel':
    case 'closed':
    case '已取消':
      return 'cancelled'
    default:
      return 'pending'
  }
}

/** 获取任务状态的中文标签 */
export function getTaskStatusLabel(status?: string | null): string {
  const key = normalizeTaskStatus(status)
  return TASK_STATUS_LABELS[key]
}

/** 获取任务状态的样式 class */
export function getTaskStatusClass(status?: string | null): string {
  const key = normalizeTaskStatus(status)
  return TASK_STATUS_CLASS[key]
}

// ============================ 活动状态 ======================================

/** 活动状态的标准 key（归一化后的取值集合） */
export type ActivityStatusKey =
  | 'upcoming'
  | 'ongoing'
  | 'completed'
  | 'cancelled'

/** 活动状态 -> 中文标签 */
export const ACTIVITY_STATUS_LABELS: Record<ActivityStatusKey, string> = {
  upcoming: '即将开始',
  ongoing: '进行中',
  completed: '已结束',
  cancelled: '已取消',
}

/** 活动状态对应的展示样式 */
export const ACTIVITY_STATUS_CLASS: Record<ActivityStatusKey, string> = {
  upcoming: 'status-upcoming',
  ongoing: 'status-progress',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
}

/**
 * 将任意活动状态字符串归一化为标准 key。
 * 处理历史脏值：upcoming/not_started/pending -> upcoming；
 * ongoing/in_progress/active -> ongoing；其余未知值默认 upcoming。
 */
export function normalizeActivityStatus(status?: string | null): ActivityStatusKey {
  if (!status) return 'upcoming'
  const s = String(status).toLowerCase().trim()
  switch (s) {
    case 'upcoming':
    case 'not_started':
    case 'notstarted':
    case 'pending':
    case '即将开始':
      return 'upcoming'
    case 'ongoing':
    case 'in_progress':
    case 'inprogress':
    case 'active':
    case '进行中':
      return 'ongoing'
    case 'completed':
    case 'done':
    case 'finished':
    case 'end':
    case 'ended':
    case '已结束':
      return 'completed'
    case 'cancelled':
    case 'cancel':
    case '已取消':
      return 'cancelled'
    default:
      return 'upcoming'
  }
}

/** 获取活动状态的中文标签 */
export function getActivityStatusLabel(status?: string | null): string {
  const key = normalizeActivityStatus(status)
  return ACTIVITY_STATUS_LABELS[key]
}

/** 获取活动状态的样式 class */
export function getActivityStatusClass(status?: string | null): string {
  const key = normalizeActivityStatus(status)
  return ACTIVITY_STATUS_CLASS[key]
}
