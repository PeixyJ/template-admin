import { api } from './api'
import type { ApiResult } from '@/types/auth.types'
import type {
  AdminVO,
  AdminListParams,
  AdminListResponse,
  AdminDetailResponse,
  CreateAdminRequest,
  ResetAdminPasswordRequest,
} from '@/types/admin.types'
import { hashPasswordSHA256 } from '@/utils/crypto'

const ADMIN_PREFIX = '/v1/admin/admins'

/** 分页查询管理员列表 */
export function getAdminList(params: AdminListParams) {
  return api.get<AdminListResponse>(ADMIN_PREFIX, { params })
}

/** 获取管理员详情 */
export function getAdminDetail(adminId: number) {
  return api.get<AdminDetailResponse>(`${ADMIN_PREFIX}/${adminId}`)
}

/** 创建管理员 */
export function createAdmin(data: CreateAdminRequest) {
  return api.post<ApiResult<AdminVO>>(ADMIN_PREFIX, {
    ...data,
    password: hashPasswordSHA256(data.password),
  })
}

/** 删除管理员 */
export function deleteAdmin(adminId: number) {
  return api.delete<ApiResult>(`${ADMIN_PREFIX}/${adminId}`)
}

/** 更新管理员状态（启用/禁用） */
export function updateAdminStatus(
  adminId: number,
  status: boolean,
  disableReason?: string
) {
  return api.put<ApiResult>(`${ADMIN_PREFIX}/${adminId}/status`, null, {
    params: { status, disableReason },
  })
}

/** 重置管理员密码 */
export function resetAdminPassword(data: ResetAdminPasswordRequest) {
  return api.post<ApiResult>(`${ADMIN_PREFIX}/reset-password`, {
    adminId: data.adminId,
    newPassword: hashPasswordSHA256(data.newPassword),
  })
}
