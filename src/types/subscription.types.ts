import type { ApiResult } from './auth.types'
import type { PageData } from './team.types'

// ============ 枚举类型 ============

/** 计划类型 */
export type PlanType = 'FREE' | 'TRIAL' | 'PAID'

/** 适用范围 */
export type ApplyScope = 'PERSONAL' | 'COLLABORATION' | 'ALL'

/** 功能类型 */
export type FeatureType = 'BOOLEAN' | 'POINTS'

/** 订阅状态 */
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CANCELLED'

/** 订阅来源 */
export type SubscriptionSource = 'PURCHASE' | 'GRANT' | 'SYSTEM'

/** 订单类型 */
export type OrderType = 'SUBSCRIPTION' | 'POINTS_PACK' | 'RESOURCE_PACK'

/** 订单/支付状态 */
export type PayStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED' | 'REFUNDING' | 'REFUNDED' | 'CLOSED'

/** 支付渠道 */
export type PayChannel = 'ALIPAY' | 'WECHAT' | 'STRIPE'

/** 点数批次状态 */
export type BatchStatus = 'ACTIVE' | 'DEPLETED' | 'EXPIRED'

/** 点数批次来源 */
export type BatchSource = 'PURCHASE' | 'GRANT' | 'SUBSCRIPTION'

/** 交易类型 */
export type TransactionType = 'PURCHASE' | 'CONSUME' | 'GRANT' | 'ADJUST' | 'EXPIRE' | 'REFUND'

/** 资源类型 */
export type ResourceType = 'PROJECT' | 'MEMBER' | 'STORAGE'

/** 赠送类型 */
export type GrantType = 'SUBSCRIPTION' | 'POINTS' | 'RESOURCE' | 'ENTITLEMENT'

/** 赠送状态 */
export type GrantStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REVOKED'

/** 赠送类别 */
export type GrantCategory = 'ADMIN' | 'SYSTEM' | 'PROMOTION' | 'COMPENSATION'

/** 有效期类型 */
export type DurationType = 'PERMANENT' | 'FIXED_DAYS' | 'UNTIL_DATE'

// ============ 计划相关 ============

/** 计划功能项（列表用） */
export interface PlanFeatureItemVO {
  featureId: number
  featureCode: string
  featureName: string
  featureType: FeatureType
  featureTypeDesc?: string
  enabled: boolean
  limitValue?: number | null
  pointsCost?: number | null
  description?: string | null
}

/** 计划列表项 */
export interface PlanVO {
  id: number
  planCode: string
  planName: string
  planLevel: number
  planType: PlanType
  planTypeDesc?: string
  applyScope: ApplyScope
  applyScopeDesc?: string
  description?: string | null
  price: number
  originalPrice?: number | null
  currency: string
  durationDays: number | null
  dailyQuota?: number | null
  monthlyQuota?: number | null
  resourceLimits?: Record<string, number> | null
  features?: PlanFeatureItemVO[]
  isDefault: boolean
  isTrial: boolean
  isVisible: boolean
  sortOrder: number
  status: boolean
  createTime: string
}

/** 计划详情 */
export interface PlanDetailVO extends PlanVO {
  maxPurchaseCount: number | null
  maxGrantCount: number | null
  updateTime: string
}

/** 计划功能 */
export interface PlanFeatureVO {
  id: number
  featureId: number
  featureCode: string
  featureName: string
  featureType: FeatureType
  description: string | null
  pointsCost: number | null
  enabled: boolean
  featureConfig: string | null
}

/** 创建计划参数 */
export interface CreatePlanDTO {
  planCode: string
  planName: string
  planLevel: number
  planType: PlanType
  applyScope: ApplyScope
  description?: string
  price: number
  originalPrice?: number
  currency: string
  durationDays?: number
  dailyQuota?: number
  monthlyQuota?: number
  resourceLimits?: Record<ResourceType, number>
  isDefault?: boolean
  isTrial?: boolean
  isVisible?: boolean
  sortOrder?: number
  minSeats?: number
  maxSeats?: number
  seatPrice?: number
}

