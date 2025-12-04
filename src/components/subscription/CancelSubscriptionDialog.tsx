import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SubscriptionVO } from '@/types/subscription.types'

interface CancelSubscriptionDialogProps {
  subscription: SubscriptionVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (subscriptionId: number, reason?: string) => Promise<void>
}

export function CancelSubscriptionDialog({
  subscription,
  open,
  onOpenChange,
  onConfirm,
}: CancelSubscriptionDialogProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!subscription) return

    setLoading(true)
    try {
      await onConfirm(subscription.id, reason || undefined)
      setReason('')
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason('')
    }
    onOpenChange(newOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>确认取消订阅</AlertDialogTitle>
          <AlertDialogDescription>
            确定要取消该订阅吗？此操作无法撤销。
            {subscription && (
              <span className="mt-2 block text-foreground">
                团队: {subscription.teamName} | 计划: {subscription.planName}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-3 py-2">
          <Label htmlFor="cancel-reason">取消原因（可选）</Label>
          <Input
            id="cancel-reason"
            placeholder="请输入取消原因"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? '处理中...' : '确认取消订阅'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
