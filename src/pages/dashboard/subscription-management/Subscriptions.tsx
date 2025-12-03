import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { SubscriptionDatatable } from '@/components/datatable/SubscriptionDatatable'
import {
  SubscriptionDetailSheet,
  EditSubscriptionDialog,
  ExtendSubscriptionDialog,
} from '@/components/subscription'
import {
  getSubscriptionList,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} from '@/services/subscription'
import type { SubscriptionVO, SubscriptionListParams } from '@/types/subscription.types'

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionVO[]>([])
  const [loading, setLoading] = useState(false)

  // Detail sheet state
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionVO | null>(null)

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [subscriptionToEdit, setSubscriptionToEdit] = useState<SubscriptionVO | null>(null)

  // Extend dialog state
  const [extendDialogOpen, setExtendDialogOpen] = useState(false)
  const [subscriptionToExtend, setSubscriptionToExtend] = useState<SubscriptionVO | null>(null)

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true)
    try {
      const params: SubscriptionListParams = {
        page: 1,
        size: 100,
      }
      const response = await getSubscriptionList(params)
      if (response.data.code === 'SUCCESS') {
        setSubscriptions(response.data.data?.records || [])
      } else {
        toast.error(response.data.message || '获取订阅列表失败')
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

  const handleView = (subscription: SubscriptionVO) => {
    setSelectedSubscription(subscription)
    setDetailSheetOpen(true)
  }

  const handleEdit = (subscription: SubscriptionVO) => {
    setSubscriptionToEdit(subscription)
    setEditDialogOpen(true)
  }

  const handlePause = async (subscription: SubscriptionVO) => {
    try {
      const response = await pauseSubscription(subscription.id)
      if (response.data.code === 'SUCCESS') {
        toast.success(`订阅 "${subscription.subscriptionNo}" 已暂停`)
        fetchSubscriptions()
      } else {
        toast.error(response.data.message || '暂停订阅失败')
      }
    } catch (error) {
      console.error('Failed to pause subscription:', error)
      toast.error('暂停订阅失败')
    }
  }

  const handleResume = async (subscription: SubscriptionVO) => {
    try {
      const response = await resumeSubscription(subscription.id)
      if (response.data.code === 'SUCCESS') {
        toast.success(`订阅 "${subscription.subscriptionNo}" 已恢复`)
        fetchSubscriptions()
      } else {
        toast.error(response.data.message || '恢复订阅失败')
      }
    } catch (error) {
      console.error('Failed to resume subscription:', error)
      toast.error('恢复订阅失败')
    }
  }

  const handleCancel = async (subscription: SubscriptionVO) => {
    try {
      const response = await cancelSubscription(subscription.id)
      if (response.data.code === 'SUCCESS') {
        toast.success(`订阅 "${subscription.subscriptionNo}" 已取消`)
        fetchSubscriptions()
      } else {
        toast.error(response.data.message || '取消订阅失败')
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      toast.error('取消订阅失败')
    }
  }

  const handleExtend = (subscription: SubscriptionVO) => {
    setSubscriptionToExtend(subscription)
    setExtendDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card">
        <SubscriptionDatatable
          data={subscriptions}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onPause={handlePause}
          onResume={handleResume}
          onCancel={handleCancel}
          onExtend={handleExtend}
          onRefresh={fetchSubscriptions}
        />
      </div>

      {/* Detail Sheet */}
      <SubscriptionDetailSheet
        subscription={selectedSubscription}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

      {/* Edit Dialog */}
      <EditSubscriptionDialog
        subscription={subscriptionToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchSubscriptions}
      />

      {/* Extend Dialog */}
      <ExtendSubscriptionDialog
        subscription={subscriptionToExtend}
        open={extendDialogOpen}
        onOpenChange={setExtendDialogOpen}
        onSuccess={fetchSubscriptions}
      />
    </div>
  )
}
