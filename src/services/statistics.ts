import { api } from './api'
import type { DashboardResponse } from '@/types/statistics.types'

const BASE_URL = '/v1/admin/statistics'

/** 获取仪表盘汇总数据 */
export async function getDashboard(): Promise<DashboardResponse> {
  const response = await api.get(`${BASE_URL}/dashboard`)
  return response.data
}
