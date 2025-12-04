import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ResourcePackDatatable } from '@/components/subscription/ResourcePackDatatable'
import { ResourcePackDetailSheet } from '@/components/subscription/ResourcePackDetailSheet'
import { CreateResourcePackDialog } from '@/components/subscription/CreateResourcePackDialog'
import { AllocateResourcePackDialog } from '@/components/subscription/AllocateResourcePackDialog'

import {
  getPackList,
  createPack,
  deletePack,
  updatePackStatus,
} from '@/services/subscription'
import type { AdminPackVO, PackListParams, CreatePackDTO } from '@/types/subscription.types'

export default function ResourcePacks() {
  const [packs, setPacks] = useState<AdminPackVO[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [allocatePack, setAllocatePack] = useState<AdminPackVO | null>(null)
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false)

  const fetchPacks = useCallback(async () => {
    setLoading(true)
    try {
      const params: PackListParams = {
        page: 1,
        size: 100,
      }
      const response = await getPackList(params)
      if (response.code === 'SUCCESS') {
        setPacks(response.data?.records || [])
      } else {
        toast.error(response.message || '获取扩容包列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch packs:', error)
      toast.error('获取扩容包列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPacks()
  }, [fetchPacks])

  const handleRowClick = (pack: AdminPackVO) => {
    setSelectedPackId(pack.id)
    setDetailSheetOpen(true)
  }

  const handleEdit = (pack: AdminPackVO) => {
    toast.info(`编辑扩容包: ${pack.packName}`)
  }

  const handleDelete = async (pack: AdminPackVO) => {
    if (!confirm(`确定要删除扩容包 "${pack.packName}" 吗？此操作不可撤销。`)) {
      return
    }

    try {
      const response = await deletePack(pack.id)
      if (response.code === 'SUCCESS') {
        toast.success(`扩容包 "${pack.packName}" 已删除`)
        fetchPacks()
      } else {
        toast.error(response.message || '删除扩容包失败')
      }
    } catch (error) {
      console.error('Failed to delete pack:', error)
      toast.error('删除扩容包失败')
    }
  }

  const handleStatusChange = async (pack: AdminPackVO, status: boolean) => {
    try {
      const response = await updatePackStatus(pack.id, status)
      if (response.code === 'SUCCESS') {
        toast.success(`扩容包 "${pack.packName}" 已${status ? '启用' : '禁用'}`)
        fetchPacks()
      } else {
        toast.error(response.message || '更新状态失败')
      }
    } catch (error) {
      console.error('Failed to update pack status:', error)
      toast.error('更新状态失败')
    }
  }

  const handleAllocate = (pack: AdminPackVO) => {
    setAllocatePack(pack)
    setAllocateDialogOpen(true)
  }

  const handleCreate = async (data: CreatePackDTO) => {
    try {
      const response = await createPack(data)
      if (response.code === 'SUCCESS') {
        toast.success('扩容包创建成功')
        fetchPacks()
      } else {
        toast.error(response.message || '创建扩容包失败')
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Failed to create pack:', error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">扩容包管理</h1>
          <p className="text-muted-foreground">管理资源扩容包，配置价格和有效期</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusIcon className="mr-2 size-4" />
          创建扩容包
        </Button>
      </div>

      <div className="rounded-xl bg-card">
        <ResourcePackDatatable
          data={packs}
          loading={loading}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onAllocate={handleAllocate}
        />
      </div>

      <ResourcePackDetailSheet
        packId={selectedPackId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

      <CreateResourcePackDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
      />

      <AllocateResourcePackDialog
        pack={allocatePack}
        open={allocateDialogOpen}
        onOpenChange={setAllocateDialogOpen}
        onSuccess={fetchPacks}
      />
    </div>
  )
}
