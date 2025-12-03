import type { ApiResult } from './auth.types'
import type { PageData } from './team.types'

// ==================== 枚举和常量 ====================

/** 订阅状态 */
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CANCELLED'

/** 订阅来源 */
export type SubscriptionSource = 'PURCHASE' | 'GRANT' | 'TRIAL' | 'SYSTEM'

/** 生效方式 */
export type EffectiveType = 'IMMEDIATE' | 'SEQUENTIAL'

/** 适用范围 */
export type ApplyScope = 'PERSONAL' | 'COLLABORATION' | 'ALL'

/** 货币类型 */
export type CurrencyType = 'CNY' | 'USD'

/** 计划类型 */
export type PlanType = 'FREE' | 'TRIAL' | 'PAID'

/** 功能类型 */
export type FeatureType = 'BOOLEAN' | 'POINTS'

/** 订单类型 */
export type OrderType = 'SUBSCRIPTION' | 'POINTS' | 'RESOURCE_PACK'

/** 支付状态 */
export type PayStatus = 'UNPAID' | 'PAYING' | 'PAID' | 'CLOSED' | 'REFUNDED'

/** 资源类型 */
export type ResourceType = 'PROJECT' | 'MEMBER' | 'STORAGE'

/** 扩容包时效类型 */
export type DurationType = 'PERMANENT' | 'TEMPORARY'

/** 赠送类型 */
export type GrantType = 'SUBSCRIPTION' | 'POINTS' | 'RESOURCE_PACK' | 'QUOTA'

/** 赠送分类 */
export type GrantCategory = 'VIP' | 'PROMOTION' | 'COMPENSATION' | 'OTHER'

/** 赠送状态 */
export type GrantStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REVOKED'

// ==================== 计划相关 ====================

/** 订阅计划列表VO */
export interface PlanVO {
  /** 主键ID */
  id: number
  /** 计划编码 */
  planCode: string
  /** 计划名称 */
  planName: string
  /** 等级 */
  planLevel: number
  /** 计划类型 */
  planType: string
  /** 适用范围 */
  applyScope: ApplyScope
  /** 价格 */
  price: number
  /** 货币类型 */
  currency: CurrencyType
  /** 有效天数 */
  durationDays: number | null
  /** 是否默认 */
  isDefault: boolean
  /** 是否试用 */
  isTrial: boolean
  /** 是否可见 */
  isVisible: boolean
  /** 排序 */
  sortOrder: number
  /** 状态: true-启用 false-禁用 */
  status: boolean
  /** 创建时间 */
  createTime: string
}

/** 订阅计划详情VO */
export interface PlanDetailVO extends PlanVO {
  /** 描述 */
  description: string | null
  /** 原价 */
  originalPrice: number | null
  /** 每日配额 */
  dailyQuota: number | null
  /** 月度配额 */
  monthlyQuota: number | null
  /** 资源上限 JSON字符串 */
  resourceLimits: string | null
  /** 最大购买次数 */
  maxPurchaseCount: number | null
  /** 最大赠送次数 */
  maxGrantCount: number | null
  /** 更新时间 */
  updateTime: string
}

/** 创建计划DTO */
export interface CreatePlanDTO {
  /** 计划编码 */
  planCode: string
  /** 计划名称 */
  planName: string
  /** 等级 */
  planLevel: number
  /** 计划类型 */
  planType: string
  /** 适用范围 */
  applyScope: ApplyScope
  /** 描述 */
  description?: string
  /** 价格 */
  price?: number
  /** 原价 */
  originalPrice?: number
  /** 货币类型 */
  currency?: CurrencyType
  /** 有效天数 */
  durationDays?: number
  /** 每日配额 */
  dailyQuota?: number
  /** 月度配额 */
  monthlyQuota?: number
  /** 资源上限 */
  resourceLimits?: string
  /** 最大购买次数 */
  maxPurchaseCount?: number
  /** 最大赠送次数 */
  maxGrantCount?: number
  /** 是否默认 */
  isDefault?: boolean
  /** 是否试用 */
  isTrial?: boolean
  /** 是否可见 */
  isVisible?: boolean
  /** 排序 */
  sortOrder?: number
}