/** 更新计划参数 */
export interface UpdatePlanDTO {
  planCode?: string
  planName?: string
  planLevel?: number
  planType?: PlanType
  applyScope?: ApplyScope
  description?: string
  price?: number
  originalPrice?: number
  currency?: string
  durationDays?: number
  dailyQuota?: number
  monthlyQuota?: number
  resourceLimits?: Record<ResourceType, number>
  isDefault?: boolean
  isTrial?: boolean
  isVisible?: boolean
  sortOrder?: number
  minSeats?: number
  maxSeats?: number
  seatPrice?: number
}

/** 配置计划功能参数 */
export interface ConfigurePlanFeaturesDTO {
  features: {
    featureId: number
    enabled: boolean
    featureConfig?: string
  }[]
}

// ============ 功能相关 ============

/** 功能列表项 */
export interface FeatureVO {
  id: number
  featureCode: string
  featureName: string
  featureType: FeatureType
  featureTypeDesc: string
  description: string | null
  pointsCost: number | null
  sortOrder: number
  status: boolean
  statusDesc: string
  createTime: string
  updateTime: string
}

/** 功能详情 */
export interface FeatureDetailVO extends FeatureVO {
  dataVersion: number
}

/** 功能简单信息（下拉列表用） */
export interface FeatureSimpleVO {
  id: number
  featureCode: string
  featureName: string
  featureType: FeatureType
}

/** 创建功能参数 */
export interface CreateFeatureDTO {
  featureCode: string
  featureName: string
  featureType: FeatureType
  description?: string
  pointsCost?: number
  sortOrder?: number
}

/** 更新功能参数 */
export interface UpdateFeatureDTO extends Partial<CreateFeatureDTO> {}

// ============ 订阅相关 ============

/** 订阅列表项 */
export interface SubscriptionVO {
  id: number
  teamId: number
  teamName: string
  planId: number
  planCode: string
  planName: string
  status: SubscriptionStatus
  statusDesc: string
  source: SubscriptionSource
  sourceDesc: string
  startTime: string
  endTime: string | null
  seats: number
  grantUserId: number | null
  granterName: string | null
  granterAvatar: string | null
  grantReason: string | null
  createTime: string
}

/** 订阅功能 */
export interface SubscriptionFeatureVO {
  featureCode: string
  featureName: string
  enabled: boolean
  pointsCost: number | null
}

/** 订阅详情 */
export interface SubscriptionDetailVO extends SubscriptionVO {
  activatedAt: string | null
  expiredAt: string | null
  cancelledAt: string | null
  orderId: number | null
  grantId: number | null
  effectiveType: string | null
  remark: string | null
  createUserId: number | null
  updateTime: string
  features: SubscriptionFeatureVO[]
}

/** 延长订阅参数 */
export interface ExtendSubscriptionDTO {
  days: number
  reason?: string
}

/** 更新订阅参数 */
export interface AdminUpdateSubscriptionDTO {
  seats?: number
  endDate?: string
  remark?: string
}

// ============ 点数相关 ============

/** 点数批次 */
export interface BatchVO {
  id: number
  teamId: number
  batchNo: string
  source: string
  sourceDesc: string
  status: string
  statusDesc: string
  totalPoints: number
  remainingPoints: number
  usedPoints: number
  orderId: number | null
  packId: number | null
  packName: string | null
  expireTime: string | null
  createTime: string
}

/** 点数交易记录 */
export interface TransactionVO {
  id: number
  teamId: number
  type: string
  typeDesc: string
  points: number
  balanceBefore: number
  balanceAfter: number
  batchId: number | null
  batchNo: string | null
  orderId: number | null
  featureCode: string | null
  featureName: string | null
  bizId: string | null
  remark: string | null
  operatorId: number | null
  operatorName: string | null
  createTime: string
}

/** 点数账户列表项 (Admin) */
export interface PointsAccountVO {
  id: number
  teamId: number
  teamName: string
  ownerId: number
  ownerName: string
  totalBalance: number
  availableBalance: number
  frozenBalance: number
  totalEarned: number
  totalConsumed: number
  totalExpired: number
  totalAdjusted: number
  expiringPoints: number
  status: boolean
  statusDesc: string
  createTime: string
  lastTransactionTime: string | null
  activeBatchCount: number
  activeBatches: BatchVO[]
  recentTransactions: TransactionVO[]
}

