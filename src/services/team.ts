import { api } from './api'
import type {
  TeamListParams,
  TeamListResponse,
  TeamDetailResponse,
  TeamMemberListResponse,
} from '@/types/team.types'
import type { ApiResult } from '@/types/auth.types'

const ADMIN_TEAMS_PREFIX = '/v1/admin/teams'

/** 分页查询团队列表 */
export function getTeamList(params: TeamListParams) {
  return api.get<TeamListResponse>(ADMIN_TEAMS_PREFIX, { params })
}

/** 获取团队详情 */
export function getTeamDetail(teamId: number) {
  return api.get<TeamDetailResponse>(`${ADMIN_TEAMS_PREFIX}/${teamId}`)
}

/** 强制解散团队（管理员操作） */
export function disbandTeam(teamId: number) {
  return api.delete<ApiResult>(`${ADMIN_TEAMS_PREFIX}/${teamId}`)
}

/** 获取团队成员列表 */
export function getTeamMembers(teamId: number) {
  return api.get<TeamMemberListResponse>(`${ADMIN_TEAMS_PREFIX}/${teamId}/members`)
}
