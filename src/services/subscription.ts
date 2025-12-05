import { api } from './api'
import type {
  // Plan
  PlanListParams,
  PlanListResponse,
  PlanDetailResponse,
  PlanFeaturesResponse,
  CreatePlanDTO,
  UpdatePlanDTO,
  ConfigurePlanFeaturesDTO,
  // Feature
  FeatureListParams,
  FeatureListResponse,
  FeatureDetailResponse,
  FeatureSimpleListResponse,
  CreateFeatureDTO,
  UpdateFeatureDTO,
  // Subscription
  SubscriptionListParams,
  SubscriptionListResponse,
  SubscriptionDetailResponse,
  AdminGrantSubscriptionDTO,
  AdminUpdateSubscriptionDTO,
  ExtendSubscriptionDTO,
  // Points
  PointsAccountListParams,
  PointsAccountListResponse,
  PointsAccountDetailResponse,
  TransactionListParams,
  TransactionListResponse,
  AdjustPointsDTO,
  AdjustPointsResponse,
  BatchAdjustPointsDTO,
  BatchAdjustPointsResponse,
  SetPointsExpiryDTO,
  FreezePointsDTO,
  FreezePointsResponse,
  // Order
  OrderListParams,
  OrderListResponse,
  OrderDetailResponse,
  PaymentRecordsResponse,
  RefundOrderDTO,
  ConfirmPaymentDTO,
  // ResourcePack
  PackListParams,
  PackListResponse,
  PackDetailResponse,
  PackAllocationListResponse,
  CreatePackDTO,
  UpdatePackDTO,
  AllocatePackDTO,
  RevokePackDTO,
  // Grant
  GrantListParams,
  GrantListResponse,
  GrantDetailResponse,
  GrantResponse,
  GrantSubscriptionDTO,
  GrantPointsDTO,
  GrantResourceDTO,
  BatchGrantDTO,
} from '@/types/subscription.types'
import type { ApiResult } from '@/types/auth.types'

const BASE_URL = '/v1/admin'

// ============ 计划管理 ============

/** 分页查询计划列表 */
export async function getPlanList(params: PlanListParams): Promise<PlanListResponse> {
  const response = await api.get(`${BASE_URL}/plans`, { params })
  return response.data
}

/** 获取计划详情 */
export async function getPlanDetail(planId: number): Promise<PlanDetailResponse> {
  const response = await api.get(`${BASE_URL}/plans/${planId}`)
  return response.data
}

/** 创建计划 */
export async function createPlan(data: CreatePlanDTO): Promise<ApiResult<number>> {
  const response = await api.post(`${BASE_URL}/plans`, data)
  return response.data
}

/** 更新计划 */
export async function updatePlan(planId: number, data: UpdatePlanDTO): Promise<ApiResult<void>> {
  const response = await api.put(`${BASE_URL}/plans/${planId}`, data)
  return response.data
}

/** 删除计划 */
export async function deletePlan(planId: number): Promise<ApiResult<void>> {
  const response = await api.delete(`${BASE_URL}/plans/${planId}`)
  return response.data
}

/** 更新计划状态 */
export async function updatePlanStatus(planId: number, status: boolean): Promise<ApiResult<void>> {
  const response = await api.put(`${BASE_URL}/plans/${planId}/status`, null, { params: { status } })
  return response.data
}

/** 获取计划关联的功能列表 */
export async function getPlanFeatures(planId: number): Promise<PlanFeaturesResponse> {
  const response = await api.get(`${BASE_URL}/plans/${planId}/features`)
  return response.data
}

/** 配置计划的功能 */
export async function configurePlanFeatures(planId: number, data: ConfigurePlanFeaturesDTO): Promise<ApiResult<void>> {
  const response = await api.put(`${BASE_URL}/plans/${planId}/features`, data)
  return response.data
}

// ============ 功能管理 ============

/** 分页查询功能列表 */
export async function getFeatureList(params: FeatureListParams): Promise<FeatureListResponse> {
  const response = await api.get(`${BASE_URL}/features`, { params })
  return response.data
}

/** 获取功能详情 */
export async function getFeatureDetail(featureId: number): Promise<FeatureDetailResponse> {
  const response = await api.get(`${BASE_URL}/features/${featureId}`)
  return response.data
}

/** 创建功能 */
export async function createFeature(data: CreateFeatureDTO): Promise<ApiResult<number>> {
  const response = await api.post(`${BASE_URL}/features`, data)
  return response.data
}

/** 更新功能 */
export async function updateFeature(featureId: number, data: UpdateFeatureDTO): Promise<ApiResult<void>> {
  const response = await api.put(`${BASE_URL}/features/${featureId}`, data)
  return response.data
}

/** 删除功能 */
export async function deleteFeature(featureId: number): Promise<ApiResult<void>> {
  const response = await api.delete(`${BASE_URL}/features/${featureId}`)
  return response.data
}

