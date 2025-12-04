import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FeatureDatatable, type FeatureFilters } from '@/components/subscription/FeatureDatatable'
import { FeatureDetailSheet } from '@/components/subscription/FeatureDetailSheet'
import { CreateFeatureDialog } from '@/components/subscription/CreateFeatureDialog'
import { EditFeatureDialog } from '@/components/subscription/EditFeatureDialog'

import {
  getFeatureList,
  createFeature,
  deleteFeature,
  updateFeatureStatus,
} from '@/services/subscription'
import type { FeatureVO, FeatureListParams, CreateFeatureDTO, UpdateFeatureDTO } from '@/types/subscription.types'

export default function Features() {
  const [features, setFeatures] = useState<FeatureVO[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<FeatureFilters>({
    keyword: '',
    featureType: '',
  })
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editFeature, setEditFeature] = useState<FeatureVO | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const fetchFeatures = useCallback(async () => {
    setLoading(true)
    try {
      const params: FeatureListParams = {
        page: 1,
        size: 100,
        ...(filters.keyword && { name: filters.keyword }),
        ...(filters.featureType && { featureType: filters.featureType }),
      }
      const response = await getFeatureList(params)
      if (response.code === 'SUCCESS') {
        setFeatures(response.data?.records || [])
      } else {
        toast.error(response.message || '获取功能列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch features:', error)
      toast.error('获取功能列表失败')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  const handleRowClick = (feature: FeatureVO) => {
    setSelectedFeatureId(feature.id)
    setDetailSheetOpen(true)
  }

  const handleEdit = (feature: FeatureVO) => {
    setEditFeature(feature)
    setEditDialogOpen(true)
  }

  const handleDelete = async (feature: FeatureVO) => {
    if (!confirm(`确定要删除功能 "${feature.featureName}" 吗？此操作不可撤销。`)) {
      return
    }

    try {
      const response = await deleteFeature(feature.id)
      if (response.code === 'SUCCESS') {
        toast.success(`功能 "${feature.featureName}" 已删除`)
        fetchFeatures()
      } else {
        toast.error(response.message || '删除功能失败')
      }
    } catch (error) {
      console.error('Failed to delete feature:', error)
      toast.error('删除功能失败')
    }
  }

  const handleStatusChange = async (feature: FeatureVO, status: boolean) => {
    try {
      const response = await updateFeatureStatus(feature.id, status)
      if (response.code === 'SUCCESS') {
        toast.success(`功能 "${feature.featureName}" 已${status ? '启用' : '禁用'}`)
        fetchFeatures()
      } else {
        toast.error(response.message || '更新状态失败')
      }
    } catch (error) {
      console.error('Failed to update feature status:', error)
      toast.error('更新状态失败')
    }
  }

  const handleCreate = async (data: CreateFeatureDTO) => {
    try {
      const response = await createFeature(data)
      if (response.code === 'SUCCESS') {
        toast.success('功能创建成功')
        fetchFeatures()
      } else {
        toast.error(response.message || '创建功能失败')
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Failed to create feature:', error)
      throw error
    }
  }

  const handleEditSubmit = async (_data: UpdateFeatureDTO) => {
    // Edit is handled in the dialog component
    fetchFeatures()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">功能管理</h1>
          <p className="text-muted-foreground">管理系统功能，配置功能类型和消耗</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusIcon className="mr-2 size-4" />
          创建功能
        </Button>
      </div>

      <div className="rounded-xl bg-card">
        <FeatureDatatable
          data={features}
          loading={loading}
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={fetchFeatures}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </div>

      <FeatureDetailSheet
        featureId={selectedFeatureId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

      <CreateFeatureDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
      />

      <EditFeatureDialog
        feature={editFeature}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}