/** 更新计划DTO */
export interface UpdatePlanDTO extends Partial<CreatePlanDTO> {}

/** 计划列表查询参数 */
export interface PlanListParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  size: number
  /** 计划名称 */
  name?: string
  /** 状态 */
  status?: boolean
}

// ==================== 功能相关 ====================

/** 功能列表VO */
export interface FeatureVO {
  /** ID */
  id: number
  /** 功能编码 */
  featureCode: string
  /** 功能名称 */
  featureName: string
  /** 功能类型 */
  featureType: string
  /** 功能类型描述 */
  featureTypeDesc: string
  /** 描述 */
  description: string | null
  /** 消耗点数 */
  pointsCost: number | null
  /** 排序 */
  sortOrder: number
  /** 状态: true-启用 false-禁用 */
  status: boolean
  /** 状态描述 */
  statusDesc: string
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
}

/** 功能详情VO */
export interface FeatureDetailVO extends FeatureVO {}

/** 功能简单VO（下拉列表用） */
export interface FeatureSimpleVO {
  /** ID */
  id: number
  /** 功能编码 */
  featureCode: string
  /** 功能名称 */
  featureName: string
  /** 功能类型 */
  featureType: string
}

/** 创建功能DTO */
export interface CreateFeatureDTO {
  /** 功能编码 */
  featureCode: string
  /** 功能名称 */
  featureName: string
  /** 功能类型 */
  featureType: string
  /** 消耗点数（点数型功能必填） */
  pointsCost?: number
  /** 描述 */
  description?: string
  /** 排序 */
  sortOrder?: number
}

/** 更新功能DTO */
export interface UpdateFeatureDTO extends Partial<CreateFeatureDTO> {}

/** 功能列表查询参数 */
export interface FeatureListParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  size: number
  /** 功能名称 */
  name?: string
  /** 功能编码 */
  code?: string
  /** 状态 */
  status?: boolean
}

/** 计划功能关联VO */
export interface PlanFeatureVO {
  /** 功能ID */
  featureId: number
  /** 功能编码 */
  featureCode: string
  /** 功能名称 */
  featureName: string
  /** 功能类型 */
  featureType: string
  /** 是否启用 */
  enabled: boolean
  /** 功能配置 */
  featureConfig: Record<string, unknown> | null
}

/** 功能配置项 */
export interface FeatureConfigItem {
  /** 功能ID */
  featureId: number
  /** 是否启用 */
  enabled: boolean
  /** 功能配置 */
  featureConfig?: Record<string, unknown>
}

/** 配置计划功能DTO */
export interface ConfigurePlanFeaturesDTO {
  /** 功能配置列表 */
  features: FeatureConfigItem[]
}

// ==================== 订阅相关 ====================

/** 订阅列表VO */
export interface SubscriptionVO {
  /** 主键ID */
  id: number
  /** 订阅编号 */
  subscriptionNo: string
  /** 团队ID */
  teamId: number
  /** 团队名称 */
  teamName: string
  /** 计划ID */
  planId: number
  /** 计划编码 */
  planCode: string
  /** 计划名称 */
  planName: string
  /** 计划等级 */
  planLevel: number
  /** 状态 */
  status: SubscriptionStatus
  /** 开始日期 */
  startDate: string
  /** 结束日期 */
  endDate: string | null
  /** 来源 */
  source: SubscriptionSource
  /** 价格 */
  price: number
  /** 实付金额 */
  paidAmount: number
  /** 席位数 */
  seats: number | null
  /** 订单编号 */
  orderNo: string | null
  /** 赠送单号 */
  grantNo: string | null
  /** 创建时间 */
  createTime: string
}

/** 订阅功能VO */
export interface SubscriptionFeatureVO {
  /** 功能编码 */
  featureCode: string
  /** 功能名称 */
  featureName: string
  /** 功能类型 */
  featureType: string
  /** 是否启用 */
  enabled: boolean
  /** 功能配置 */
  featureConfig: Record<string, unknown> | null
}

