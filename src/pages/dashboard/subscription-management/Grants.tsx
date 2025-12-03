import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { GrantRecordDatatable } from '@/components/datatable/GrantRecordDatatable'
import { GrantRecordDetailSheet } from '@/components/datatable/GrantRecordDetailSheet'
import { CreateGrantDialog } from '@/components/datatable/CreateGrantDialog'
import { RevokeGrantDialog } from '@/components/datatable/RevokeGrantDialog'
import {
  getGrantRecordList,
  revokeGrant,
  grantSubscription,
  grantPoints,
  grantResource,
  grantEntitlement,
} from '@/services/subscription'
import type {
  GrantRecordVO,
  GrantRecordListParams,
  GrantSubscriptionDTO,
  GrantPointsDTO,
  GrantResourceDTO,
  GrantEntitlementDTO,
} from '@/types/subscription.types'

export default function Grants() {
  const [records, setRecords] = useState<GrantRecordVO[]>([])
  const [loading, setLoading] = useState(false)

  // Detail sheet state
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [selectedGrantId, setSelectedGrantId] = useState<number | null>(null)

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Revoke dialog state
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [grantToRevoke, setGrantToRevoke] = useState<GrantRecordVO | null>(null)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const params: GrantRecordListParams = {
        page: 1,
        size: 100,
      }
      const response = await getGrantRecordList(params)
      if (response.data.code === 'SUCCESS') {
        setRecords(response.data.data?.records || [])
      } else {
        toast.error(response.data.message || '获取赠送记录列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch grant records:', error)
      toast.error('获取赠送记录列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handleView = (record: GrantRecordVO) => {
    setSelectedGrantId(record.id)
    setDetailSheetOpen(true)
  }

  const handleRevoke = async (record: GrantRecordVO) => {
    setGrantToRevoke(record)
    setRevokeDialogOpen(true)
  }

  const handleConfirmRevoke = async (grantId: number, reason: string) => {
    const response = await revokeGrant(grantId, { reason })
    if (response.data.code === 'SUCCESS') {
      toast.success('赠送已撤销')
      fetchRecords()
    } else {
      toast.error(response.data.message || '撤销赠送失败')
      throw new Error(response.data.message)
    }
  }

  const handleCreate = () => {
    setCreateDialogOpen(true)
  }

  const handleGrantSubscription = async (data: GrantSubscriptionDTO) => {
    const response = await grantSubscription(data)
    if (response.data.code === 'SUCCESS') {
      toast.success(`订阅赠送成功，赠送单号: ${response.data.data?.grantNo}`)
      fetchRecords()
    } else {
      toast.error(response.data.message || '赠送订阅失败')
      throw new Error(response.data.message)
    }
  }

  const handleGrantPoints = async (data: GrantPointsDTO) => {
    const response = await grantPoints(data)
    if (response.data.code === 'SUCCESS') {
      toast.success(`点数赠送成功，赠送单号: ${response.data.data?.grantNo}`)
      fetchRecords()
    } else {
      toast.error(response.data.message || '赠送点数失败')
      throw new Error(response.data.message)
    }
  }

  const handleGrantResource = async (data: GrantResourceDTO) => {
    const response = await grantResource(data)
    if (response.data.code === 'SUCCESS') {
      toast.success(`扩容包赠送成功，赠送单号: ${response.data.data?.grantNo}`)
      fetchRecords()
    } else {
      toast.error(response.data.message || '赠送扩容包失败')
      throw new Error(response.data.message)
    }
  }

  const handleGrantEntitlement = async (data: GrantEntitlementDTO) => {
    const response = await grantEntitlement(data)
    if (response.data.code === 'SUCCESS') {
      toast.success(`配额赠送成功，赠送单号: ${response.data.data?.grantNo}`)
      fetchRecords()
    } else {
      toast.error(response.data.message || '赠送配额失败')
      throw new Error(response.data.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card">
        <GrantRecordDatatable
          data={records}
          loading={loading}
          onView={handleView}
          onRevoke={handleRevoke}
          onRefresh={fetchRecords}
          onCreateClick={handleCreate}
        />
      </div>

      {/* Grant Detail Sheet */}
      <GrantRecordDetailSheet
        grantId={selectedGrantId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

      {/* Create Grant Dialog */}
      <CreateGrantDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onGrantSubscription={handleGrantSubscription}
        onGrantPoints={handleGrantPoints}
        onGrantResource={handleGrantResource}
        onGrantEntitlement={handleGrantEntitlement}
      />

      {/* Revoke Grant Dialog */}
      <RevokeGrantDialog
        grant={grantToRevoke}
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        onConfirm={handleConfirmRevoke}
      />
    </div>
  )
}
