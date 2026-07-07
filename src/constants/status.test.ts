import {
  normalizeTaskStatus,
  getTaskStatusLabel,
  getTaskStatusClass,
  normalizeActivityStatus,
  getActivityStatusLabel,
  getActivityStatusClass,
} from './status'

describe('normalizeTaskStatus - 任务状态归一化', () => {
  it('将 pending 归一为 pending（待接单）', () => {
    expect(normalizeTaskStatus('pending')).toBe('pending')
    expect(getTaskStatusLabel('pending')).toBe('待接单')
  })

  it('将历史别名 open / 待接单 归一为 pending', () => {
    expect(normalizeTaskStatus('open')).toBe('pending')
    expect(normalizeTaskStatus('待接单')).toBe('pending')
  })

  it('将 pending_confirm / 待确认 / 待验收 归一为 pending_confirm（待确认）', () => {
    expect(normalizeTaskStatus('pending_confirm')).toBe('pending_confirm')
    expect(normalizeTaskStatus('待确认')).toBe('pending_confirm')
    expect(normalizeTaskStatus('待验收')).toBe('pending_confirm')
    expect(getTaskStatusLabel('pending_confirm')).toBe('待确认')
  })

  // 回归断言：上一轮修复的归一 bug —— pending 绝不能误映射成 pending_confirm
  it('【回归】pending 不会被误映射为 pending_confirm', () => {
    const key = normalizeTaskStatus('pending')
    expect(key).not.toBe('pending_confirm')
    expect(key).toBe('pending')
    // 二者中文标签必须不同
    expect(getTaskStatusLabel('pending')).not.toBe(getTaskStatusLabel('pending_confirm'))
  })

  it('将 in_progress / ongoing / accepted 归一为 in_progress（进行中）', () => {
    expect(normalizeTaskStatus('in_progress')).toBe('in_progress')
    expect(normalizeTaskStatus('ongoing')).toBe('in_progress')
    expect(normalizeTaskStatus('accepted')).toBe('in_progress')
    expect(getTaskStatusLabel('in_progress')).toBe('进行中')
  })

  it('将 completed / done / finished 归一为 completed（已完成）', () => {
    expect(normalizeTaskStatus('completed')).toBe('completed')
    expect(normalizeTaskStatus('done')).toBe('completed')
    expect(normalizeTaskStatus('finished')).toBe('completed')
    expect(getTaskStatusLabel('completed')).toBe('已完成')
  })

  it('将 cancelled / cancel / closed 归一为 cancelled（已取消）', () => {
    expect(normalizeTaskStatus('cancelled')).toBe('cancelled')
    expect(normalizeTaskStatus('cancel')).toBe('cancelled')
    expect(normalizeTaskStatus('closed')).toBe('cancelled')
    expect(getTaskStatusLabel('cancelled')).toBe('已取消')
  })

  it('对 null / undefined / 空串 / 未知值 默认归一为 pending', () => {
    expect(normalizeTaskStatus(undefined)).toBe('pending')
    expect(normalizeTaskStatus(null)).toBe('pending')
    expect(normalizeTaskStatus('')).toBe('pending')
    expect(normalizeTaskStatus('some_random_value')).toBe('pending')
  })

  it('大小写与多余空白被兼容归一', () => {
    expect(normalizeTaskStatus('  PENDING  ')).toBe('pending')
    expect(normalizeTaskStatus('Pending_Confirm')).toBe('pending_confirm')
  })

  it('getTaskStatusClass 返回与 key 对应的样式 class', () => {
    expect(getTaskStatusClass('pending')).toBe('status-pending')
    expect(getTaskStatusClass('pending_confirm')).toBe('status-pending-confirm')
    expect(getTaskStatusClass('completed')).toBe('status-completed')
  })
})

describe('normalizeActivityStatus - 活动状态归一化', () => {
  it('将 upcoming / not_started / pending 归一为 upcoming（即将开始）', () => {
    expect(normalizeActivityStatus('upcoming')).toBe('upcoming')
    expect(normalizeActivityStatus('not_started')).toBe('upcoming')
    // 活动语义下 pending == 即将开始
    expect(normalizeActivityStatus('pending')).toBe('upcoming')
    expect(getActivityStatusLabel('upcoming')).toBe('即将开始')
  })

  it('将 ongoing / in_progress / active 归一为 ongoing（进行中）', () => {
    expect(normalizeActivityStatus('ongoing')).toBe('ongoing')
    expect(normalizeActivityStatus('in_progress')).toBe('ongoing')
    expect(normalizeActivityStatus('active')).toBe('ongoing')
    expect(getActivityStatusLabel('ongoing')).toBe('进行中')
  })

  it('将 completed / done / ended 归一为 completed（已结束）', () => {
    expect(normalizeActivityStatus('completed')).toBe('completed')
    expect(normalizeActivityStatus('done')).toBe('completed')
    expect(normalizeActivityStatus('ended')).toBe('completed')
    expect(getActivityStatusLabel('completed')).toBe('已结束')
  })

  it('将 cancelled / cancel 归一为 cancelled（已取消）', () => {
    expect(normalizeActivityStatus('cancelled')).toBe('cancelled')
    expect(getActivityStatusLabel('cancelled')).toBe('已取消')
  })

  it('对 null / undefined / 未知值 默认归一为 upcoming', () => {
    expect(normalizeActivityStatus(undefined)).toBe('upcoming')
    expect(normalizeActivityStatus(null)).toBe('upcoming')
    expect(normalizeActivityStatus('')).toBe('upcoming')
    expect(normalizeActivityStatus('weird')).toBe('upcoming')
  })

  it('getActivityStatusClass 返回与 key 对应的样式 class', () => {
    expect(getActivityStatusClass('upcoming')).toBe('status-upcoming')
    expect(getActivityStatusClass('ongoing')).toBe('status-progress')
    expect(getActivityStatusClass('cancelled')).toBe('status-cancelled')
  })
})
