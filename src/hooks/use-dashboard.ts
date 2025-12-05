import { useState, useEffect, useCallback } from 'react'
import { getDashboard } from '@/services/statistics'
import type { DashboardVO } from '@/types/statistics.types'

interface UseDashboardReturn {
  data: DashboardVO | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardVO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getDashboard()
      if (response.code === 'SUCCESS') {
        setData(response.data)
      } else {
        setError(response.message || '获取数据失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
