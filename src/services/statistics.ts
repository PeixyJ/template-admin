import { api } from './api'

// ==================== 通用类型 ====================

/**
 * 统计查询参数（支持日期范围和粒度）
 */
export interface StatisticsQueryParams {
  startDate?: string
  endDate?: string
  granularity?: 'day' | 'week' | 'month'
}

/**
 * 功能排行查询参数
 */
export interface FeatureRankingQueryParams extends StatisticsQueryParams {
  top: number
}

/**
 * 通用 API 响应结构
 */
export interface ApiResponse<T> {
  code: string
  message: string
  description: string
  data: T
  date: number
  messageId: string | null
}

// ==================== 1. 概览统计 ====================

/**
 * 计划分布项
 */
export interface PlanDistributionItem {
  planCode: string
  planName: string
  count: number
  percentage: number
}

/**
 * 概览统计数据
 */
export interface StatisticsOverviewData {
  /** 总团队数 */
  totalTeams: number
  /** 总用户数 */
  totalUsers: number
  /** 总订单数 */
  totalOrders: number
  /** 总收入 */
  totalRevenue: number
  /** 今日新增团队 */
  todayNewTeams: number
  /** 今日新增用户 */
  todayNewUsers: number
  /** 今日订单数 */
  todayOrders: number
  /** 今日收入 */
  todayRevenue: number
  /** 本周新增团队 */
  weekNewTeams: number
  /** 本月新增团队 */
  monthNewTeams: number
  /** 计划分布 */
  planDistribution: PlanDistributionItem[]
  /** 7日活跃用户 */
  activeUsers7d: number
  /** 7日活跃团队 */
  activeTeams7d: number
  /** 付费团队数 */
  paidTeams: number
  /** 付费转化率 */
  paidConversionRate: number
}

/**
 * 获取概览统计数据
 * GET /v1/admin/statistics/overview
 */
export async function getStatisticsOverview(): Promise<ApiResponse<StatisticsOverviewData>> {
  const response = await api.get<ApiResponse<StatisticsOverviewData>>('/v1/admin/statistics/overview')
  return response.data
}

// ==================== 2. 订阅统计 ====================

/**
 * 订阅统计摘要
 */
export interface SubscriptionSummary {
  /** 总订阅数 */
  totalSubscriptions: number
  /** 活跃订阅数 */
  activeSubscriptions: number
  /** 新增订阅数 */
  newSubscriptions: number
  /** 取消订阅数 */
  cancelledSubscriptions: number
  /** 续订数 */
  renewals: number
  /** 续订率 */
  renewalRate: number
}

/**
 * 订阅趋势数据
 */
export interface SubscriptionTrendItem {
  period: string
  newSubscriptions: number
  cancelledSubscriptions: number
  netGrowth: number
}

/**
 * 订阅状态分布
 */
export interface SubscriptionStatusDistribution {
  status: string
  statusDesc: string
  count: number
  percentage: number
}

/**
 * 订阅统计数据
 */
export interface SubscriptionStatisticsData {
  startDate: string
  endDate: string
  summary: SubscriptionSummary
  trends: SubscriptionTrendItem[]
  statusDistribution: SubscriptionStatusDistribution[]
}

/**
 * 获取订阅统计
 * GET /v1/admin/statistics/subscription
 */
export async function getSubscriptionStatistics(
  params?: StatisticsQueryParams
): Promise<ApiResponse<SubscriptionStatisticsData>> {
  const response = await api.get<ApiResponse<SubscriptionStatisticsData>>(
    '/v1/admin/statistics/subscription',
    { params }
  )
  return response.data
}

// ==================== 3. 订单统计 ====================

/**
 * 订单统计摘要
 */
export interface OrderSummary {
  /** 总订单数 */
  totalOrders: number
  /** 已支付订单数 */
  paidOrders: number
  /** 待支付订单数 */
  pendingOrders: number
  /** 已取消订单数 */
  cancelledOrders: number
  /** 总金额 */
  totalAmount: number
  /** 已支付金额 */
  paidAmount: number
  /** 支付率 */
  paymentRate: number
}

