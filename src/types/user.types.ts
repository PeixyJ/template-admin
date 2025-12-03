/** 邀请人信息 */
export interface InviterVO {
  /** 用户ID */
  id: number
  /** 用户名 */
  nickname: string
  /** 头像 */
  avatarUrl: string | null
}

/** 用户信息 */
export interface UserVO {
  /** 用户ID */
  id: number
  /** 用户名 */
  nickname: string
  /** 头像 */
  avatarUrl: string | null
  /** 邀请码 */
  inviteCode: string
  /** 注册时间 */
  createTime: string
  /** 状态：true-正常，false-禁用 */
  status: boolean
  /** 状态描述 */
  statusDesc: string
  /** 禁用原因 */
  disableReason: string
  /** 邀请人 */
  inviter: InviterVO | null
}

/** 更新用户昵称请求 */
export interface UpdateUserNicknameRequest {
  /** 昵称 (2-50字符) */
  nickname: string
}

/** 修改密码请求 */
export interface ChangePasswordRequest {
  /** 新密码 */
  newPassword: string
}

// ==================== 用户管理（管理员） ====================

/** 用户列表查询参数 */
export interface UserListParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  size: number
  /** 用户ID */
  userId?: number
  /** 用户昵称（模糊查询） */
  nickname?: string
  /** 邮箱（精确查询） */
  email?: string
  /** 手机号（精确查询） */
  phone?: string
  /** 状态：true-正常，false-禁用，null-全部 */
  status?: boolean
}

/** 更新用户状态请求 */
export interface UpdateUserStatusRequest {
  /** 用户ID */
  userId: number
  /** 状态：true-启用，false-禁用 */
  status: boolean
  /** 禁用原因（禁用时必填） */
  disableReason?: string
}

/** 更新用户备注请求 */
export interface UpdateUserRemarkRequest {
  /** 用户ID */
  userId: number
  /** 备注 */
  remark?: string
}

/** 用户账号信息 */
export interface AccountVO {
  /** 账号ID */
  id: number
  /** 账号类型 */
  accountType: string
  /** 账号类型描述 */
  accountTypeDesc: string
  /** 凭证（邮箱/手机号等） */
  credential: string
  /** 最后登录时间 */
  lastLoginTime: string | null
  /** 最后登录IP */
  lastLoginIp: string | null
  /** 登录次数 */
  loginCount: number
  /** 锁定状态 0-正常 */
  lockStatus: number
  /** 锁定状态描述 */
  lockStatusDesc: string
  /** 锁定时间 */
  lockTime: string | null
  /** 密码更新时间 */
  pwdUpdateTime: string
  /** 创建时间 */
  createTime: string
}

/** 用户详情 */
export interface UserDetailVO {
  /** 用户ID */
  id: number
  /** 用户名 */
  nickname: string
  /** 头像 */
  avatarUrl: string | null
  /** 邀请码 */
  inviteCode: string
  /** 状态：true-正常，false-禁用 */
  status: boolean
  /** 禁用原因 */
  disableReason: string
  /** 备注 */
  remark: string
  /** 注册时间 */
  createTime: string
  /** 邀请人 */
  inviter: InviterVO | null
  /** 账号列表 */
  accounts: AccountVO[]
}
