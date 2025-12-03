import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { PlanDatatable } from '@/components/datatable/PlanDatatable'
import {
  CreatePlanDialog,
  EditPlanDialog,
  PlanDetailSheet,
  ConfigureFeaturesDialog,
} from '@/components/plan'
import {
  getPlanList,
  deletePlan,
  updatePlanStatus,
} from '@/services/subscription'
import type { PlanVO, PlanListParams } from '@/types/subscription.types'

export default function Plans() {
  const [plans, setPlans] = useState<PlanVO[]>([])
  const [loading, setLoading] = useState(false)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [configFeaturesDialogOpen, setConfigFeaturesDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanVO | null>(null)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const params: PlanListParams = {
        page: 1,
        size: 100,
      }
      const response = await getPlanList(params)
      if (response.data.code === 'SUCCESS') {
        setPlans(response.data.data?.records || [])
      } else {
        toast.error(response.data.message || '获取计划列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
      toast.error('获取计划列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const handleView = (plan: PlanVO) => {
    setSelectedPlan(plan)
    setDetailSheetOpen(true)
  }

  const handleEdit = (plan: PlanVO) => {
    setSelectedPlan(plan)
    setEditDialogOpen(true)
  }

  const handleConfigureFeatures = (plan: PlanVO) => {
    setSelectedPlan(plan)
    setConfigFeaturesDialogOpen(true)
  }

  const handleDelete = async (plan: PlanVO) => {
    try {
      const response = await deletePlan(plan.id)
      if (response.data.code === 'SUCCESS') {
        toast.success(`计划 "${plan.planName}" 已删除`)
        fetchPlans()
      } else {
        toast.error(response.data.message || '删除计划失败')
      }
    } catch (error) {
      console.error('Failed to delete plan:', error)
      toast.error('删除计划失败')
    }
  }

  const handleToggleStatus = async (plan: PlanVO) => {
    const newStatus = !plan.status
    const action = newStatus ? '启用' : '禁用'

    try {
      const response = await updatePlanStatus(plan.id, newStatus)
      if (response.data.code === 'SUCCESS') {
        toast.success(`计划 "${plan.planName}" 已${action}`)
        fetchPlans()
      } else {
        toast.error(response.data.message || `${action}计划失败`)
      }
    } catch (error) {
      console.error('Failed to update plan status:', error)
      toast.error(`${action}计划失败`)
    }
  }

  const handleCreate = () => {
    setCreateDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card">
        <PlanDatatable
          data={plans}
          loading={loading}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onEdit={handleEdit}
          onView={handleView}
          onConfigureFeatures={handleConfigureFeatures}
          onRefresh={fetchPlans}
          onCreateClick={handleCreate}
        />
      </div>

      {/* Create Plan Dialog */}
      <CreatePlanDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchPlans}
      />

      {/* Edit Plan Dialog */}
      <EditPlanDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        plan={selectedPlan}
        onSuccess={fetchPlans}
      />

      {/* Plan Detail Sheet */}
      <PlanDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        plan={selectedPlan}
      />

      {/* Configure Features Dialog */}
      <ConfigureFeaturesDialog
        open={configFeaturesDialogOpen}
        onOpenChange={setConfigFeaturesDialogOpen}
        plan={selectedPlan}
        onSuccess={fetchPlans}
      />
    </div>
  )
}
