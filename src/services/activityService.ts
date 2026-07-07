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
    get<PaginatedResponse<Activity>>('/api/activities', params).then((r) => r.data),

  getActivity: (id: string) => get<Activity>(`/api/activities/${id}`).then((r) => r.data),

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
    }, { showError: true }).then((r) => r.data),

  joinActivity: (id: string) =>
    post<ActivityActionResponse>(`/api/activities/${id}/join`, {}, { showError: true }).then((r) => r.data),

  leaveActivity: (id: string) =>
    del<ActivityActionResponse>(`/api/activities/${id}/leave`, {}, { showError: true }).then((r) => r.data),

  updateActivity: (id: string, data: UpdateActivityRequest) =>
    put<Activity>(`/api/activities/${id}`, data, { showError: true }).then((r) => r.data),

  deleteActivity: (id: string) =>
    del<ActivityActionResponse>(`/api/activities/${id}`, {}, { showError: true }).then((r) => r.data)
}