/** 点数账户详情 (兼容旧API) */
export interface PointsAccountDetailVO {
  id: number
  teamId: number
  teamName: string
  totalPoints: number
  usedPoints: number
  availablePoints: number
  frozenPoints: number
  expiredPoints: number
  lastUsedTime: string | null
  createTime: string
  batches: LegacyBatchVO[]
}

/** 旧版批次格式 (兼容) */
export interface LegacyBatchVO {
  id: number
  batchNo: string
  originalPoints: number
  remainingPoints: number
  source: BatchSource
  sourceDesc: string
  status: BatchStatus
  expireAt: string | null
  createTime: string
}

/** 点数交易记录 (Admin列表) */
export interface AdminTransactionVO {
  id: number
  transactionNo?: string
  teamId: number
  teamName?: string
  userId?: number | null
  userNickname?: string | null
  batchId?: number | null
  batchNo?: string | null
  /** 交易类型 - 兼容 type 和 transactionType */
  transactionType?: TransactionType
  type?: TransactionType
  /** 交易类型描述 - 兼容 typeDesc 和 transactionTypeDesc */
  transactionTypeDesc?: string
  typeDesc?: string
  points: number
  balanceBefore?: number | null
  balanceAfter: number
  sourceType?: string | null
  sourceId?: string | null
  sourceDetail?: string | null
  description?: string | null
  remark?: string | null
  featureCode?: string | null
  featureName?: string | null
  orderId?: number | null
  operatorId?: number | null
  operatorName?: string | null
  createTime: string
}

/** 调整点数参数 */
export interface AdjustPointsDTO {
  teamId: number
  points: number
  expireDays?: number
  reason?: string
}

/** 调整点数结果 */
export interface AdjustPointsResultVO {
  teamId: number
  adjustedPoints: number
  availablePoints: number
  batchId: number | null
  batchNo: string | null
  transactionNo: string
}

/** 批量调整点数参数 */
export interface BatchAdjustPointsDTO {
  /** 团队ID列表 */
  teamIds: number[]
  /** 点数（正数=赠送，负数=扣减） */
  points: number
  /** 过期时间（仅赠送时有效，为空表示永不过期） */
  expireTime?: string
  /** 调整原因/备注 */
  reason?: string
  /** 操作人ID */
  operatorId?: number
}

/** 批量调整点数结果项 */
export interface BatchAdjustItemVO {
  /** 团队ID */
  teamId: number
  /** 团队名称 */
  teamName: string
  /** 调整点数 */
  adjustedPoints: number
  /** 当前可用点数 */
  availablePoints: number
  /** 是否成功 */
  success: boolean
  /** 失败原因 */
  errorMessage?: string
}

/** 批量调整点数结果 */
export interface BatchAdjustResultVO {
  /** 调整结果列表 */
  items: BatchAdjustItemVO[]
  /** 成功数量 */
  successCount: number
  /** 失败数量 */
  failCount: number
}

/** 设置点数过期时间参数 */
export interface SetPointsExpiryDTO {
  batchId: number
  expireTime: string
}

/** 冻结/解冻点数参数 */
export interface FreezePointsDTO {
  teamId: number
  points: number
  reason?: string
  operatorId?: number
}

/** 冻结/解冻点数结果 */
export interface FreezeResultVO {
  teamId: number
  operatedPoints: number
  availablePoints: number
  frozenPoints: number
}

// ============ 订单相关 ============

/** 订单列表项 */
export interface AdminOrderVO {
  id: number
  orderNo: string
  teamId: number
  teamName: string
  userId: number
  userNickname: string
  orderType: OrderType
  orderTypeDesc: string
  productCode: string
  productName: string
  quantity: number
  amount: number
  discountAmount: number
  payAmount: number
  currency: string
  payChannel: PayChannel | null
  payChannelDesc: string | null
  payStatus: PayStatus
  payStatusDesc: string
  paidAt: string | null
  expireAt: string | null
  createTime: string
}

/** 订单详情 */
export interface AdminOrderDetailVO extends AdminOrderVO {
  productId: number
  productSnapshot: string | null
  seats: number | null
  closedAt: string | null
  closeReason: string | null
  externalOrderNo: string | null
  source: string | null
  effectiveType: string | null
  subscriptionId: number | null
  subscriptionNo: string | null
  pointsBatchId: number | null
  resourceRecordId: number | null
  clientIp: string | null
  userAgent: string | null
  remark: string | null
  updateTime: string
}

