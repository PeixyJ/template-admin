import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { ResourcePackDatatable, type ResourcePackFilters } from '@/components/subscription/ResourcePackDatatable'
import { ResourcePackDetailSheet } from '@/components/subscription/ResourcePackDetailSheet'
import { CreateResourcePackDialog } from '@/components/subscription/CreateResourcePackDialog'
import { EditResourcePackDialog } from '@/components/subscription/EditResourcePackDialog'
import { AllocateResourcePackDialog } from '@/components/subscription/AllocateResourcePackDialog'

import {
  getPackList,
  createPack,
  updatePack,
  deletePack,
  updatePackStatus,
} from '@/services/subscription'
import type { AdminPackVO, PackListParams, CreatePackDTO, UpdatePackDTO } from '@/types/subscription.types'

const DEFAULT_PAGE_SIZE = 20

export default function ResourcePacks() {
  const [packs, setPacks] = useState<AdminPackVO[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(DEFAULT_PAGE_SIZE)
  const [filters, setFilters] = useState<ResourcePackFilters>({
    packCode: '',
    packName: '',
    resourceType: '',
    status: '',
  })
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPack, setEditingPack] = useState<AdminPackVO | null>(null)
  const [allocatePack, setAllocatePack] = useState<AdminPackVO | null>(null)
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false)
  const [packToDelete, setPackToDelete] = useState<AdminPackVO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const fetchPacks = useCallback(async () => {
    setLoading(true)
    try {
      const params: PackListParams = {
        page,
        size: pageSize,
        ...(filters.packCode && { packCode: filters.packCode }),
        ...(filters.packName && { packName: filters.packName }),
        ...(filters.resourceType && { resourceType: filters.resourceType }),
        ...(filters.status !== '' && { status: filters.status as boolean }),
      }
      const response = await getPackList(params)
      if (response.code === 'SUCCESS') {
        setPacks(response.data?.records || [])
        setTotal(response.data?.total || 0)
      } else {
        toast.error(response.message || '获取资源包列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch packs:', error)
      toast.error('获取资源包列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters])

  useEffect(() => {
    fetchPacks()
  }, [fetchPacks])

  const handleRowClick = (pack: AdminPackVO) => {
    setSelectedPackId(pack.id)
    setDetailSheetOpen(true)
  }

  const handleEdit = (pack: AdminPackVO) => {
    setEditingPack(pack)
    setEditDialogOpen(true)
  }

  const handleUpdate = async (id: number, data: UpdatePackDTO) => {
    try {
      const response = await updatePack(id, data)
      if (response.code === 'SUCCESS') {
        toast.success('资源包更新成功')
        fetchPacks()
      } else {
        toast.error(response.message || '更新资源包失败')
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Failed to update pack:', error)
      throw error
    }
  }

  const handleDelete = (pack: AdminPackVO) => {
    setPackToDelete(pack)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!packToDelete) return

    try {
      const response = await deletePack(packToDelete.id)
      if (response.code === 'SUCCESS') {
        toast.success(`资源包 "${packToDelete.packName}" 已删除`)
        fetchPacks()
      } else {
        toast.error(response.message || '删除资源包失败')
      }
    } catch (error) {
      console.error('Failed to delete pack:', error)
      toast.error('删除资源包失败')
    } finally {
      setDeleteDialogOpen(false)
      setPackToDelete(null)
    }
  }

  const handleStatusChange = async (pack: AdminPackVO, status: boolean) => {
    try {
      const response = await updatePackStatus(pack.id, status)
      if (response.code === 'SUCCESS') {
        toast.success(`资源包 "${pack.packName}" 已${status ? '启用' : '禁用'}`)
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
        toast.success('资源包创建成功')
        fetchPacks()
      } else {
        toast.error(response.message || '创建资源包失败')
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Failed to create pack:', error)
      throw error
    }
  }

  const handleFiltersChange = (newFilters: ResourcePackFilters) => {
    setFilters(newFilters)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">资源包管理</h1>
          <p className="text-muted-foreground">管理资源包，配置价格和有效期</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusIcon className="mr-2 size-4" />
          创建资源包
        </Button>
      </div>

      <div className="rounded-xl bg-card">
        <ResourcePackDatatable
          data={packs}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onPageChange={handlePageChange}
          onRefresh={fetchPacks}
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

      <EditResourcePackDialog
        pack={editingPack}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdate}
      />

      <AllocateResourcePackDialog
        pack={allocatePack}
        open={allocateDialogOpen}
        onOpenChange={setAllocateDialogOpen}
        onSuccess={fetchPacks}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除此资源包吗？</AlertDialogTitle>
            <AlertDialogDescription>
              您正在删除资源包 "{packToDelete?.packName}"。此操作不可撤销，删除后将无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