/** 订阅详情VO */
export interface SubscriptionDetailVO extends SubscriptionVO {
  /** 激活时间 */
  activatedAt: string | null
  /** 过期时间 */
  expiredAt: string | null
  /** 取消时间 */
  cancelledAt: string | null
  /** 订单ID */
  orderId: number | null
  /** 赠送ID */
  grantId: number | null
  /** 生效方式 */
  effectiveType: EffectiveType
  /** 备注 */
  remark: string | null
  /** 创建用户ID */
  createUserId: number | null
  /** 更新时间 */
  updateTime: string
  /** 订阅功能列表 */
  features: SubscriptionFeatureVO[]
}

/** 订阅列表查询参数 */
export interface SubscriptionListParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  size: number
  /** 团队ID */
  teamId?: number
  /** 用户ID */
  userId?: number
  /** 计划ID */
  planId?: number
  /** 计划编码 */
  planCode?: string
  /** 状态 */
  status?: SubscriptionStatus
  /** 来源 */
  source?: SubscriptionSource
  /** 订阅编号 */
  subscriptionNo?: string
}

/** 管理员创建订阅DTO */
export interface AdminCreateSubscriptionDTO {
  /** 团队ID */
  teamId: number
  /** 计划ID */
  planId: number
  /** 生效方式 */
  effectiveType?: EffectiveType
  /** 开始日期 */
  startDate?: string
  /** 结束日期 */
  endDate?: string
  /** 席位数 */
  seats?: number
  /** 备注 */
  remark?: string
}

/** 管理员更新订阅DTO */
export interface AdminUpdateSubscriptionDTO {
  /** 结束日期 */
  endDate?: string
  /** 席位数 */
  seats?: number
  /** 备注 */
  remark?: string
}

/** 取消订阅DTO */
export interface CancelSubscriptionDTO {
  /** 取消原因 */
  reason?: string
}

/** 延长订阅DTO */
export interface ExtendSubscriptionDTO {
  /** 延长天数 */
  days: number
  /** 备注 */
  remark?: string
}

// ==================== 订单相关 ====================

/** 订单列表VO (Admin) */
export interface AdminOrderVO {
  /** 订单ID */
  id: number
  /** 订单号 */
  orderNo: string
  /** 团队ID */
  teamId: number
  /** 团队名称 */
  teamName: string
  /** 下单用户ID */
  userId: number
  /** 下单用户昵称 */
  userNickname: string
  /** 订单类型 */
  orderType: string
  /** 订单类型描述 */
  orderTypeDesc: string
  /** 商品编码 */
  productCode: string
  /** 商品名称 */
  productName: string
  /** 数量 */
  quantity: number
  /** 订单金额 */
  amount: number
  /** 优惠金额 */
  discountAmount: number
  /** 实付金额 */
  payAmount: number
  /** 货币类型 */
  currency: string
  /** 支付渠道 */
  payChannel: string | null
  /** 支付渠道描述 */
  payChannelDesc: string | null
  /** 支付状态 */
  payStatus: string
  /** 支付状态描述 */
  payStatusDesc: string
  /** 支付时间 */
  paidAt: string | null
  /** 订单过期时间 */
  expireAt: string
  /** 创建时间 */
  createTime: string
}

/** 订单详情VO (Admin) */
export interface AdminOrderDetailVO extends AdminOrderVO {
  /** 商品快照 */
  productSnapshot: Record<string, unknown> | null
  /** 支付流水号 */
  payTransactionNo: string | null
  /** 退款时间 */
  refundedAt: string | null
  /** 退款金额 */
  refundAmount: number | null
  /** 备注 */
  remark: string | null
  /** 更新时间 */
  updateTime: string
}

/** 支付记录VO */
export interface PaymentRecordVO {
  /** ID */
  id: number
  /** 订单ID */
  orderId: number
  /** 交易号 */
  transactionNo: string
  /** 支付渠道 */
  payChannel: string
  /** 支付渠道描述 */
  payChannelDesc: string
  /** 金额 */
  amount: number
  /** 状态 */
  status: string
  /** 状态描述 */
  statusDesc: string
  /** 创建时间 */
  createTime: string
}

