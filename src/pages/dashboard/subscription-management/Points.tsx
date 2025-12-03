import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { AdjustPointsDialog } from '@/components/datatable/AdjustPointsDialog'
import { PointsAccountDatatable } from '@/components/datatable/PointsAccountDatatable'
import { PointsAccountDetailSheet } from '@/components/datatable/PointsAccountDetailSheet'
import { PointsTransactionsSheet } from '@/components/datatable/PointsTransactionsSheet'
import { SetPointsExpiryDialog } from '@/components/datatable/SetPointsExpiryDialog'
import {
  getPointsAccountList,
  adjustPoints,
  setPointsExpiry,
} from '@/services/subscription'
import type { PointsAccountVO, PointsAccountListParams } from '@/types/subscription.types'

export default function Points() {
  const [accounts, setAccounts] = useState<PointsAccountVO[]>([])
  const [loading, setLoading] = useState(false)

  // Detail sheet state
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)

  // Adjust dialog state
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [accountToAdjust, setAccountToAdjust] = useState<PointsAccountVO | null>(null)

  // Transactions sheet state
  const [transactionsSheetOpen, setTransactionsSheetOpen] = useState(false)
  const [accountForTransactions, setAccountForTransactions] = useState<PointsAccountVO | null>(null)

  // Set expiry dialog state
  const [expiryDialogOpen, setExpiryDialogOpen] = useState(false)
  const [accountForExpiry, setAccountForExpiry] = useState<PointsAccountVO | null>(null)

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
    setSelectedTeamId(account.teamId)
    setDetailSheetOpen(true)
  }

  const handleAdjust = (account: PointsAccountVO) => {
    setAccountToAdjust(account)
    setAdjustDialogOpen(true)
  }

  const handleAdjustConfirm = async (
    teamId: number,
    points: number,
    reason: string,
    expireDays?: number
  ) => {
    const response = await adjustPoints({
      teamId,
      points,
      reason,
      expireDays,
    })
    if (response.data.code === 'SUCCESS') {
      toast.success(points > 0 ? '点数增加成功' : '点数扣减成功')
      fetchAccounts()
    } else {
      toast.error(response.data.message || '调整点数失败')
      throw new Error(response.data.message)
    }
  }

  const handleViewTransactions = (account: PointsAccountVO) => {
    setAccountForTransactions(account)
    setTransactionsSheetOpen(true)
  }

  const handleSetExpiry = (account: PointsAccountVO) => {
    setAccountForExpiry(account)
    setExpiryDialogOpen(true)
  }

  const handleSetExpiryConfirm = async (teamId: number, expireDate: string) => {
    const response = await setPointsExpiry(teamId, { expireDate })
    if (response.data.code === 'SUCCESS') {
      toast.success('设置过期时间成功')
      fetchAccounts()
    } else {
      toast.error(response.data.message || '设置过期时间失败')
      throw new Error(response.data.message)
    }
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

      {/* Points Account Detail Sheet */}
      <PointsAccountDetailSheet
        teamId={selectedTeamId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

      {/* Adjust Points Dialog */}
      <AdjustPointsDialog
        account={accountToAdjust}
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        onConfirm={handleAdjustConfirm}
      />

      {/* Points Transactions Sheet */}
      <PointsTransactionsSheet
        account={accountForTransactions}
        open={transactionsSheetOpen}
        onOpenChange={setTransactionsSheetOpen}
      />

      {/* Set Points Expiry Dialog */}
      <SetPointsExpiryDialog
        account={accountForExpiry}
        open={expiryDialogOpen}
        onOpenChange={setExpiryDialogOpen}
        onConfirm={handleSetExpiryConfirm}
      />
    </div>
  )
}
