/** 账号类型 */
export type AccountType = 'USER_EMAIL' | 'USER_PHONE' | 'ADMIN_EMAIL' | 'ADMIN_PHONE'

/** API 响应码 */
export type ApiResultCode = 'SUCCESS' | 'FAIL' | 'ERROR' | 'AUTH_NOT_SAFE'

/** 通用响应结构 */
export interface ApiResult<T = null> {
  code: ApiResultCode
  message: string
  description: string
  data: T
  date: number
  messageId: string | null
}

/** 注册请求 */
export interface RegisterRequest {
  /** 账号类型 */
  accountType: AccountType
  /** 凭证（邮箱/手机号） */
  credential: string
  /** 密码 */
  secret: string
  /** 邀请码 */
  inviteCode?: string
  /** 其他参数 */
  params?: Record<string, string>
}

/** 登录请求 */
export interface LoginRequest {
  /** 账号类型 */
  accountType: AccountType
  /** 凭证（邮箱/手机号） */
  credential: string
  /** 密码 */
  secret: string
}

/** 登录响应数据 */
export interface LoginResponse {
  userId: number
  nickname: string
  /** 头像URL */
  avatar: string
  /** Token 名称 */
  tokenName: string
  /** Token 值 */
  tokenValue: string
  /** Token 过期时间（秒） */
  tokenTimeout: number
}

/** 重置密码请求 */
export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

/** 开启安全操作请求 */
export interface OpenSafeRequest {
  accountType: AccountType
  password: string
}
