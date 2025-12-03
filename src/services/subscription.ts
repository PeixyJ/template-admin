import { api } from './api'
import type { ApiResult } from '@/types/auth.types'
import type {
  // Plan types
  PlanListParams,
  PlanListResponse,
  PlanDetailResponse,
  CreatePlanDTO,
  UpdatePlanDTO,
  CreatePlanResponse,
  PlanFeatureListResponse,
  ConfigurePlanFeaturesDTO,
  // Feature types
  FeatureListParams,
  FeatureListResponse,
  FeatureDetailResponse,
  CreateFeatureDTO,
  UpdateFeatureDTO,
  CreateFeatureResponse,
  FeatureSimpleListResponse,
  // Subscription types
  SubscriptionListParams,
  SubscriptionListResponse,
  SubscriptionDetailResponse,
  AdminCreateSubscriptionDTO,
  AdminUpdateSubscriptionDTO,
  CancelSubscriptionDTO,
  ExtendSubscriptionDTO,
  CreateSubscriptionResponse,
  // Order types
  OrderListParams,
  OrderListResponse,
  OrderDetailResponse,
  PaymentRecordListResponse,
  RefundOrderDTO,
  ConfirmPaymentDTO,
  // Points types
  PointsAccountListParams,
  PointsAccountListResponse,
  PointsAccountDetailResponse,
  PointsTransactionListParams,
  PointsTransactionListResponse,
  AdjustPointsDTO,
  BatchAdjustPointsDTO,
  SetPointsExpiryDTO,
  // Resource pack types
  ResourcePackListParams,
  ResourcePackListResponse,
  ResourcePackDetailResponse,
  CreatePackDTO,
  UpdatePackDTO,
  CreateResourcePackResponse,
  PackAllocationListResponse,
  AllocatePackDTO,
  RevokePackDTO,
  // Grant types
  GrantRecordListParams,
  GrantRecordListResponse,
  GrantRecordDetailResponse,
  GrantSubscriptionDTO,
  GrantPointsDTO,
  GrantResourceDTO,
  GrantEntitlementDTO,
  BatchGrantDTO,
  RevokeGrantDTO,
  GrantResultResponse,
  BatchGrantResultResponse,
  // Statistics types
  StatisticsParams,
  StatisticsOverviewResponse,
} from '@/types/subscription.types'

// ==================== 计划管理 ====================
const PLAN_PREFIX = '/v1/admin/plan'

/** 分页查询计划列表 */
export function getPlanList(params: PlanListParams) {
  return api.get<PlanListResponse>(PLAN_PREFIX, { params })
}

/** 获取计划详情 */
export function getPlanDetail(id: number) {
  return api.get<PlanDetailResponse>(`${PLAN_PREFIX}/${id}`)
}

/** 创建计划 */
export function createPlan(data: CreatePlanDTO) {
  return api.post<CreatePlanResponse>(PLAN_PREFIX, data)
}

/** 更新计划 */
export function updatePlan(id: number, data: UpdatePlanDTO) {
  return api.put<ApiResult>(`${PLAN_PREFIX}/${id}`, data)
}

/** 删除计划 */
export function deletePlan(id: number) {
  return api.delete<ApiResult>(`${PLAN_PREFIX}/${id}`)
}

/** 更新计划状态 */
export function updatePlanStatus(id: number, status: boolean) {
  return api.put<ApiResult>(`${PLAN_PREFIX}/${id}/status`, { status })
}

/** 获取计划功能列表 */
export function getPlanFeatures(planId: number) {
  return api.get<PlanFeatureListResponse>(`${PLAN_PREFIX}/${planId}/features`)
}

/** 配置计划功能 */
export function configurePlanFeatures(planId: number, data: ConfigurePlanFeaturesDTO) {
  return api.put<ApiResult>(`${PLAN_PREFIX}/${planId}/features`, data)
}

// ==================== 功能管理 ====================
const FEATURE_PREFIX = '/v1/admin/feature'

/** 分页查询功能列表 */
export function getFeatureList(params: FeatureListParams) {
  return api.get<FeatureListResponse>(FEATURE_PREFIX, { params })
}

/** 获取功能详情 */
export function getFeatureDetail(id: number) {
  return api.get<FeatureDetailResponse>(`${FEATURE_PREFIX}/${id}`)
}

/** 创建功能 */
export function createFeature(data: CreateFeatureDTO) {
  return api.post<CreateFeatureResponse>(FEATURE_PREFIX, data)
}

/** 更新功能 */
export function updateFeature(id: number, data: UpdateFeatureDTO) {
  return api.put<ApiResult>(`${FEATURE_PREFIX}/${id}`, data)
}

/** 删除功能 */
export function deleteFeature(id: number) {
  return api.delete<ApiResult>(`${FEATURE_PREFIX}/${id}`)
}

/** 更新功能状态 */
export function updateFeatureStatus(id: number, status: boolean) {
  return api.put<ApiResult>(`${FEATURE_PREFIX}/${id}/status`, { status })
}

/** 获取所有功能（下拉列表用） */
export function getAllFeatures() {
  return api.get<FeatureSimpleListResponse>(`${FEATURE_PREFIX}/all`)
}

