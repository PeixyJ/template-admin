import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { FeatureDatatable } from '@/components/datatable/FeatureDatatable'
import {
  CreateFeatureDialog,
  EditFeatureDialog,
  FeatureDetailSheet,
} from '@/components/feature'
import {
  getFeatureList,
  deleteFeature,
  updateFeatureStatus,
} from '@/services/subscription'
import type { FeatureVO, FeatureListParams } from '@/types/subscription.types'

export default function Features() {
  const [features, setFeatures] = useState<FeatureVO[]>([])
  const [loading, setLoading] = useState(false)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<FeatureVO | null>(null)

  const fetchFeatures = useCallback(async () => {
    setLoading(true)
    try {
      const params: FeatureListParams = {
        page: 1,
        size: 100,
      }
      const response = await getFeatureList(params)
      if (response.data.code === 'SUCCESS') {
        setFeatures(response.data.data?.records || [])
      } else {
        toast.error(response.data.message || '获取功能列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch features:', error)
      toast.error('获取功能列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  const handleView = (feature: FeatureVO) => {
    setSelectedFeature(feature)
    setDetailSheetOpen(true)
  }

  const handleEdit = (feature: FeatureVO) => {
    setSelectedFeature(feature)
    setEditDialogOpen(true)
  }

  const handleDelete = async (feature: FeatureVO) => {
    try {
      const response = await deleteFeature(feature.id)
      if (response.data.code === 'SUCCESS') {
        toast.success(`功能 "${feature.featureName}" 已删除`)
        fetchFeatures()
      } else {
        toast.error(response.data.message || '删除功能失败')
      }
    } catch (error) {
      console.error('Failed to delete feature:', error)
      toast.error('删除功能失败')
    }
  }

  const handleToggleStatus = async (feature: FeatureVO) => {
    const newStatus = !feature.status
    const action = newStatus ? '启用' : '禁用'

    try {
      const response = await updateFeatureStatus(feature.id, newStatus)
      if (response.data.code === 'SUCCESS') {
        toast.success(`功能 "${feature.featureName}" 已${action}`)
        fetchFeatures()
      } else {
        toast.error(response.data.message || `${action}功能失败`)
      }
    } catch (error) {
      console.error('Failed to update feature status:', error)
      toast.error(`${action}功能失败`)
    }
  }

  const handleCreate = () => {
    setCreateDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card">
        <FeatureDatatable
          data={features}
          loading={loading}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onEdit={handleEdit}
          onView={handleView}
          onRefresh={fetchFeatures}
          onCreateClick={handleCreate}
        />
      </div>

      {/* Create Dialog */}
      <CreateFeatureDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchFeatures}
      />

      {/* Edit Dialog */}
      <EditFeatureDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        feature={selectedFeature}
        onSuccess={fetchFeatures}
      />

      {/* Detail Sheet */}
      <FeatureDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        feature={selectedFeature}
      />
    </div>
  )
}
