import { get, post, put, del } from '../utils/request'
import type { Activity, PaginatedResponse } from '../types/models'
import type {
  GetActivitiesParams,
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivityActionResponse
} from '../types/api'

export const activityService = {
  getActivities: (params?: GetActivitiesParams) =>
    get<PaginatedResponse<Activity>>('/api/activities', params),

  getActivity: (id: string) =>
    get<Activity>(`/api/activities/${id}`),

  createActivity: (data: CreateActivityRequest) =>
    post<Activity>('/api/activities', {
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category || 'other',
      location: data.location.trim(),
      start_time: data.start_time,
      end_time: data.end_time,
      max_participants: data.max_participants,
      images: data.images || []
    }, { showError: true }),

  joinActivity: (id: string) =>
    post<ActivityActionResponse>(`/api/activities/${id}/join`, {}, { showError: true }),

  leaveActivity: (id: string) =>
    del<ActivityActionResponse>(`/api/activities/${id}/leave`, {}, { showError: true }),

  updateActivity: (id: string, data: UpdateActivityRequest) =>
    put<Activity>(`/api/activities/${id}`, data, { showError: true }),

  deleteActivity: (id: string) =>
    del<ActivityActionResponse>(`/api/activities/${id}`, {}, { showError: true })
}