/** 支付记录 */
export interface PaymentRecordVO {
  id: number
  paymentNo: string
  orderId: number
  orderNo: string
  payChannel: PayChannel
  payChannelDesc: string
  amount: number
  currency: string
  status: PayStatus
  statusDesc: string
  externalPaymentNo: string | null
  paidAt: string | null
  createTime: string
}

/** 退款参数 */
export interface RefundOrderDTO {
  refundAmount: number
  reason?: string
}

/** 确认支付参数 */
export interface ConfirmPaymentDTO {
  payChannel: PayChannel
  externalPaymentNo?: string
  remark?: string
}

// ============ 资源扩容包相关 ============

/** 扩容包列表项 */
export interface AdminPackVO {
  id: number
  packCode: string
  packName: string
  resourceType: ResourceType
  resourceTypeDesc: string
  resourceAmount: number
  resourceUnit: string
  price: number
  currency: string
  durationType: DurationType
  durationTypeDesc: string
  durationDays: number | null
  status: number
  statusDesc: string
  sortOrder: number
  totalAllocations: number
  createTime: string
}

/** 扩容包详情 */
export interface AdminPackDetailVO extends AdminPackVO {
  description: string | null
  originalPrice: number | null
  maxPurchaseCount: number | null
  totalPurchases: number
  totalGrants: number
  updateTime: string
}

/** 创建扩容包参数 */
export interface CreatePackDTO {
  packCode: string
  packName: string
  resourceType: ResourceType
  resourceAmount: number
  price: number
  originalPrice?: number
  currency: string
  durationType: DurationType
  durationDays?: number
  description?: string
  maxPurchaseCount?: number
  sortOrder?: number
}

/** 更新扩容包参数 */
export interface UpdatePackDTO extends Partial<CreatePackDTO> {}

/** 扩容包分配记录 */
export interface PackAllocationVO {
  id: number
  packId: number
  packName: string
  teamId: number
  teamName: string
  resourceType: ResourceType
  resourceAmount: number
  source: 'PURCHASE' | 'GRANT'
  sourceDesc: string
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED'
  statusDesc: string
  expireAt: string | null
  createTime: string
}

/** 分配扩容包参数 */
export interface AllocatePackDTO {
  teamId: number
  quantity?: number
  expireDays?: number
  reason?: string
}

/** 回收扩容包参数 */
export interface RevokePackDTO {
  allocationId: number
  reason?: string
}

// ============ 赠送记录相关 ============

/** 赠送记录列表项 */
export interface GrantRecordVO {
  grantId: string
  recordId: number
  grantType: GrantType
  grantTypeDesc: string
  teamId: number
  teamName: string
  grantContent: string
  grantAmount: string
  status: GrantRecordStatus
  statusDesc: string
  expireTime: string | null
  reason: string | null
  operatorId: number | null
  operatorName: string | null
  createTime: string
}

/** 赠送记录状态 */
export type GrantRecordStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED'

/** 赠送记录详情 */
export interface GrantRecordDetailVO extends GrantRecordVO {
  effectiveTime: string | null
  revokedAt: string | null
  revokedBy: number | null
  revokedByName: string | null
  revokeReason: string | null
  remark: string | null
  updateTime: string
}

/** 赠送订阅参数（新API） */
export interface AdminGrantSubscriptionDTO {
  teamId: number
  planId: number
  durationDays: number
  reason?: string
  seats?: number
  grantUserId?: number
}

/** 赠送订阅参数（赠送记录） */
export interface GrantSubscriptionDTO {
  teamId: number
  planId: number
  durationDays?: number
  effectiveType?: 'IMMEDIATE' | 'SCHEDULED'
  effectiveDate?: string
  grantCategory: GrantCategory
  grantReason?: string
}

/** 赠送点数参数 */
export interface GrantPointsDTO {
  teamId: number
  points: number
  expireDays?: number
  grantCategory: GrantCategory
  grantReason?: string
}

/** 赠送资源参数 */
export interface GrantResourceDTO {
  teamId: number
  packId: number
  quantity?: number
  expireDays?: number
  grantCategory: GrantCategory
  grantReason?: string
}