/** 更新功能状态 */
export async function updateFeatureStatus(featureId: number, status: boolean): Promise<ApiResult<void>> {
  const response = await api.put(`${BASE_URL}/features/${featureId}/status`, null, { params: { status } })
  return response.data
}

/** 获取所有功能（下拉列表用） */
export async function getAllFeatures(): Promise<FeatureSimpleListResponse> {
  const response = await api.get(`${BASE_URL}/features/all`)
  return response.data
}

// ============ 订阅管理 ============

/** 分页查询订阅列表 */
export async function getSubscriptionList(params: SubscriptionListParams): Promise<SubscriptionListResponse> {
  const response = await api.get(`${BASE_URL}/subscriptions`, { params })
  return response.data
}

/** 获取订阅详情 */
export async function getSubscriptionDetail(subscriptionId: number): Promise<SubscriptionDetailResponse> {
  const response = await api.get(`${BASE_URL}/subscriptions/${subscriptionId}`)
  return response.data
}

/** 管理员赠送订阅 */
export async function adminGrantSubscription(data: AdminGrantSubscriptionDTO): Promise<ApiResult<number>> {
  const response = await api.post(`${BASE_URL}/subscriptions/grant`, data)
  return response.data
}

/** 更新订阅 */
export async function updateSubscription(subscriptionId: number, data: AdminUpdateSubscriptionDTO): Promise<ApiResult<void>> {
  const response = await api.put(`${BASE_URL}/subscriptions/${subscriptionId}`, data)
  return response.data
}

/** 取消订阅 */
export async function cancelSubscription(subscriptionId: number, reason?: string): Promise<ApiResult<void>> {
  const response = await api.post(`${BASE_URL}/subscriptions/${subscriptionId}/cancel`, null, { params: { reason } })
  return response.data
}

/** 暂停订阅 */
export async function pauseSubscription(subscriptionId: number): Promise<ApiResult<void>> {
  const response = await api.post(`${BASE_URL}/subscriptions/${subscriptionId}/pause`)
  return response.data
}

/** 恢复订阅 */
export async function resumeSubscription(subscriptionId: number): Promise<ApiResult<void>> {
  const response = await api.post(`${BASE_URL}/subscriptions/${subscriptionId}/resume`)
  return response.data
}

/** 延长订阅有效期 */
export async function extendSubscription(subscriptionId: number, data: ExtendSubscriptionDTO): Promise<ApiResult<void>> {
  const response = await api.post(`${BASE_URL}/subscriptions/${subscriptionId}/extend`, data)
  return response.data
}

// ============ 点数管理 ============

/** 分页查询团队点数列表 */
export async function getPointsAccountList(params: PointsAccountListParams): Promise<PointsAccountListResponse> {
  const response = await api.get(`${BASE_URL}/points/accounts`, { params })
  return response.data
}

/** 获取团队点数详情 */
export async function getPointsAccountDetail(teamId: number): Promise<PointsAccountDetailResponse> {
  const response = await api.get(`${BASE_URL}/points/team/${teamId}`)
  return response.data
}

/** 获取点数变动记录 */
export async function getTransactionList(params: TransactionListParams): Promise<TransactionListResponse> {
  const response = await api.get(`${BASE_URL}/points/transactions`, { params })
  return response.data
}

/** 调整团队点数 */
export async function adjustPoints(data: AdjustPointsDTO): Promise<AdjustPointsResponse> {
  const response = await api.post(`${BASE_URL}/points/adjust`, data)
  return response.data
}

/** 批量调整团队点数 */
export async function batchAdjustPoints(data: BatchAdjustPointsDTO): Promise<BatchAdjustPointsResponse> {
  const response = await api.post(`${BASE_URL}/points/batch-adjust`, data)
  return response.data
}

/** 设置点数过期时间（旧API，保留兼容） */
export async function setPointsExpiry(teamId: number, data: SetPointsExpiryDTO): Promise<ApiResult<void>> {
  const response = await api.post(`${BASE_URL}/points/team/${teamId}/expiry`, data)
  return response.data
}

/** 设置批次过期时间，空字符串表示永久有效 */
export async function setBatchExpiry(batchId: number, expireTime?: string): Promise<ApiResult<void>> {
  const response = await api.put(
    `${BASE_URL}/points/batches/${batchId}/expire`,
    null,
    expireTime ? { params: { expireTime } } : undefined
  )
  return response.data
}

/** 冻结点数 */
export async function freezePoints(data: FreezePointsDTO): Promise<FreezePointsResponse> {
  const response = await api.post(`${BASE_URL}/points/freeze`, data)
  return response.data
}

/** 解冻点数 */
export async function unfreezePoints(data: FreezePointsDTO): Promise<FreezePointsResponse> {
  const response = await api.post(`${BASE_URL}/points/unfreeze`, data)
  return response.data
}

// ============ 订单管理 ============

/** 分页查询订单列表 */
export async function getOrderList(params: OrderListParams): Promise<OrderListResponse> {
  const response = await api.get(`${BASE_URL}/orders`, { params })
  return response.data
}

