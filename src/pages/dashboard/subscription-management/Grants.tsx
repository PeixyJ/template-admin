import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { GrantRecordDatatable } from '@/components/subscription/GrantRecordDatatable'
import { GrantRecordDetailSheet } from '@/components/subscription/GrantRecordDetailSheet'
import { CreateGrantDialog } from '@/components/subscription/CreateGrantDialog'
import { RevokeGrantDialog } from '@/components/subscription/RevokeGrantDialog'

import { getGrantList } from '@/services/subscription'
import type { GrantRecordVO, GrantListParams } from '@/types/subscription.types'

export default function Grants() {
  const [grants, setGrants] = useState<GrantRecordVO[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedGrantId, setSelectedGrantId] = useState<string | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [revokeRecord, setRevokeRecord] = useState<GrantRecordVO | null>(null)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)

  const fetchGrants = useCallback(async () => {
    setLoading(true)
    try {
      const params: GrantListParams = {
        page: 1,
        size: 100,
      }
      const response = await getGrantList(params)
      if (response.code === 'SUCCESS') {
        setGrants(response.data?.records || [])
      } else {
        toast.error(response.message || '获取赠送记录失败')
      }
    } catch (error) {
      console.error('Failed to fetch grants:', error)
      toast.error('获取赠送记录失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGrants()
  }, [fetchGrants])

  const handleRowClick = (record: GrantRecordVO) => {
    setSelectedGrantId(record.grantId)
    setDetailSheetOpen(true)
  }

  const handleViewDetail = (record: GrantRecordVO) => {
    setSelectedGrantId(record.grantId)
    setDetailSheetOpen(true)
  }

  const handleRevoke = (record: GrantRecordVO) => {
    setRevokeRecord(record)
    setRevokeDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">赠送记录</h1>
          <p className="text-muted-foreground">管理订阅、点数和资源的赠送记录</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusIcon className="mr-2 size-4" />
          创建赠送
        </Button>
      </div>

      <div className="rounded-xl bg-card">
        <GrantRecordDatatable
          data={grants}
          loading={loading}
          onRowClick={handleRowClick}
          onViewDetail={handleViewDetail}
          onRevoke={handleRevoke}
        />
      </div>

      <GrantRecordDetailSheet
        grantId={selectedGrantId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

      <CreateGrantDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchGrants}
      />

      <RevokeGrantDialog
        record={revokeRecord}
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        onSuccess={fetchGrants}
      />
    </div>
  )
}
