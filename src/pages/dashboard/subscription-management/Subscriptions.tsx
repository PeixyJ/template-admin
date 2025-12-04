import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { SubscriptionDatatable } from '@/components/subscription/SubscriptionDatatable'
import { SubscriptionDetailSheet } from '@/components/subscription/SubscriptionDetailSheet'
import { EditSubscriptionDialog } from '@/components/subscription/EditSubscriptionDialog'
import { ExtendSubscriptionDialog } from '@/components/subscription/ExtendSubscriptionDialog'

import {
  getSubscriptionList,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
} from '@/services/subscription'
import type { SubscriptionVO, SubscriptionListParams } from '@/types/subscription.types'

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionVO[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<number | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [editSubscription, setEditSubscription] = useState<SubscriptionVO | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [extendSubscription, setExtendSubscription] = useState<SubscriptionVO | null>(null)
  const [extendDialogOpen, setExtendDialogOpen] = useState(false)

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true)
    try {
      const params: SubscriptionListParams = {
        page: 1,
        size: 100,
      }
      const response = await getSubscriptionList(params)
      if (response.code === 'SUCCESS') {
        setSubscriptions(response.data?.records || [])
      } else {
        toast.error(response.message || '获取订阅列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
      toast.error('获取订阅列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const handleRowClick = (subscription: SubscriptionVO) => {
    setSelectedSubscriptionId(subscription.id)
    setDetailSheetOpen(true)
  }

  const handleEdit = (subscription: SubscriptionVO) => {
    setEditSubscription(subscription)
    setEditDialogOpen(true)
  }

  const handleCancel = async (subscription: SubscriptionVO) => {
    const reason = prompt('请输入取消原因（可选）:')
    if (reason === null) return // User clicked cancel

    try {
      const response = await cancelSubscription(subscription.id, reason || undefined)
      if (response.code === 'SUCCESS') {
        toast.success('订阅已取消')
        fetchSubscriptions()
      } else {
        toast.error(response.message || '取消订阅失败')
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      toast.error('取消订阅失败')
    }
  }

  const handlePause = async (subscription: SubscriptionVO) => {
    if (!confirm(`确定要暂停订阅 "${subscription.subscriptionNo}" 吗？`)) {
      return
    }

    try {
      const response = await pauseSubscription(subscription.id)
      if (response.code === 'SUCCESS') {
        toast.success('订阅已暂停')
        fetchSubscriptions()
      } else {
        toast.error(response.message || '暂停订阅失败')
      }
    } catch (error) {
      console.error('Failed to pause subscription:', error)
      toast.error('暂停订阅失败')
    }
  }

  const handleResume = async (subscription: SubscriptionVO) => {
    if (!confirm(`确定要恢复订阅 "${subscription.subscriptionNo}" 吗？`)) {
      return
    }

    try {
      const response = await resumeSubscription(subscription.id)
      if (response.code === 'SUCCESS') {
        toast.success('订阅已恢复')
        fetchSubscriptions()
      } else {
        toast.error(response.message || '恢复订阅失败')
      }
    } catch (error) {
      console.error('Failed to resume subscription:', error)
      toast.error('恢复订阅失败')
    }
  }

  const handleExtend = (subscription: SubscriptionVO) => {
    setExtendSubscription(subscription)
    setExtendDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">订阅管理</h1>
          <p className="text-muted-foreground">查看和管理用户订阅</p>
        </div>
      </div>

      <div className="rounded-xl bg-card">
        <SubscriptionDatatable
          data={subscriptions}
          loading={loading}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onPause={handlePause}
          onResume={handleResume}
          onExtend={handleExtend}
        />
      </div>

      <SubscriptionDetailSheet
        subscriptionId={selectedSubscriptionId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

      <EditSubscriptionDialog
        subscription={editSubscription}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchSubscriptions}
      />

      <ExtendSubscriptionDialog
        subscription={extendSubscription}
        open={extendDialogOpen}
        onOpenChange={setExtendDialogOpen}
        onSuccess={fetchSubscriptions}
      />
    </div>
  )
}
