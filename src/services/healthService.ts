import { get, post } from '../utils/request'
import type { HealthRecord } from '../types/models'
import type {
  GetHealthRecordsParams,
  HealthRecordsResponse,
  AddHealthRecordRequest,
  AddHealthRecordResponse
} from '../types/api'

export const healthService = {
  getRecords: (params?: GetHealthRecordsParams) =>
    get<HealthRecordsResponse>('/api/health/records', params).then((r) => r.data),

  addRecord: (data?: AddHealthRecordRequest) =>
    post<AddHealthRecordResponse>('/api/health/records', data || {}, { showError: true }).then((r) => r.data)
}
