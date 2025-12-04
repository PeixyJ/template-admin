import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { PointsAccountDatatable } from '@/components/subscription/PointsAccountDatatable'
import { PointsAccountDetailSheet } from '@/components/subscription/PointsAccountDetailSheet'
import { AdjustPointsDialog } from '@/components/subscription/AdjustPointsDialog'
import { SetPointsExpiryDialog } from '@/components/subscription/SetPointsExpiryDialog'
import { PointsTransactionsSheet } from '@/components/subscription/PointsTransactionsSheet'

import { getPointsAccountList } from '@/services/subscription'
import type { PointsAccountVO, PointsAccountListParams } from '@/types/subscription.types'

export default function Points() {
  const [accounts, setAccounts] = useState<PointsAccountVO[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [adjustAccount, setAdjustAccount] = useState<PointsAccountVO | null>(null)
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [expiryAccount, setExpiryAccount] = useState<PointsAccountVO | null>(null)
  const [expiryDialogOpen, setExpiryDialogOpen] = useState(false)
  const [transactionsAccount, setTransactionsAccount] = useState<PointsAccountVO | null>(null)
  const [transactionsSheetOpen, setTransactionsSheetOpen] = useState(false)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const params: PointsAccountListParams = {
        page: 1,
        size: 100,
      }
      const response = await getPointsAccountList(params)
      if (response.code === 'SUCCESS') {
        setAccounts(response.data?.records || [])
      } else {
        toast.error(response.message || '获取点数账户列表失败')
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

  const handleRowClick = (account: PointsAccountVO) => {
    setSelectedTeamId(account.teamId)
    setDetailSheetOpen(true)
  }

  const handleViewDetail = (account: PointsAccountVO) => {
    setSelectedTeamId(account.teamId)
    setDetailSheetOpen(true)
  }

  const handleAdjust = (account: PointsAccountVO) => {
    setAdjustAccount(account)
    setAdjustDialogOpen(true)
  }

  const handleSetExpiry = (account: PointsAccountVO) => {
    setExpiryAccount(account)
    setExpiryDialogOpen(true)
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
          <p className="text-muted-foreground">管理团队点数账户，查看交易记录</p>
        </div>
      </div>

      <div className="rounded-xl bg-card">
        <PointsAccountDatatable
          data={accounts}
          loading={loading}
          onRowClick={handleRowClick}
          onViewDetail={handleViewDetail}
          onAdjust={handleAdjust}
          onSetExpiry={handleSetExpiry}
          onViewTransactions={handleViewTransactions}
        />
      </div>

      <PointsAccountDetailSheet
        teamId={selectedTeamId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

      <AdjustPointsDialog
        account={adjustAccount}
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        onSuccess={fetchAccounts}
      />

      <SetPointsExpiryDialog
        account={expiryAccount}
        open={expiryDialogOpen}
        onOpenChange={setExpiryDialogOpen}
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
