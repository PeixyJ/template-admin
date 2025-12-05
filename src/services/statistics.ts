import type { DashboardVO, PointsRankingVO } from '@/types'
import { api } from './api'

interface ApiResponse<T> {
  code: string
  message: string
  data: T
}

/** 获取仪表盘汇总数据 */
export async function getDashboardStatistics(): Promise<DashboardVO> {
  const response = await api.get<ApiResponse<DashboardVO>>('/v1/admin/statistics/dashboard')
  return response.data.data
}

/** 获取团队可用点数排行榜 */
export async function getPointsAvailableRanking(limit = 10): Promise<PointsRankingVO> {
  const response = await api.get<ApiResponse<PointsRankingVO>>(
    '/v1/admin/statistics/points/ranking/available',
    { params: { limit } }
  )
  return response.data.data
}
