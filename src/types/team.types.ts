import type { ApiResult } from './auth.types'
import type { UserVO } from './user.types'

/** 团队类型 */
export type TeamType = 'PERSONAL_SPACE' | 'COLLABORATION_TEAM'

/** 团队成员角色 */
export type TeamMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER'

/** 团队视图对象 */
export interface TeamVO {
  /** 团队ID */
  id: number
  /** 团队名称 */
  name: string
  /** 所有者ID */
  ownerId: number
  /** 所有者昵称 */
  ownerNickname: string | null
  /** 所有者头像 */
  ownerAvatarUrl: string | null
  /** 团队logo */
  logoUrl: string | null
  /** 团队类型 */
  type: TeamType
  /** 团队描述 */
  description: string | null
  /** 创建时间 */
  createTime: string
  /** 是否为用户默认团队 */
  isDefault: boolean | null
  /** 套餐名称 */
  planName: string | null
  /** 套餐到期日期 */
  planEndDate: string | null
  /** 可用积分 */
  availablePoints: number | null
}

/** 团队成员视图对象 */
export interface TeamMemberVO {
  /** 成员ID（TeamMember表的ID） */
  id: number
  /** 用户信息 */
  user: UserVO
  /** 角色 */
  role: TeamMemberRole
  /** 是否默认团队 */
  isDefault: boolean
  /** 加入时间 */
  joinedTime: string
}

/** 分页数据 */
export interface PageData<T> {
  /** 数据列表 */
  records: T[]
  /** 总记录数 */
  total: number
  /** 每页大小 */
  size: number
  /** 当前页码 */
  current: number
  /** 总页数 */
  pages: number
}

/** 团队列表查询参数 */
export interface TeamListParams {
  /** 页码 */
  pageNum: number
  /** 每页数量 */
  pageSize: number
  /** 团队ID */
  teamId?: number
  /** 团队名称（模糊查询） */
  name?: string
  /** 团队类型 */
  type?: TeamType
  /** 所有者用户ID */
  ownerId?: number
  /** 是否已解散 */
  disbanded?: boolean
}

/** 团队列表响应 */
export type TeamListResponse = ApiResult<PageData<TeamVO>>

/** 团队详情响应 */
export type TeamDetailResponse = ApiResult<TeamVO>

/** 团队成员列表响应 */
export type TeamMemberListResponse = ApiResult<TeamMemberVO[]>
