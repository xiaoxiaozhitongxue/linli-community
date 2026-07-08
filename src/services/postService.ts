import { get, post, put, del } from '../utils/request'
import type { Post, Comment, PaginatedResponse, LikeResponse } from '../types/models'
import type {
  GetPostsParams,
  CreatePostRequest,
  DeletePostResponse,
  GetCommentsParams,
  CreateCommentRequest
} from '../types/api'

export const postService = {
  getPosts: (params?: GetPostsParams) =>
    get<PaginatedResponse<Post>>('/api/posts', params).then((r) => r.data),

  getPost: (id: string) => get<Post>(`/api/posts/${id}`).then((r) => r.data),

  createPost: (data: CreatePostRequest) =>
    post<Post>('/api/posts', {
      content: data.content.trim(),
      images: data.images || [],
      location: data.location || '',
      visibility: data.visibility || 'public'
    }, { showError: true }).then((r) => r.data),

  likePost: (postId: string) =>
    post<LikeResponse>(`/api/posts/${postId}/like`, {}, { showError: false }).then((r) => r.data),

  deletePost: (postId: string) =>
    del<DeletePostResponse>(`/api/posts/${postId}`, {}, { showError: true }).then((r) => r.data),

  updatePost: (postId: string, data: { content?: string; images?: string[]; location?: string; visibility?: string }) =>
    put<Post>(`/api/posts/${postId}`, data, { showError: true }).then((r) => r.data),

  getComments: (postId: string, params?: GetCommentsParams) =>
    get<PaginatedResponse<Comment>>(`/api/posts/${postId}/comments`, params).then((r) => r.data),

  createComment: (postId: string, data: CreateCommentRequest) =>
    post<Comment>(`/api/posts/${postId}/comments`, {
      content: data.content.trim()
    }, { showError: true }).then((r) => r.data)
}
