import { api } from './api'
import type { ApiResult } from '@/types/auth.types'
import type {
  UserVO,
  UpdateUserNicknameRequest,
  ChangePasswordRequest,
} from '@/types/user.types'

const USER_PREFIX = '/v1/admin'

/** 获取当前用户信息 */
export function getCurrentUser() {
  return api.get<ApiResult<UserVO>>(`${USER_PREFIX}/me`)
}

/** 更新当前用户昵称 */
export function updateCurrentUserNickname(data: UpdateUserNicknameRequest) {
  return api.put<ApiResult<UserVO>>(`${USER_PREFIX}/me/nickname`, null, {
    params: { nickname: data.nickname },
  })
}

/** 上传头像并保存 */
export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return api.post<ApiResult<UserVO>>(`${USER_PREFIX}/me/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/** 更新当前用户密码 */
export function changePassword(data: ChangePasswordRequest) {
  return api.post<ApiResult>(`${USER_PREFIX}/me/password`, data)
}

/** 通过用户ID获取用户信息 */
export function getUserById(userId: number) {
  return api.get<ApiResult<UserVO>>(`${USER_PREFIX}/${userId}`)
}

/** 通过用户IDs批量获取用户列表 */
export function getUsersByIds(userIds: number[]) {
  return api.get<ApiResult<UserVO[]>>(`${USER_PREFIX}/batch`, {
    params: { userIds },
  })
}

/** 通过用户名获取用户信息（模糊查询） */
export function searchUsersByNickname(nickname: string) {
  return api.get<ApiResult<UserVO[]>>(`${USER_PREFIX}/search/nickname`, {
    params: { nickname },
  })
}

/** 通过邮箱获取用户信息 */
export function searchUserByEmail(email: string) {
  return api.get<ApiResult<UserVO>>(`${USER_PREFIX}/search/email`, {
    params: { email },
  })
}

/** 通过手机号获取用户信息 */
export function searchUserByPhone(phone: string) {
  return api.get<ApiResult<UserVO>>(`${USER_PREFIX}/search/phone`, {
    params: { phone },
  })
}