/** 订单列表查询参数 */
export interface OrderListParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  size: number
  /** 团队ID */
  teamId?: number
  /** 订单号 */
  orderNo?: string
  /** 订单类型 */
  orderType?: string
  /** 支付状态 */
  payStatus?: string
  /** 支付渠道 */
  payChannel?: string
  /** 开始时间 */
  startTime?: string
  /** 结束时间 */
  endTime?: string
}

/** 退款DTO */
export interface RefundOrderDTO {
  /** 退款金额 */
  refundAmount: number
  /** 退款原因 */
  reason?: string
}

/** 手动确认支付DTO */
export interface ConfirmPaymentDTO {
  /** 支付渠道 */
  payChannel: string
  /** 支付流水号 */
  transactionNo: string
  /** 备注 */
  remark?: string
}

// ==================== 点数相关 ====================

/** 点数账户VO */
export interface PointsAccountVO {
  /** 账户ID */
  id: number
  /** 团队ID */
  teamId: number
  /** 团队名称 */
  teamName: string
  /** 总获得点数 */
  totalPoints: number
  /** 已使用点数 */
  usedPoints: number
  /** 可用点数 */
  availablePoints: number
  /** 冻结点数 */
  frozenPoints: number
  /** 已过期点数 */
  expiredPoints: number
  /** 最近使用时间 */
  lastUsedTime: string | null
  /** 创建时间 */
  createTime: string
}

/** 点数账户详情VO */
export interface PointsAccountDetailVO extends PointsAccountVO {
  /** 批次列表 */
  batches?: BatchVO[]
}

/** 批次VO */
export interface BatchVO {
  /** 批次ID */
  id: number
  /** 点数 */
  points: number
  /** 剩余点数 */
  remainingPoints: number
  /** 来源 */
  source: string
  /** 过期日期 */
  expireDate: string | null
  /** 创建时间 */
  createTime: string
}

/** 点数交易记录VO (Admin) */
export interface AdminTransactionVO {
  /** ID */
  id: number
  /** 交易编号 */
  transactionNo: string
  /** 团队ID */
  teamId: number
  /** 团队名称 */
  teamName: string
  /** 用户ID */
  userId: number | null
  /** 用户昵称 */
  userNickname: string | null
  /** 批次ID */
  batchId: number | null
  /** 批次编号 */
  batchNo: string | null
  /** 交易类型 */
  transactionType: string
  /** 交易类型描述 */
  transactionTypeDesc: string
  /** 交易点数 */
  points: number
  /** 交易前余额 */
  balanceBefore: number
  /** 交易后余额 */
  balanceAfter: number
  /** 来源类型 */
  sourceType: string
  /** 来源ID */
  sourceId: string | null
  /** 来源详情 */
  sourceDetail: string | null
  /** 描述 */
  description: string | null
  /** 备注 */
  remark: string | null
  /** 创建时间 */
  createTime: string
}

/** 点数账户查询参数 */
export interface PointsAccountListParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  size: number
  /** 团队ID */
  teamId?: number
  /** 团队名称 */
  teamName?: string
}

/** 点数交易查询参数 */
export interface PointsTransactionListParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  size: number
  /** 团队ID */
  teamId?: number
  /** 交易类型 */
  type?: string
  /** 来源 */
  source?: string
  /** 开始时间 */
  startTime?: string
  /** 结束时间 */
  endTime?: string
}

/** 调整点数DTO */
export interface AdjustPointsDTO {
  /** 团队ID */
  teamId: number
  /** 调整点数（正数增加，负数减少） */
  points: number
  /** 调整原因/备注 */
  reason: string
  /** 过期时间（仅增加点数时有效，不填则永不过期） */
  expireAt?: string
  /** 过期天数（仅增加点数时有效，从当前时间起计算） */
  expireDays?: number
}

/** 调整结果项 */
export interface AdjustResultItem {
  /** 团队ID */
  teamId: number
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  errorMessage: string | null
}

