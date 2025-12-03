import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { PointsAccountDatatable } from '@/components/datatable/PointsAccountDatatable'
import {
  getPointsAccountList,
} from '@/services/subscription'
import type { PointsAccountVO, PointsAccountListParams } from '@/types/subscription.types'

export default function Points() {
  const [accounts, setAccounts] = useState<PointsAccountVO[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const params: PointsAccountListParams = {
        page: 1,
        size: 100,
      }
      const response = await getPointsAccountList(params)
      if (response.data.code === 'SUCCESS') {
        setAccounts(response.data.data?.records || [])
      } else {
        toast.error(response.data.message || '获取点数账户列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch points accounts:', error)
      toast.error('获取点数账户列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleView = (account: PointsAccountVO) => {
    // TODO: Open detail sheet
    toast.info(`查看点数账户: ${account.teamName}`)
  }

  const handleAdjust = (account: PointsAccountVO) => {
    // TODO: Open adjust points dialog
    toast.info(`调整点数: ${account.teamName}`)
  }

  const handleViewTransactions = (account: PointsAccountVO) => {
    // TODO: Navigate to transactions page or open sheet
    toast.info(`查看交易记录: ${account.teamName}`)
  }

  const handleSetExpiry = (account: PointsAccountVO) => {
    // TODO: Open set expiry dialog
    toast.info(`设置过期时间: ${account.teamName}`)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card">
        <PointsAccountDatatable
          data={accounts}
          loading={loading}
          onView={handleView}
          onAdjust={handleAdjust}
          onViewTransactions={handleViewTransactions}
          onSetExpiry={handleSetExpiry}
          onRefresh={fetchAccounts}
        />
      </div>
    </div>
  )
}
