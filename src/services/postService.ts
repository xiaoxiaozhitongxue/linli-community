import { get, post, del } from '../utils/request'
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
    get<PaginatedResponse<Post>>('/api/posts', params),

  getPost: (id: string) =>
    get<Post>(`/api/posts/${id}`),

  createPost: (data: CreatePostRequest) =>
    post<Post>('/api/posts', {
      content: data.content.trim(),
      images: data.images || [],
      location: data.location || '',
      visibility: data.visibility || 'public'
    }, { showError: true }),

  likePost: (postId: string) =>
    post<LikeResponse>(`/api/posts/${postId}/like`, {}, { showError: false }),

  deletePost: (postId: string) =>
    del<DeletePostResponse>(`/api/posts/${postId}`, {}, { showError: true }),

  getComments: (postId: string, params?: GetCommentsParams) =>
    get<PaginatedResponse<Comment>>(`/api/posts/${postId}/comments`, params),

  createComment: (postId: string, data: CreateCommentRequest) =>
    post<Comment>(`/api/posts/${postId}/comments`, {
      content: data.content.trim()
    }, { showError: true })
}