/** 批量调整点数DTO */
export interface BatchAdjustPointsDTO {
  /** 调整项列表 */
  items: Array<{
    teamId: number
    amount: number
  }>
  /** 调整原因 */
  reason: string
  /** 过期天数 */
  expireDays?: number
}

/** 设置点数过期DTO */
export interface SetPointsExpiryDTO {
  /** 过期日期 */
  expireDate: string
}

// ==================== 资源扩容包相关 ====================

/** 扩容包列表VO (Admin) */
export interface AdminPackVO {
  /** 扩容包ID */
  id: number
  /** 扩容包编码 */
  packCode: string
  /** 扩容包名称 */
  packName: string
  /** 资源类型 */
  resourceType: string
  /** 资源类型描述 */
  resourceTypeDesc: string
  /** 资源数量 */
  resourceAmount: number
  /** 资源单位 */
  resourceUnit: string
  /** 价格 */
  price: number
  /** 货币类型 */
  currency: string
  /** 时效类型 */
  durationType: string
  /** 时效类型描述 */
  durationTypeDesc: string
  /** 有效期天数 */
  durationDays: number | null
  /** 状态: 0-禁用 1-启用 */
  status: number
  /** 状态描述 */
  statusDesc: string
  /** 排序 */
  sortOrder: number
  /** 总分配次数 */
  totalAllocations: number
  /** 创建时间 */
  createTime: string
}

/** 扩容包详情VO (Admin) */
export interface AdminPackDetailVO extends AdminPackVO {
  /** 描述 */
  description: string | null
  /** 原价 */
  originalPrice: number | null
  /** 更新时间 */
  updateTime: string
}

/** 创建扩容包DTO */
export interface CreatePackDTO {
  /** 扩容包编码 */
  packCode: string
  /** 扩容包名称 */
  packName: string
  /** 资源类型 */
  resourceType: string
  /** 资源数量 */
  resourceAmount: number
  /** 价格 */
  price: number
  /** 原价 */
  originalPrice?: number
  /** 货币类型 */
  currency?: string
  /** 时效类型 */
  durationType: string
  /** 有效天数 */
  durationDays?: number
  /** 描述 */
  description?: string
  /** 排序 */
  sortOrder?: number
}

/** 更新扩容包DTO */
export interface UpdatePackDTO extends Partial<CreatePackDTO> {}

/** 扩容包列表查询参数 */
export interface ResourcePackListParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  size: number
  /** 扩容包名称 */
  name?: string
  /** 资源类型 */
  type?: string
  /** 状态 */
  status?: boolean
}

/** 扩容包分配记录VO */
export interface PackAllocationVO {
  /** ID */
  id: number
  /** 扩容包ID */
  packId: number
  /** 扩容包名称 */
  packName: string
  /** 团队ID */
  teamId: number
  /** 团队名称 */
  teamName: string
  /** 来源 */
  source: string
  /** 来源描述 */
  sourceDesc: string
  /** 过期日期 */
  expireDate: string | null
  /** 状态 */
  status: string
  /** 状态描述 */
  statusDesc: string
  /** 分配时间 */
  allocatedAt: string
  /** 创建时间 */
  createTime: string
}

/** 分配扩容包DTO */
export interface AllocatePackDTO {
  /** 团队ID */
  teamId: number
  /** 数量 */
  quantity?: number
  /** 备注 */
  remark?: string
}

/** 回收扩容包DTO */
export interface RevokePackDTO {
  /** 分配记录ID */
  allocationId: number
  /** 原因 */
  reason?: string
}

// ==================== 赠送相关 ====================

