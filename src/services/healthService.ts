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
    get<HealthRecordsResponse>('/api/health/records', params),

  addRecord: (data?: AddHealthRecordRequest) =>
    post<AddHealthRecordResponse>('/api/health/records', data || {}, { showError: true })
}
