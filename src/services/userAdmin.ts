import { api } from './api'
import type { ApiResult } from '@/types/auth.types'
import type { PageData, TeamVO } from '@/types/team.types'
import type {
  UserVO,
  UserDetailVO,
  UserListParams,
  UpdateUserStatusRequest,
  UpdateUserRemarkRequest,
} from '@/types/user.types'
import { hashPasswordSHA256 } from '@/utils/crypto'

const ADMIN_USERS_PREFIX = '/v1/admin/users'

/** 分页查询用户列表 */
export function getUserList(params: UserListParams) {
  return api.get<ApiResult<PageData<UserVO>>>(ADMIN_USERS_PREFIX, { params })
}

/** 获取用户详情 */
export function getUserDetail(userId: number) {
  return api.get<ApiResult<UserDetailVO>>(`${ADMIN_USERS_PREFIX}/${userId}`)
}

/** 更新用户状态（启用/禁用） */
export function updateUserStatus(data: UpdateUserStatusRequest) {
  return api.put<ApiResult>(`${ADMIN_USERS_PREFIX}/status`, data)
}

/** 更新用户备注 */
export function updateUserRemark(data: UpdateUserRemarkRequest) {
  return api.put<ApiResult>(`${ADMIN_USERS_PREFIX}/remark`, data)
}

/** 重置用户密码 */
export function resetUserPassword(userId: number, newPassword: string) {
  const hashedPassword = hashPasswordSHA256(newPassword)
  return api.post<ApiResult>(`${ADMIN_USERS_PREFIX}/${userId}/reset-password`, null, {
    params: { newPassword: hashedPassword },
  })
}

/** 查看用户所在的团队列表 */
export function getUserTeams(userId: number) {
  return api.get<ApiResult<TeamVO[]>>(`${ADMIN_USERS_PREFIX}/${userId}/teams`)
}

/** 查询用户邀请的人员列表 */
export function getUserInvitees(
  userId: number,
  params: { page: number; size: number }
) {
  return api.get<ApiResult<PageData<UserVO>>>(
    `${ADMIN_USERS_PREFIX}/${userId}/invitees`,
    { params }
  )
}