/**
 * 订单趋势数据
 */
export interface OrderTrendItem {
  period: string
  orderCount: number
  paidAmount: number
}

/**
 * 订单状态分布
 */
export interface OrderStatusDistribution {
  status: string
  statusDesc: string
  count: number
  percentage: number
}

/**
 * 订单统计数据
 */
export interface OrderStatisticsData {
  startDate: string
  endDate: string
  summary: OrderSummary
  trends: OrderTrendItem[]
  statusDistribution: OrderStatusDistribution[]
}

/**
 * 获取订单统计
 * GET /v1/admin/statistics/order
 */
export async function getOrderStatistics(
  params?: StatisticsQueryParams
): Promise<ApiResponse<OrderStatisticsData>> {
  const response = await api.get<ApiResponse<OrderStatisticsData>>(
    '/v1/admin/statistics/order',
    { params }
  )
  return response.data
}

// ==================== 4. 收入统计 ====================

/**
 * 收入统计摘要
 */
export interface RevenueSummary {
  /** 总收入 */
  totalRevenue: number
  /** 订单数 */
  orderCount: number
  /** 平均订单金额 */
  avgOrderAmount: number
  /** 环比增长率 */
  momGrowthRate: number
}

/**
 * 收入趋势数据
 */
export interface RevenueTrendItem {
  period: string
  revenue: number
  orderCount: number
}

/**
 * 订单类型分布
 */
export interface RevenueTypeDistribution {
  orderType: string
  orderTypeDesc: string
  revenue: number
  percentage: number
}

/**
 * 支付渠道分布
 */
export interface RevenueChannelDistribution {
  payChannel: string
  payChannelDesc: string
  revenue: number
  percentage: number
}

/**
 * 收入统计数据
 */
export interface RevenueStatisticsData {
  startDate: string
  endDate: string
  summary: RevenueSummary
  trends: RevenueTrendItem[]
  typeDistribution: RevenueTypeDistribution[]
  channelDistribution: RevenueChannelDistribution[]
}

/**
 * 获取收入统计
 * GET /v1/admin/statistics/revenue
 */
export async function getRevenueStatistics(
  params?: StatisticsQueryParams
): Promise<ApiResponse<RevenueStatisticsData>> {
  const response = await api.get<ApiResponse<RevenueStatisticsData>>(
    '/v1/admin/statistics/revenue',
    { params }
  )
  return response.data
}

// ==================== 5. 点数消耗统计 ====================

/**
 * 点数统计摘要
 */
export interface PointsSummary {
  /** 总发放点数 */
  totalIssued: number
  /** 总消耗点数 */
  totalConsumed: number
  /** 总过期点数 */
  totalExpired: number
  /** 当前余额 */
  currentBalance: number
  /** 消耗率 */
  consumeRate: number
}

/**
 * 点数趋势数据
 */
export interface PointsTrendItem {
  period: string
  issued: number
  consumed: number
  netChange: number
}

/**
 * 点数统计数据
 */
export interface PointsStatisticsData {
  startDate: string
  endDate: string
  summary: PointsSummary
  trends: PointsTrendItem[]
}

/**
 * 获取点数消耗统计
 * GET /v1/admin/statistics/points
 */
export async function getPointsStatistics(
  params?: StatisticsQueryParams
): Promise<ApiResponse<PointsStatisticsData>> {
  const response = await api.get<ApiResponse<PointsStatisticsData>>(
    '/v1/admin/statistics/points',
    { params }
  )
  return response.data
}

// ==================== 6. 资源使用统计 ====================

/**
 * 资源类型摘要
 */
export interface ResourceTypeSummary {
  /** 资源类型 */
  resourceType: string
  /** 资源类型描述 */
  resourceTypeDesc: string
  /** 总配额 */
  totalQuota: number
  /** 已使用量 */
  totalUsed: number
  /** 使用率 */
  usageRate: number
  /** 已购买扩容包数 */
  packsPurchased: number
}

