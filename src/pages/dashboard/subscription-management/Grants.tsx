import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { GrantRecordDatatable } from '@/components/datatable/GrantRecordDatatable'
import {
  getGrantRecordList,
  revokeGrant,
} from '@/services/subscription'
import type { GrantRecordVO, GrantRecordListParams } from '@/types/subscription.types'

export default function Grants() {
  const [records, setRecords] = useState<GrantRecordVO[]>([])
  const [loading, setLoading] = useState(false)

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
    // TODO: Open detail sheet
    toast.info(`查看赠送记录: ${record.grantNo}`)
  }

  const handleRevoke = async (record: GrantRecordVO) => {
    try {
      const response = await revokeGrant(record.id, { reason: '管理员撤销' })
      if (response.data.code === 'SUCCESS') {
        toast.success(`赠送记录 "${record.grantNo}" 已撤销`)
        fetchRecords()
      } else {
        toast.error(response.data.message || '撤销赠送失败')
      }
    } catch (error) {
      console.error('Failed to revoke grant:', error)
      toast.error('撤销赠送失败')
    }
  }

  const handleCreate = () => {
    // TODO: Open create dialog for different grant types
    toast.info('新建赠送')
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
    </div>
  )
}
