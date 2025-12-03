import type { ApiResult } from './auth.types'
import type { PageData } from './team.types'

/** 管理员账号信息 */
export interface AdminAccountVO {
  /** 账号类型 */
  accountType: string
  /** 账号类型描述 */
  accountTypeDesc: string
  /** 登录凭证（邮箱） */
  credential: string
  /** 最后登录时间 */
  lastLoginTime: string | null
  /** 最后登录IP */
  lastLoginIp: string | null
  /** 登录次数 */
  loginCount: number
  /** 锁定状态：0-正常 */
  lockStatus: number
  /** 锁定状态描述 */
  lockStatusDesc: string
}

/** 管理员视图对象 */
export interface AdminVO {
  /** 管理员ID */
  id: number
  /** 管理员昵称 */
  nickname: string
  /** 头像URL */
  avatarUrl: string | null
  /** 状态：false-正常，true-禁用 */
  status: boolean
  /** 状态描述 */
  statusDesc: string
  /** 创建时间 */
  createTime: string
  /** 账号信息 */
  account: AdminAccountVO
}

/** 管理员列表查询参数 */
export interface AdminListParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  size: number
  /** 管理员ID */
  adminId?: number
  /** 管理员昵称（模糊查询） */
  nickname?: string
  /** 邮箱（精确查询） */
  email?: string
  /** 手机号（精确查询） */
  phone?: string
  /** 状态：false-正常，true-禁用，null-全部 */
  status?: boolean
}

/** 创建管理员请求 */
export interface CreateAdminRequest {
  /** 管理员昵称 */
  nickname: string
  /** 邮箱 */
  email: string
  /** 初始密码 */
  password: string
  /** 备注 */
  remark?: string
}

/** 重置管理员密码请求 */
export interface ResetAdminPasswordRequest {
  /** 管理员ID */
  adminId: number
  /** 新密码 */
  newPassword: string
}

/** 管理员列表响应 */
export type AdminListResponse = ApiResult<PageData<AdminVO>>

/** 管理员详情响应 */
export type AdminDetailResponse = ApiResult<AdminVO>
