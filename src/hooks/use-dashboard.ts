import { useState, useEffect, useCallback } from 'react'
import type { DashboardVO, PointsRankingVO } from '@/types'
import { getDashboardStatistics, getPointsAvailableRanking } from '@/services'

interface UseDashboardReturn {
  data: DashboardVO | null
  ranking: PointsRankingVO | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardVO | null>(null)
  const [ranking, setRanking] = useState<PointsRankingVO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [dashboardResult, rankingResult] = await Promise.all([
        getDashboardStatistics(),
        getPointsAvailableRanking(10),
      ])
      setData(dashboardResult)
      setRanking(rankingResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, ranking, loading, error, refetch: fetchData }
}