/** 赠送记录列表VO */
export interface GrantRecordVO {
  /** 主键ID */
  id: number
  /** 赠送单号 */
  grantNo: string
  /** 批次号 */
  batchNo: string | null
  /** 接收团队ID */
  teamId: number
  /** 接收团队名称 */
  teamName: string
  /** 接收用户ID */
  userId: number | null
  /** 接收用户名称 */
  userName: string | null
  /** 赠送类型 */
  grantType: string
  /** 赠送类型描述 */
  grantTypeDesc: string
  /** 商品名称 */
  productName: string | null
  /** 数量 */
  quantity: number
  /** 原价值 */
  originalValue: number
  /** 赠送分类 */
  grantCategory: string
  /** 赠送分类描述 */
  grantCategoryDesc: string
  /** 状态 */
  status: string
  /** 状态描述 */
  statusDesc: string
  /** 操作人姓名 */
  grantedByName: string
  /** 赠送时间 */
  grantedAt: string | null
  /** 创建时间 */
  createTime: string
}

/** 赠送记录详情VO */
export interface GrantRecordDetailVO extends GrantRecordVO {
  /** 赠送原因 */
  grantReason: string | null
  /** 关联记录ID */
  relatedId: number | null
  /** 撤销时间 */
  revokedAt: string | null
  /** 撤销原因 */
  revokeReason: string | null
  /** 撤销人名称 */
  revokedByName: string | null
  /** 备注 */
  remark: string | null
  /** 更新时间 */
  updateTime: string
}

/** 赠送记录列表查询参数 */
export interface GrantRecordListParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  size: number
  /** 用户ID */
  userId?: number
  /** 团队ID */
  teamId?: number
  /** 赠送类型 */
  grantType?: string
  /** 状态 */
  status?: string
  /** 赠送分类 */
  grantCategory?: string
  /** 批次号 */
  batchNo?: string
  /** 开始时间 */
  startTime?: string
  /** 结束时间 */
  endTime?: string
}

/** 赠送订阅DTO */
export interface GrantSubscriptionDTO {
  /** 团队ID */
  teamId: number
  /** 计划ID */
  planId: number
  /** 生效方式 */
  effectiveType?: EffectiveType
  /** 有效天数（覆盖计划默认值） */
  durationDays?: number
  /** 赠送分类 */
  grantCategory: string
  /** 赠送原因 */
  grantReason?: string
  /** 备注 */
  remark?: string
}

/** 赠送点数DTO */
export interface GrantPointsDTO {
  /** 团队ID */
  teamId: number
  /** 点数 */
  points: number
  /** 有效天数 */
  validDays?: number
  /** 赠送分类 */
  grantCategory: string
  /** 赠送原因 */
  grantReason?: string
  /** 备注 */
  remark?: string
}

/** 赠送资源DTO */
export interface GrantResourceDTO {
  /** 团队ID */
  teamId: number
  /** 扩容包ID */
  packId: number
  /** 数量 */
  quantity?: number
  /** 赠送分类 */
  grantCategory: string
  /** 赠送原因 */
  grantReason?: string
  /** 备注 */
  remark?: string
}

/** 赠送权益DTO */
export interface GrantEntitlementDTO {
  /** 团队ID */
  teamId: number
  /** 功能编码 */
  featureCode: string
  /** 配额数量 */
  quotaAmount: number
  /** 过期天数 */
  expireDays?: number
  /** 赠送分类 */
  grantCategory: string
  /** 赠送原因 */
  grantReason?: string
  /** 备注 */
  remark?: string
}

/** 批量赠送DTO */
export interface BatchGrantDTO {
  /** 团队ID列表 */
  teamIds: number[]
  /** 赠送类型 */
  grantType: string
  /** 商品ID（订阅/扩容包类型需要） */
  productId?: number
  /** 数量（点数/配额需要） */
  quantity?: number
  /** 有效天数 */
  validDays?: number
  /** 赠送分类 */
  grantCategory: string
  /** 赠送原因 */
  grantReason?: string
  /** 备注 */
  remark?: string
}

/** 赠送结果VO */
export interface GrantResultVO {
  /** 赠送ID */
  grantId: number
  /** 赠送单号 */
  grantNo: string
  /** 是否成功 */
  success: boolean
}

/** 批量赠送结果VO */
export interface BatchGrantResultVO {
  /** 总数 */
  total: number
  /** 成功数 */
  successCount: number
  /** 失败数 */
  failedCount: number
  /** 赠送单号列表 */
  grantNos: string[]
}