/** 获取订单详情 */
export async function getOrderDetail(orderId: number): Promise<OrderDetailResponse> {
  const response = await api.get(`${BASE_URL}/orders/${orderId}`)
  return response.data
}

/** 取消订单 */
export async function cancelOrder(orderId: number): Promise<ApiResult<void>> {
  const response = await api.post(`${BASE_URL}/orders/${orderId}/cancel`)
  return response.data
}

/** 退款 */
export async function refundOrder(orderId: number, data: RefundOrderDTO): Promise<ApiResult<void>> {
  const response = await api.post(`${BASE_URL}/orders/${orderId}/refund`, data)
  return response.data
}

/** 获取订单支付记录 */
export async function getOrderPayments(orderId: number): Promise<PaymentRecordsResponse> {
  const response = await api.get(`${BASE_URL}/orders/${orderId}/payments`)
  return response.data
}

/** 手动确认支付 */
export async function confirmPayment(orderId: number, data: ConfirmPaymentDTO): Promise<ApiResult<void>> {
  const response = await api.post(`${BASE_URL}/orders/${orderId}/confirm-payment`, data)
  return response.data
}

/** 导出订单 */
export async function exportOrders(params: OrderListParams): Promise<Blob> {
  const response = await api.get(`${BASE_URL}/orders/export`, {
    params,
    responseType: 'blob',
  })
  return response.data
}

// ============ 扩容包管理 ============

/** 分页查询扩容包列表 */
export async function getPackList(params: PackListParams): Promise<PackListResponse> {
  const response = await api.get(`${BASE_URL}/resource-packs`, { params })
  return response.data
}

/** 获取扩容包详情 */
export async function getPackDetail(packId: number): Promise<PackDetailResponse> {
  const response = await api.get(`${BASE_URL}/resource-packs/${packId}`)
  return response.data
}

/** 创建扩容包 */
export async function createPack(data: CreatePackDTO): Promise<ApiResult<number>> {
  const response = await api.post(`${BASE_URL}/resource-packs`, data)
  return response.data
}

/** 更新扩容包 */
export async function updatePack(packId: number, data: UpdatePackDTO): Promise<ApiResult<void>> {
  const response = await api.put(`${BASE_URL}/resource-packs/${packId}`, data)
  return response.data
}

/** 删除扩容包 */
export async function deletePack(packId: number): Promise<ApiResult<void>> {
  const response = await api.delete(`${BASE_URL}/resource-packs/${packId}`)
  return response.data
}

/** 更新扩容包状态 */
export async function updatePackStatus(packId: number, status: boolean): Promise<ApiResult<void>> {
  const response = await api.put(`${BASE_URL}/resource-packs/${packId}/status`, null, { params: { status } })
  return response.data
}

/** 获取扩容包分配记录 */
export async function getPackAllocations(packId: number, params: { page: number; size: number }): Promise<PackAllocationListResponse> {
  const response = await api.get(`${BASE_URL}/resource-packs/${packId}/allocations`, { params })
  return response.data
}

/** 分配扩容包给团队 */
export async function allocatePack(packId: number, data: AllocatePackDTO): Promise<ApiResult<void>> {
  const response = await api.post(`${BASE_URL}/resource-packs/${packId}/allocate`, data)
  return response.data
}

/** 回收扩容包 */
export async function revokePack(packId: number, data: RevokePackDTO): Promise<ApiResult<void>> {
  const response = await api.post(`${BASE_URL}/resource-packs/${packId}/revoke`, data)
  return response.data
}

// ============ 赠送记录管理 ============

/** 分页查询赠送记录 */
export async function getGrantList(params: GrantListParams): Promise<GrantListResponse> {
  const response = await api.get(`${BASE_URL}/grant`, { params })
  return response.data
}

/** 获取赠送详情 */
export async function getGrantDetail(grantId: string): Promise<GrantDetailResponse> {
  const response = await api.get(`${BASE_URL}/grant/${grantId}`)
  return response.data
}

/** 赠送订阅 */
export async function grantSubscription(data: GrantSubscriptionDTO): Promise<GrantResponse> {
  const response = await api.post(`${BASE_URL}/grant/subscription`, data)
  return response.data
}

/** 赠送点数 */
export async function grantPoints(data: GrantPointsDTO): Promise<GrantResponse> {
  const response = await api.post(`${BASE_URL}/grant/points`, data)
  return response.data
}

/** 赠送资源 */
export async function grantResource(data: GrantResourceDTO): Promise<GrantResponse> {
  const response = await api.post(`${BASE_URL}/grant/resource`, data)
  return response.data
}


/** 批量赠送 */
export async function batchGrant(data: BatchGrantDTO): Promise<ApiResult<void>> {
  const response = await api.post(`${BASE_URL}/grant/batch`, data)
  return response.data
}

/** 撤销赠送 */
export async function revokeGrant(grantId: string, reason?: string): Promise<ApiResult<void>> {
  const response = await api.post(`${BASE_URL}/grant/${grantId}/revoke`, null, { params: { reason } })
  return response.data
}