// ==================== 订阅管理 ====================
const SUBSCRIPTION_PREFIX = '/v1/admin/subscription'

/** 分页查询订阅列表 */
export function getSubscriptionList(params: SubscriptionListParams) {
  return api.get<SubscriptionListResponse>(SUBSCRIPTION_PREFIX, { params })
}

/** 获取订阅详情 */
export function getSubscriptionDetail(id: number) {
  return api.get<SubscriptionDetailResponse>(`${SUBSCRIPTION_PREFIX}/${id}`)
}

/** 管理员创建订阅（赠送） */
export function adminCreateSubscription(data: AdminCreateSubscriptionDTO) {
  return api.post<CreateSubscriptionResponse>(SUBSCRIPTION_PREFIX, data)
}

/** 管理员更新订阅 */
export function adminUpdateSubscription(id: number, data: AdminUpdateSubscriptionDTO) {
  return api.put<ApiResult>(`${SUBSCRIPTION_PREFIX}/${id}`, data)
}

/** 取消订阅 */
export function cancelSubscription(id: number, data?: CancelSubscriptionDTO) {
  return api.post<ApiResult>(`${SUBSCRIPTION_PREFIX}/${id}/cancel`, data)
}

/** 暂停订阅 */
export function pauseSubscription(id: number) {
  return api.post<ApiResult>(`${SUBSCRIPTION_PREFIX}/${id}/pause`)
}

/** 恢复订阅 */
export function resumeSubscription(id: number) {
  return api.post<ApiResult>(`${SUBSCRIPTION_PREFIX}/${id}/resume`)
}

/** 延长订阅有效期 */
export function extendSubscription(id: number, data: ExtendSubscriptionDTO) {
  return api.post<ApiResult>(`${SUBSCRIPTION_PREFIX}/${id}/extend`, data)
}

/** 获取用户的订阅历史 */
export function getUserSubscriptionHistory(userId: number, params: { page: number; size: number }) {
  return api.get<SubscriptionListResponse>(`${SUBSCRIPTION_PREFIX}/user/${userId}/history`, { params })
}

// ==================== 订单管理 ====================
const ORDER_PREFIX = '/v1/admin/order'

/** 分页查询订单列表 */
export function getOrderList(params: OrderListParams) {
  return api.get<OrderListResponse>(ORDER_PREFIX, { params })
}

/** 获取订单详情 */
export function getOrderDetail(id: number) {
  return api.get<OrderDetailResponse>(`${ORDER_PREFIX}/${id}`)
}

/** 取消订单 */
export function cancelOrder(id: number) {
  return api.post<ApiResult>(`${ORDER_PREFIX}/${id}/cancel`)
}

/** 退款 */
export function refundOrder(id: number, data: RefundOrderDTO) {
  return api.post<ApiResult>(`${ORDER_PREFIX}/${id}/refund`, data)
}

/** 获取订单支付记录 */
export function getOrderPayments(orderId: number) {
  return api.get<PaymentRecordListResponse>(`${ORDER_PREFIX}/${orderId}/payments`)
}

/** 手动确认支付 */
export function confirmPayment(orderId: number, data: ConfirmPaymentDTO) {
  return api.post<ApiResult>(`${ORDER_PREFIX}/${orderId}/confirm-payment`, data)
}

/** 导出订单 */
export function exportOrders(params: OrderListParams) {
  return api.get<Blob>(`${ORDER_PREFIX}/export`, {
    params,
    responseType: 'blob',
  })
}

// ==================== 点数管理 ====================
const POINTS_PREFIX = '/v1/admin/points'

/** 分页查询团队点数列表 */
export function getPointsAccountList(params: PointsAccountListParams) {
  return api.get<PointsAccountListResponse>(POINTS_PREFIX, { params })
}

/** 获取团队点数详情 */
export function getPointsAccountDetail(teamId: number) {
  return api.get<PointsAccountDetailResponse>(`${POINTS_PREFIX}/team/${teamId}`)
}

/** 获取点数变动记录 */
export function getPointsTransactionList(params: PointsTransactionListParams) {
  return api.get<PointsTransactionListResponse>(`${POINTS_PREFIX}/transactions`, { params })
}

/** 调整团队点数 */
export function adjustPoints(data: AdjustPointsDTO) {
  return api.post<ApiResult>(`${POINTS_PREFIX}/adjust`, data)
}

/** 批量调整团队点数 */
export function batchAdjustPoints(data: BatchAdjustPointsDTO) {
  return api.post<ApiResult>(`${POINTS_PREFIX}/batch-adjust`, data)
}

/** 设置点数过期时间 */
export function setPointsExpiry(teamId: number, data: SetPointsExpiryDTO) {
  return api.post<ApiResult>(`${POINTS_PREFIX}/team/${teamId}/expiry`, data)
}

// ==================== 资源扩容包管理 ====================
const RESOURCE_PREFIX = '/v1/admin/resource'

/** 分页查询扩容包列表 */
export function getResourcePackList(params: ResourcePackListParams) {
  return api.get<ResourcePackListResponse>(RESOURCE_PREFIX, { params })
}

