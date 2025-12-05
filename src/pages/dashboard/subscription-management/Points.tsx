import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { PointsAccountDatatable, type PointsFilters } from '@/components/subscription/PointsAccountDatatable'
import { PointsAccountDetailSheet } from '@/components/subscription/PointsAccountDetailSheet'
import { AdjustPointsDialog } from '@/components/subscription/AdjustPointsDialog'
import { PointsTransactionsSheet } from '@/components/subscription/PointsTransactionsSheet'

import { getPointsAccountList } from '@/services/subscription'
import type { PointsAccountVO, PointsAccountListParams } from '@/types/subscription.types'

export default function Points() {
  const [accounts, setAccounts] = useState<PointsAccountVO[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<PointsFilters>({
    teamId: '',
  })

  // 对话框/Sheet状态
  const [selectedAccount, setSelectedAccount] = useState<PointsAccountVO | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [adjustAccount, setAdjustAccount] = useState<PointsAccountVO | null>(null)
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [transactionsAccount, setTransactionsAccount] = useState<PointsAccountVO | null>(null)
  const [transactionsSheetOpen, setTransactionsSheetOpen] = useState(false)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const params: PointsAccountListParams = {
        page: 1,
        size: 100,
        ...(filters.teamId && { teamId: parseInt(filters.teamId) }),
      }

      const response = await getPointsAccountList(params)
      if (response.code === 'SUCCESS') {
        const records = response.data?.records || []
        setAccounts(records)
        // 如果当前有选中的账户，同步更新其数据
        setSelectedAccount(prev => {
          if (prev) {
            const updatedAccount = records.find(a => a.teamId === prev.teamId)
            return updatedAccount || prev
          }
          return prev
        })
      } else {
        toast.error(response.message || '获取点数账户列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch points accounts:', error)
      toast.error('获取点数账户列表失败')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleRowClick = (account: PointsAccountVO) => {
    setSelectedAccount(account)
    setDetailSheetOpen(true)
  }

  const handleViewDetail = (account: PointsAccountVO) => {
    setSelectedAccount(account)
    setDetailSheetOpen(true)
  }

  const handleAdjust = (account: PointsAccountVO) => {
    setAdjustAccount(account)
    setAdjustDialogOpen(true)
  }

  const handleViewTransactions = (account: PointsAccountVO) => {
    setTransactionsAccount(account)
    setTransactionsSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">点数管理</h1>
          <p className="text-muted-foreground">管理团队点数账户，查看余额和交易记录</p>
        </div>
      </div>

      <div className="rounded-xl bg-card">
        <PointsAccountDatatable
          data={accounts}
          loading={loading}
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={fetchAccounts}
          onRowClick={handleRowClick}
          onViewDetail={handleViewDetail}
          onAdjust={handleAdjust}
          onViewTransactions={handleViewTransactions}
        />
      </div>

      <PointsAccountDetailSheet
        account={selectedAccount}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        onRefresh={fetchAccounts}
      />

      <AdjustPointsDialog
        account={adjustAccount}
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        onSuccess={fetchAccounts}
      />

      <PointsTransactionsSheet
        account={transactionsAccount}
        open={transactionsSheetOpen}
        onOpenChange={setTransactionsSheetOpen}
      />
    </div>
  )
}