/** 赠送权益参数 */
export interface GrantEntitlementDTO {
  teamId: number
  entitlementCode: string
  expireDays?: number
  grantCategory: GrantCategory
  grantReason?: string
}

/** 批量赠送参数 */
export interface BatchGrantDTO {
  teamIds: number[]
  grantType: GrantType
  productId?: number
  quantity?: number
  expireDays?: number
  grantCategory: GrantCategory
  grantReason?: string
}

/** 赠送结果 */
export interface GrantResultVO {
  grantId: number
  grantNo: string
  status: GrantStatus
  message: string | null
}

// ============ 查询参数 ============

/** 计划列表查询参数 */
export interface PlanListParams {
  page: number
  size: number
  planCode?: string
  planName?: string
  planType?: PlanType
  status?: boolean
  keyword?: string
  isVisible?: boolean
}

/** 功能列表查询参数 */
export interface FeatureListParams {
  page: number
  size: number
  name?: string
  code?: string
  featureType?: FeatureType
  status?: boolean
}

/** 订阅列表查询参数 */
export interface SubscriptionListParams {
  page: number
  size: number
  teamId?: number
  userId?: number
  planId?: number
  planCode?: string
  status?: SubscriptionStatus
  source?: SubscriptionSource
  subscriptionNo?: string
}

/** 点数账户列表查询参数 */
export interface PointsAccountListParams {
  page: number
  size: number
  teamId?: number
  minBalance?: number
  maxBalance?: number
}

/** 点数交易记录查询参数 */
export interface TransactionListParams {
  page: number
  size: number
  teamId?: number
  type?: TransactionType
  startTime?: string
  endTime?: string
}

/** 订单列表查询参数 */
export interface OrderListParams {
  page: number
  size: number
  teamId?: number
  orderNo?: string
  orderType?: OrderType
  payStatus?: PayStatus
  payChannel?: PayChannel
  startTime?: string
  endTime?: string
}

/** 扩容包列表查询参数 */
export interface PackListParams {
  page: number
  size: number
  name?: string
  type?: ResourceType
  status?: boolean
}

/** 赠送记录查询参数 */
export interface GrantListParams {
  page: number
  size: number
  userId?: number
  teamId?: number
  grantType?: GrantType
  status?: GrantStatus
  grantCategory?: GrantCategory
  batchNo?: string
  startTime?: string
  endTime?: string
}

// ============ 响应类型 ============

export type PlanListResponse = ApiResult<PageData<PlanVO>>
export type PlanDetailResponse = ApiResult<PlanDetailVO>
export type PlanFeaturesResponse = ApiResult<PlanFeatureVO[]>

export type FeatureListResponse = ApiResult<PageData<FeatureVO>>
export type FeatureDetailResponse = ApiResult<FeatureDetailVO>
export type FeatureSimpleListResponse = ApiResult<FeatureSimpleVO[]>

export type SubscriptionListResponse = ApiResult<PageData<SubscriptionVO>>
export type SubscriptionDetailResponse = ApiResult<SubscriptionDetailVO>

export type PointsAccountListResponse = ApiResult<PageData<PointsAccountVO>>
export type PointsAccountDetailResponse = ApiResult<PointsAccountDetailVO>
export type TransactionListResponse = ApiResult<PageData<AdminTransactionVO>>
export type AdjustPointsResponse = ApiResult<AdjustPointsResultVO>
export type BatchAdjustPointsResponse = ApiResult<BatchAdjustResultVO>
export type FreezePointsResponse = ApiResult<FreezeResultVO>

export type OrderListResponse = ApiResult<PageData<AdminOrderVO>>
export type OrderDetailResponse = ApiResult<AdminOrderDetailVO>
export type PaymentRecordsResponse = ApiResult<PaymentRecordVO[]>

export type PackListResponse = ApiResult<PageData<AdminPackVO>>
export type PackDetailResponse = ApiResult<AdminPackDetailVO>
export type PackAllocationListResponse = ApiResult<PageData<PackAllocationVO>>

export type GrantListResponse = ApiResult<PageData<GrantRecordVO>>
export type GrantDetailResponse = ApiResult<GrantRecordDetailVO>
export type GrantResponse = ApiResult<GrantResultVO>