/** 获取扩容包详情 */
export function getResourcePackDetail(id: number) {
  return api.get<ResourcePackDetailResponse>(`${RESOURCE_PREFIX}/${id}`)
}

/** 创建扩容包 */
export function createResourcePack(data: CreatePackDTO) {
  return api.post<CreateResourcePackResponse>(RESOURCE_PREFIX, data)
}

/** 更新扩容包 */
export function updateResourcePack(id: number, data: UpdatePackDTO) {
  return api.put<ApiResult>(`${RESOURCE_PREFIX}/${id}`, data)
}

/** 删除扩容包 */
export function deleteResourcePack(id: number) {
  return api.delete<ApiResult>(`${RESOURCE_PREFIX}/${id}`)
}

/** 更新扩容包状态 */
export function updateResourcePackStatus(id: number, status: boolean) {
  return api.put<ApiResult>(`${RESOURCE_PREFIX}/${id}/status`, { status })
}

/** 获取扩容包分配记录 */
export function getPackAllocations(packId: number, params: { page: number; size: number }) {
  return api.get<PackAllocationListResponse>(`${RESOURCE_PREFIX}/${packId}/allocations`, { params })
}

/** 分配扩容包给团队 */
export function allocateResourcePack(packId: number, data: AllocatePackDTO) {
  return api.post<ApiResult>(`${RESOURCE_PREFIX}/${packId}/allocate`, data)
}

/** 回收扩容包 */
export function revokeResourcePack(packId: number, data: RevokePackDTO) {
  return api.post<ApiResult>(`${RESOURCE_PREFIX}/${packId}/revoke`, data)
}

// ==================== 赠送管理 ====================
const GRANT_PREFIX = '/v1/admin/grant'

/** 分页查询赠送记录 */
export function getGrantRecordList(params: GrantRecordListParams) {
  return api.get<GrantRecordListResponse>(GRANT_PREFIX, { params })
}

/** 获取赠送详情 */
export function getGrantRecordDetail(id: number) {
  return api.get<GrantRecordDetailResponse>(`${GRANT_PREFIX}/${id}`)
}

/** 赠送订阅 */
export function grantSubscription(data: GrantSubscriptionDTO) {
  return api.post<GrantResultResponse>(`${GRANT_PREFIX}/subscription`, data)
}

/** 赠送点数 */
export function grantPoints(data: GrantPointsDTO) {
  return api.post<GrantResultResponse>(`${GRANT_PREFIX}/points`, data)
}

/** 赠送资源 */
export function grantResource(data: GrantResourceDTO) {
  return api.post<GrantResultResponse>(`${GRANT_PREFIX}/resource`, data)
}

/** 赠送权益 */
export function grantEntitlement(data: GrantEntitlementDTO) {
  return api.post<GrantResultResponse>(`${GRANT_PREFIX}/entitlement`, data)
}

/** 批量赠送 */
export function batchGrant(data: BatchGrantDTO) {
  return api.post<BatchGrantResultResponse>(`${GRANT_PREFIX}/batch`, data)
}

/** 撤销赠送 */
export function revokeGrant(id: number, data: RevokeGrantDTO) {
  return api.post<ApiResult>(`${GRANT_PREFIX}/${id}/revoke`, data)
}

// ==================== 统计报表 ====================
const STATISTICS_PREFIX = '/v1/admin/statistics'

/** 获取概览统计数据 */
export function getStatisticsOverview() {
  return api.get<StatisticsOverviewResponse>(`${STATISTICS_PREFIX}/overview`)
}

/** 获取订阅统计 */
export function getSubscriptionStatistics(params: StatisticsParams) {
  return api.get(`${STATISTICS_PREFIX}/subscription`, { params })
}

/** 获取订单统计 */
export function getOrderStatistics(params: StatisticsParams) {
  return api.get(`${STATISTICS_PREFIX}/order`, { params })
}

/** 获取收入统计 */
export function getRevenueStatistics(params: StatisticsParams) {
  return api.get(`${STATISTICS_PREFIX}/revenue`, { params })
}

/** 获取点数消耗统计 */
export function getPointsStatistics(params: StatisticsParams) {
  return api.get(`${STATISTICS_PREFIX}/points`, { params })
}

/** 获取资源使用统计 */
export function getResourceStatistics(params: StatisticsParams) {
  return api.get(`${STATISTICS_PREFIX}/resource`, { params })
}

/** 获取用户增长统计 */
export function getUserGrowthStatistics(params: StatisticsParams) {
  return api.get(`${STATISTICS_PREFIX}/user-growth`, { params })
}

/** 获取计划分布统计 */
export function getPlanDistribution() {
  return api.get(`${STATISTICS_PREFIX}/plan-distribution`)
}

/** 获取功能使用排行 */
export function getFeatureRanking(params?: { limit?: number }) {
  return api.get(`${STATISTICS_PREFIX}/feature-ranking`, { params })
}

/** 导出统计报表 */
export function exportStatistics(params: StatisticsParams & { type: string }) {
  return api.get<Blob>(`${STATISTICS_PREFIX}/export`, {
    params,
    responseType: 'blob',
  })
}
