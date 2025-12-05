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
  page: number
  /** 每页数量 */
  size: number
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

// ============ 点数账户相关类型 ============

/** 点数批次详情 */
export interface BatchVO {
  /** 批次ID */
  id: number
  /** 团队ID */
  teamId: number
  /** 批次编号 */
  batchNo: string
  /** 来源 */
  source: string
  /** 来源描述 */
  sourceDesc: string
  /** 状态 */
  status: string
  /** 状态描述 */
  statusDesc: string
  /** 总点数 */
  totalPoints: number
  /** 剩余点数 */
  remainingPoints: number
  /** 已使用点数 */
  usedPoints: number
  /** 关联订单ID */
  orderId: number | null
  /** 点数包ID */
  packId: number | null
  /** 点数包名称 */
  packName: string | null
  /** 过期时间（为空表示永久有效） */
  expireTime: string | null
  /** 创建时间 */
  createTime: string
}

/** 点数交易记录 */
export interface TransactionVO {
  /** 交易ID */
  id: number
  /** 团队ID */
  teamId: number
  /** 交易类型 */
  type: string
  /** 类型描述 */
  typeDesc: string
  /** 变动点数（正数增加，负数减少） */
  points: number
  /** 变动前余额 */
  balanceBefore: number
  /** 变动后余额 */
  balanceAfter: number
  /** 批次ID */
  batchId: number | null
  /** 批次号 */
  batchNo: string | null
  /** 关联订单ID */
  orderId: number | null
  /** 功能编码 */
  featureCode: string | null
  /** 功能名称 */
  featureName: string | null
  /** 业务ID（幂等） */
  bizId: string | null
  /** 备注 */
  remark: string | null
  /** 操作人ID */
  operatorId: number | null
  /** 操作人名称 */
  operatorName: string | null
  /** 创建时间 */
  createTime: string
}

/** 点数账户详情（Admin端） */
export interface AdminPointsAccountVO {
  /** 账户ID */
  id: number
  /** 团队ID */
  teamId: number
  /** 团队名称 */
  teamName: string
  /** 团队所有者ID */
  ownerId: number
  /** 团队所有者名称 */
  ownerName: string
  /** 总余额 */
  totalBalance: number
  /** 可用余额 */
  availableBalance: number
  /** 冻结余额 */
  frozenBalance: number
  /** 累计获得 */
  totalEarned: number
  /** 累计消费 */
  totalConsumed: number
  /** 累计过期 */
  totalExpired: number
  /** 累计调整 */
  totalAdjusted: number
  /** 即将过期点数（7天内） */
  expiringPoints: number
  /** 状态 */
  status: boolean
  /** 状态描述 */
  statusDesc: string
  /** 账户创建时间 */
  createTime: string
  /** 最后交易时间 */
  lastTransactionTime: string | null
  /** 活跃批次数量 */
  activeBatchCount: number
  /** 活跃批次列表 */
  activeBatches: BatchVO[]
  /** 最近交易记录 */
  recentTransactions: TransactionVO[]
  /** 当前套餐ID */
  planId: number | null
  /** 当前套餐名称 */
  planName: string | null
  /** 套餐到期时间 */
  planEndDate: string | null
  /** 订阅状态 */
  subscriptionStatus: string | null
  /** 订阅状态描述 */
  subscriptionStatusDesc: string | null
}

/** 点数账户详情响应 */
export type AdminPointsAccountResponse = ApiResult<AdminPointsAccountVO>