/**
 * 资源使用统计数据
 */
export interface ResourceStatisticsData {
  startDate: string
  endDate: string
  typeSummaries: ResourceTypeSummary[]
}

/**
 * 资源统计查询参数（不支持粒度）
 */
export interface ResourceStatisticsQueryParams {
  startDate?: string
  endDate?: string
}

/**
 * 获取资源使用统计
 * GET /v1/admin/statistics/resource
 */
export async function getResourceStatistics(
  params?: ResourceStatisticsQueryParams
): Promise<ApiResponse<ResourceStatisticsData>> {
  const response = await api.get<ApiResponse<ResourceStatisticsData>>(
    '/v1/admin/statistics/resource',
    { params }
  )
  return response.data
}

// ==================== 7. 用户增长统计 ====================

/**
 * 用户增长统计摘要
 */
export interface UserGrowthSummary {
  /** 总用户数 */
  totalUsers: number
  /** 新增用户数 */
  newUsers: number
  /** 总团队数 */
  totalTeams: number
  /** 新增团队数 */
  newTeams: number
  /** 用户增长率 */
  userGrowthRate: number
  /** 团队增长率 */
  teamGrowthRate: number
}

/**
 * 用户增长趋势数据
 */
export interface UserGrowthTrendItem {
  period: string
  newUsers: number
  newTeams: number
  cumulativeUsers: number
  cumulativeTeams: number
}

/**
 * 用户增长统计数据
 */
export interface UserGrowthStatisticsData {
  startDate: string
  endDate: string
  summary: UserGrowthSummary
  trends: UserGrowthTrendItem[]
}

/**
 * 获取用户增长统计
 * GET /v1/admin/statistics/user-growth
 */
export async function getUserGrowthStatistics(
  params?: StatisticsQueryParams
): Promise<ApiResponse<UserGrowthStatisticsData>> {
  const response = await api.get<ApiResponse<UserGrowthStatisticsData>>(
    '/v1/admin/statistics/user-growth',
    { params }
  )
  return response.data
}

// ==================== 8. 计划分布统计 ====================

/**
 * 获取计划分布统计
 * GET /v1/admin/statistics/plan-distribution
 */
export async function getPlanDistributionStatistics(): Promise<ApiResponse<PlanDistributionItem[]>> {
  const response = await api.get<ApiResponse<PlanDistributionItem[]>>(
    '/v1/admin/statistics/plan-distribution'
  )
  return response.data
}

// ==================== 9. 功能使用排行 ====================

/**
 * 功能排行项
 */
export interface FeatureRankingItem {
  /** 排名 */
  rank: number
  /** 功能编码 */
  featureCode: string
  /** 功能名称 */
  featureName: string
  /** 使用次数 */
  usageCount: number
  /** 使用用户数 */
  userCount: number
  /** 消耗点数 */
  pointsConsumed: number
}

/**
 * 功能排行统计数据
 */
export interface FeatureRankingData {
  startDate: string
  endDate: string
  rankings: FeatureRankingItem[]
}

/**
 * 获取功能使用排行
 * GET /v1/admin/statistics/feature-ranking
 */
export async function getFeatureRankingStatistics(
  params: FeatureRankingQueryParams
): Promise<ApiResponse<FeatureRankingData>> {
  const response = await api.get<ApiResponse<FeatureRankingData>>(
    '/v1/admin/statistics/feature-ranking',
    { params }
  )
  return response.data
}

// ==================== 导出报表 ====================

/**
 * 导出统计报表查询参数
 */
export interface ExportStatisticsParams {
  startDate?: string
  endDate?: string
  type?: 'overview' | 'subscription' | 'order' | 'revenue' | 'points' | 'resource' | 'user-growth'
}

/**
 * 导出统计报表
 * GET /v1/admin/statistics/export
 */
export async function exportStatistics(params?: ExportStatisticsParams): Promise<Blob> {
  const response = await api.get('/v1/admin/statistics/export', {
    params,
    responseType: 'blob',
  })
  return response.data
}
