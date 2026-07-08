import { get, post } from '../utils/request'

export interface Conversation {
  id: string
  type: 'private' | 'group'
  name: string
  created_by: string
  created_at: number
  lastMessage: string
  lastMessageAt: number
  memberCount: number
  otherUser?: {
    id: string
    nickname: string
    avatar: string
  }
  avatar: string
}

export interface ConversationDetail {
  id: string
  type: 'private' | 'group'
  name: string
  created_by: string
  created_at: number
  members: Array<{
    id: string
    nickname: string
    avatar: string
    community: string
    joined_at: number
  }>
  lastMessage: {
    id: string
    sender_id: string
    content: string
    created_at: number
  } | null
}

export interface MessageItem {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  createdAt: number
  isSelf: boolean
}

export interface PaginatedMessages {
  items: MessageItem[]
  page: number
  limit: number
  total: number
  total_pages: number
}

export const messageService = {
  /** 获取当前用户的会话列表 */
  getConversations: () =>
    get<Conversation[]>('/api/conversations').then((r) => r.data),

  /** 创建新会话 */
  createConversation: (data: { type: 'private' | 'group'; name?: string; member_ids: string[] }) =>
    post<Conversation>('/api/conversations', data).then((r) => r.data),

  /** 获取会话详情 */
  getConversation: (id: string) =>
    get<ConversationDetail>(`/api/conversations/${id}`).then((r) => r.data),

  /** 获取会话消息列表 */
  getMessages: (convId: string, page: number = 1, limit: number = 20) =>
    get<PaginatedMessages>(`/api/conversations/${convId}/messages`, { page, limit }).then((r) => r.data),

  /** 发送消息 */
  sendMessage: (convId: string, content: string) =>
    post<MessageItem>(`/api/conversations/${convId}/messages`, { content }, { showError: true }).then((r) => r.data),

  /** 添加群聊成员 */
  addMember: (convId: string, userIds: string[]) =>
    post<{ added: Array<{ id: string; nickname: string }>; errors: string[] }>(
      `/api/conversations/${convId}/members`,
      { user_ids: userIds },
      { showError: true }
    ).then((r) => r.data)
}
