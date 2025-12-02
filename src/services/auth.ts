import { api } from './api'
import type {
  ApiResult,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  OpenSafeRequest,
} from '@/types/auth.types'

const AUTH_PREFIX = '/v1/auth'

/** 注册用户 */
export function register(data: RegisterRequest) {
  return api.post<ApiResult>(`${AUTH_PREFIX}/register`, data)
}

/** 用户登录 */
export function login(data: LoginRequest) {
  return api.post<ApiResult<LoginResponse>>(`${AUTH_PREFIX}/login`, data)
}

/** 发送找回密码邮件 */
export function sendForgetPasswordEmail(email: string) {
  return api.post<ApiResult>(`${AUTH_PREFIX}/send-forget-password-email`, null, {
    params: { email },
  })
}

/** 重置密码 */
export function resetPassword(data: ResetPasswordRequest) {
  return api.post<ApiResult>(`${AUTH_PREFIX}/reset-password`, null, {
    params: data,
  })
}

/** 是否已登录 */
export function isLogin() {
  return api.post<ApiResult>(`${AUTH_PREFIX}/is-login`)
}

/** 用户操作是否安全 */
export function isSafe() {
  return api.get<ApiResult>(`${AUTH_PREFIX}/is-safe`)
}

/** 开启安全操作 */
export function openSafe(data: OpenSafeRequest) {
  return api.post<ApiResult>(`${AUTH_PREFIX}/open-safe`, null, {
    params: data,
  })
}

/** 用户登出 */
export function logout() {
  return api.post<ApiResult>(`${AUTH_PREFIX}/logout`)
}
