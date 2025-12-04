import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { GiftIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SubscriptionDatatable } from '@/components/subscription/SubscriptionDatatable'
import { SubscriptionDetailSheet } from '@/components/subscription/SubscriptionDetailSheet'
import { ExtendSubscriptionDialog } from '@/components/subscription/ExtendSubscriptionDialog'
import { GrantSubscriptionDialog } from '@/components/subscription/GrantSubscriptionDialog'
import { CancelSubscriptionDialog } from '@/components/subscription/CancelSubscriptionDialog'

import {
  getSubscriptionList,
  cancelSubscription,
} from '@/services/subscription'
import type { SubscriptionVO, SubscriptionListParams } from '@/types/subscription.types'

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionVO[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<number | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [extendSubscription, setExtendSubscription] = useState<SubscriptionVO | null>(null)
  const [extendDialogOpen, setExtendDialogOpen] = useState(false)
  const [grantDialogOpen, setGrantDialogOpen] = useState(false)
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<SubscriptionVO | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

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

  const handleCancel = (subscription: SubscriptionVO) => {
    setSubscriptionToCancel(subscription)
    setCancelDialogOpen(true)
  }

  const handleConfirmCancel = async (subscriptionId: number, reason?: string) => {
    try {
      const response = await cancelSubscription(subscriptionId, reason)
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
        <Button onClick={() => setGrantDialogOpen(true)}>
          <GiftIcon className="mr-2 size-4" />
          赠送订阅
        </Button>
      </div>

      <div className="rounded-xl bg-card">
        <SubscriptionDatatable
          data={subscriptions}
          loading={loading}
          onRowClick={handleRowClick}
          onCancel={handleCancel}
          onExtend={handleExtend}
          onRefresh={fetchSubscriptions}
        />
      </div>

      <SubscriptionDetailSheet
        subscriptionId={selectedSubscriptionId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

      <ExtendSubscriptionDialog
        subscription={extendSubscription}
        open={extendDialogOpen}
        onOpenChange={setExtendDialogOpen}
        onSuccess={fetchSubscriptions}
      />

      <GrantSubscriptionDialog
        open={grantDialogOpen}
        onOpenChange={setGrantDialogOpen}
        onSuccess={fetchSubscriptions}
      />

      <CancelSubscriptionDialog
        subscription={subscriptionToCancel}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleConfirmCancel}
      />
    </div>
  )
}
