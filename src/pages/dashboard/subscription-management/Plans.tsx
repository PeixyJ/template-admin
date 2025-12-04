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
import { PlanDatatable, type PlanFilters } from '@/components/subscription/PlanDatatable'
import { PlanDetailSheet } from '@/components/subscription/PlanDetailSheet'
import { CreatePlanDialog } from '@/components/subscription/CreatePlanDialog'
import { EditPlanDialog } from '@/components/subscription/EditPlanDialog'
import { ConfigureFeaturesDialog } from '@/components/subscription/ConfigureFeaturesDialog'

import {
  getPlanList,
  getPlanDetail,
  createPlan,
  updatePlan,
  deletePlan,
  updatePlanStatus,
} from '@/services/subscription'
import type { PlanVO, PlanDetailVO, PlanListParams, CreatePlanDTO, UpdatePlanDTO } from '@/types/subscription.types'

export default function Plans() {
  const [plans, setPlans] = useState<PlanVO[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<PlanFilters>({
    keyword: '',
    planType: '',
    status: '',
    isVisible: '',
  })
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanDetailVO | null>(null)
  const [configurePlan, setConfigurePlan] = useState<PlanVO | null>(null)
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<PlanVO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const params: PlanListParams = {
        page: 1,
        size: 100,
        ...(filters.keyword && { keyword: filters.keyword }),
        ...(filters.planType && { planType: filters.planType }),
        ...(filters.status !== '' && { status: filters.status as boolean }),
        ...(filters.isVisible !== '' && { isVisible: filters.isVisible as boolean }),
      }
      const response = await getPlanList(params)
      if (response.code === 'SUCCESS') {
        setPlans(response.data?.records || [])
      } else {
        toast.error(response.message || '获取计划列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
      toast.error('获取计划列表失败')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const handleRowClick = (plan: PlanVO) => {
    setSelectedPlanId(plan.id)
    setDetailSheetOpen(true)
  }

  const handleEdit = async (plan: PlanVO) => {
    try {
      const response = await getPlanDetail(plan.id)
      if (response.code === 'SUCCESS' && response.data) {
        setEditingPlan(response.data)
        setEditDialogOpen(true)
      } else {
        toast.error(response.message || '获取计划详情失败')
      }
    } catch (error) {
      console.error('Failed to fetch plan detail:', error)
      toast.error('获取计划详情失败')
    }
  }

  const handleUpdate = async (id: number, data: UpdatePlanDTO) => {
    try {
      const response = await updatePlan(id, data)
      if (response.code === 'SUCCESS') {
        toast.success('计划更新成功')
        fetchPlans()
      } else {
        toast.error(response.message || '更新计划失败')
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Failed to update plan:', error)
      throw error
    }
  }

  const handleDelete = (plan: PlanVO) => {
    setPlanToDelete(plan)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!planToDelete) return

    try {
      const response = await deletePlan(planToDelete.id)
      if (response.code === 'SUCCESS') {
        toast.success(`计划 "${planToDelete.planName}" 已删除`)
        fetchPlans()
      } else {
        toast.error(response.message || '删除计划失败')
      }
    } catch (error) {
      console.error('Failed to delete plan:', error)
      toast.error('删除计划失败')
    } finally {
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
    }
  }

  const handleStatusChange = async (plan: PlanVO, status: boolean) => {
    try {
      const response = await updatePlanStatus(plan.id, status)
      if (response.code === 'SUCCESS') {
        toast.success(`计划 "${plan.planName}" 已${status ? '启用' : '禁用'}`)
        fetchPlans()
      } else {
        toast.error(response.message || '更新状态失败')
      }
    } catch (error) {
      console.error('Failed to update plan status:', error)
      toast.error('更新状态失败')
    }
  }

  const handleConfigureFeatures = (plan: PlanVO) => {
    setConfigurePlan(plan)
    setConfigureDialogOpen(true)
  }

  const handleCreate = async (data: CreatePlanDTO) => {
    try {
      const response = await createPlan(data)
      if (response.code === 'SUCCESS') {
        toast.success('计划创建成功')
        fetchPlans()
      } else {
        toast.error(response.message || '创建计划失败')
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Failed to create plan:', error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">计划管理</h1>
          <p className="text-muted-foreground">管理订阅计划，配置价格和功能</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusIcon className="mr-2 size-4" />
          创建计划
        </Button>
      </div>

      <div className="rounded-xl bg-card">
        <PlanDatatable
          data={plans}
          loading={loading}
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={fetchPlans}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onConfigureFeatures={handleConfigureFeatures}
        />
      </div>

      <PlanDetailSheet
        planId={selectedPlanId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

      <CreatePlanDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
      />

      <EditPlanDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        plan={editingPlan}
        onSubmit={handleUpdate}
      />

      <ConfigureFeaturesDialog
        plan={configurePlan}
        open={configureDialogOpen}
        onOpenChange={setConfigureDialogOpen}
        onSuccess={() => {
          toast.success('功能配置已保存')
          fetchPlans()
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除此计划吗？</AlertDialogTitle>
            <AlertDialogDescription>
              您正在删除计划 "{planToDelete?.planName}"。此操作不可撤销，删除后将无法恢复。
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
