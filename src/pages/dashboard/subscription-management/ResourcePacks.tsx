import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { ResourcePackDatatable } from '@/components/datatable/ResourcePackDatatable'
import {
  getResourcePackList,
  deleteResourcePack,
  updateResourcePackStatus,
} from '@/services/subscription'
import type { AdminPackVO, ResourcePackListParams } from '@/types/subscription.types'

export default function ResourcePacks() {
  const [packs, setPacks] = useState<AdminPackVO[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPacks = useCallback(async () => {
    setLoading(true)
    try {
      const params: ResourcePackListParams = {
        page: 1,
        size: 100,
      }
      const response = await getResourcePackList(params)
      if (response.data.code === 'SUCCESS') {
        setPacks(response.data.data?.records || [])
      } else {
        toast.error(response.data.message || '获取扩容包列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch resource packs:', error)
      toast.error('获取扩容包列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPacks()
  }, [fetchPacks])

  const handleView = (pack: AdminPackVO) => {
    // TODO: Open detail sheet
    toast.info(`查看扩容包: ${pack.packName}`)
  }

  const handleEdit = (pack: AdminPackVO) => {
    // TODO: Open edit dialog
    toast.info(`编辑扩容包: ${pack.packName}`)
  }

  const handleAllocate = (pack: AdminPackVO) => {
    // TODO: Open allocate dialog
    toast.info(`分配扩容包: ${pack.packName}`)
  }

  const handleDelete = async (pack: AdminPackVO) => {
    try {
      const response = await deleteResourcePack(pack.id)
      if (response.data.code === 'SUCCESS') {
        toast.success(`扩容包 "${pack.packName}" 已删除`)
        fetchPacks()
      } else {
        toast.error(response.data.message || '删除扩容包失败')
      }
    } catch (error) {
      console.error('Failed to delete resource pack:', error)
      toast.error('删除扩容包失败')
    }
  }

  const handleToggleStatus = async (pack: AdminPackVO) => {
    const newStatus = pack.status === 1 ? false : true
    const action = newStatus ? '启用' : '禁用'

    try {
      const response = await updateResourcePackStatus(pack.id, newStatus)
      if (response.data.code === 'SUCCESS') {
        toast.success(`扩容包 "${pack.packName}" 已${action}`)
        fetchPacks()
      } else {
        toast.error(response.data.message || `${action}扩容包失败`)
      }
    } catch (error) {
      console.error('Failed to update resource pack status:', error)
      toast.error(`${action}扩容包失败`)
    }
  }

  const handleCreate = () => {
    // TODO: Open create dialog
    toast.info('创建扩容包')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card">
        <ResourcePackDatatable
          data={packs}
          loading={loading}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onEdit={handleEdit}
          onView={handleView}
          onAllocate={handleAllocate}
          onRefresh={fetchPacks}
          onCreateClick={handleCreate}
        />
      </div>
    </div>
  )
}
