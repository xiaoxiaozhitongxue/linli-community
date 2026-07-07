import { post } from '../utils/request'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/api'

export const authService = {
  login: (data: LoginRequest) =>
    post<LoginResponse>('/api/auth/login', data, { showError: true }).then((r) => r.data),
  logout: () => Promise.resolve({ success: true }),
  register: (data: RegisterRequest) =>
    post<RegisterResponse>('/api/auth/register', data, { showError: true }).then((r) => r.data)
}
