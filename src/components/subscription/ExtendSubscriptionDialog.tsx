import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NumberInput } from '@/components/ui/number-input'

import { extendSubscription } from '@/services/subscription'
import type { SubscriptionVO } from '@/types/subscription.types'

interface ExtendSubscriptionDialogProps {
  subscription: SubscriptionVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ExtendSubscriptionDialog({
  subscription,
  open,
  onOpenChange,
  onSuccess,
}: ExtendSubscriptionDialogProps) {
  const [days, setDays] = useState<number>(30)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subscription || days <= 0) return

    setLoading(true)

    try {
      const response = await extendSubscription(subscription.id, {
        days,
        reason: reason.trim() || undefined,
      })
      if (response.code === 'SUCCESS') {
        toast.success(`订阅已延长 ${days} 天`)
        onSuccess()
        onOpenChange(false)
        setDays(30)
        setReason('')
      } else {
        toast.error(response.message || '延长订阅失败')
      }
    } catch (error) {
      console.error('Failed to extend subscription:', error)
      toast.error('延长订阅失败')
    } finally {
      setLoading(false)
    }
  }

  if (!subscription) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>延长订阅</DialogTitle>
          <DialogDescription>
            为订阅 #{subscription.id}（{subscription.planName}）延长有效期
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>当前到期日期</Label>
            <Input
              value={
                subscription.endTime
                  ? new Date(subscription.endTime).toLocaleDateString('zh-CN')
                  : '永久'
              }
              disabled
            />
          </div>

          <NumberInput
            label="延长天数 *"
            value={days}
            onChange={setDays}
            minValue={1}
          />

          <div className="space-y-2">
            <Label htmlFor="reason">延长原因</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请输入延长原因（可选）..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading || days <= 0}>
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              确认延长
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