/** 撤销赠送DTO */
export interface RevokeGrantDTO {
  /** 撤销原因 */
  reason: string
}

// ==================== 统计相关 ====================

/** 计划分布VO */
export interface PlanDistributionVO {
  /** 计划编码 */
  planCode: string
  /** 计划名称 */
  planName: string
  /** 数量 */
  count: number
  /** 百分比 */
  percentage: number
}

/** 统计概览VO */
export interface StatisticsOverviewVO {
  /** 总订阅数 */
  totalSubscriptions: number
  /** 活跃订阅数 */
  activeSubscriptions: number
  /** 今日新增订阅 */
  todayNewSubscriptions: number
  /** 本月收入 */
  monthlyRevenue: number
  /** 本月订单数 */
  monthlyOrders: number
  /** 总点数消耗 */
  totalPointsUsed: number
  /** 计划分布 */
  planDistribution: PlanDistributionVO[]
}

/** 统计查询参数 */
export interface StatisticsParams {
  /** 开始日期 */
  startDate: string
  /** 结束日期 */
  endDate: string
  /** 统计粒度: day/week/month */
  granularity?: 'day' | 'week' | 'month'
}

// ==================== API响应类型 ====================

/** 计划列表响应 */
export type PlanListResponse = ApiResult<PageData<PlanVO>>
/** 计划详情响应 */
export type PlanDetailResponse = ApiResult<PlanDetailVO>
/** 创建计划响应 */
export type CreatePlanResponse = ApiResult<number>
/** 计划功能列表响应 */
export type PlanFeatureListResponse = ApiResult<PlanFeatureVO[]>

/** 功能列表响应 */
export type FeatureListResponse = ApiResult<PageData<FeatureVO>>
/** 功能详情响应 */
export type FeatureDetailResponse = ApiResult<FeatureDetailVO>
/** 创建功能响应 */
export type CreateFeatureResponse = ApiResult<number>
/** 功能简单列表响应 */
export type FeatureSimpleListResponse = ApiResult<FeatureSimpleVO[]>

/** 订阅列表响应 */
export type SubscriptionListResponse = ApiResult<PageData<SubscriptionVO>>
/** 订阅详情响应 */
export type SubscriptionDetailResponse = ApiResult<SubscriptionDetailVO>
/** 创建订阅响应 */
export type CreateSubscriptionResponse = ApiResult<number>

/** 订单列表响应 */
export type OrderListResponse = ApiResult<PageData<AdminOrderVO>>
/** 订单详情响应 */
export type OrderDetailResponse = ApiResult<AdminOrderDetailVO>
/** 支付记录列表响应 */
export type PaymentRecordListResponse = ApiResult<PaymentRecordVO[]>

/** 点数账户列表响应 */
export type PointsAccountListResponse = ApiResult<PageData<PointsAccountVO>>
/** 点数账户详情响应 */
export type PointsAccountDetailResponse = ApiResult<PointsAccountDetailVO>
/** 点数交易列表响应 */
export type PointsTransactionListResponse = ApiResult<PageData<AdminTransactionVO>>

/** 扩容包列表响应 */
export type ResourcePackListResponse = ApiResult<PageData<AdminPackVO>>
/** 扩容包详情响应 */
export type ResourcePackDetailResponse = ApiResult<AdminPackDetailVO>
/** 创建扩容包响应 */
export type CreateResourcePackResponse = ApiResult<number>
/** 扩容包分配记录响应 */
export type PackAllocationListResponse = ApiResult<PageData<PackAllocationVO>>

/** 赠送记录列表响应 */
export type GrantRecordListResponse = ApiResult<PageData<GrantRecordVO>>
/** 赠送记录详情响应 */
export type GrantRecordDetailResponse = ApiResult<GrantRecordDetailVO>
/** 赠送结果响应 */
export type GrantResultResponse = ApiResult<GrantResultVO>
/** 批量赠送结果响应 */
export type BatchGrantResultResponse = ApiResult<BatchGrantResultVO>

/** 统计概览响应 */
export type StatisticsOverviewResponse = ApiResult<StatisticsOverviewVO>
