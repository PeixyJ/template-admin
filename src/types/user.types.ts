/** 用户信息 */
export interface UserVO {
  /** 用户ID */
  id: number
  /** 用户名 */
  nickname: string
  /** 头像 */
  avatarUrl: string
  /** 邀请码 */
  inviteCode: string
  /** 注册时间 */
  createTime: string
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
