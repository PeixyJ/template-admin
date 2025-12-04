import { useEffect, useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { updateSubscription } from '@/services/subscription'
import type { SubscriptionVO, AdminUpdateSubscriptionDTO } from '@/types/subscription.types'

interface EditSubscriptionDialogProps {
  subscription: SubscriptionVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditSubscriptionDialog({
  subscription,
  open,
  onOpenChange,
  onSuccess,
}: EditSubscriptionDialogProps) {
  const [formData, setFormData] = useState<AdminUpdateSubscriptionDTO>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && subscription) {
      setFormData({
        seats: subscription.seats,
        endDate: subscription.endDate || undefined,
        remark: '',
      })
    }
  }, [open, subscription])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subscription) return

    setLoading(true)

    try {
      const response = await updateSubscription(subscription.id, formData)
      if (response.code === 'SUCCESS') {
        toast.success('订阅更新成功')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(response.message || '更新订阅失败')
      }
    } catch (error) {
      console.error('Failed to update subscription:', error)
      toast.error('更新订阅失败')
    } finally {
      setLoading(false)
    }
  }

  if (!subscription) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑订阅</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>订阅编号</Label>
            <Input value={subscription.subscriptionNo} disabled />
          </div>

          <div className="space-y-2">
            <Label>团队</Label>
            <Input value={subscription.teamName} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seats">席位数</Label>
            <Input
              id="seats"
              type="number"
              min={1}
              value={formData.seats || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seats: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">结束日期</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate?.split('T')[0] || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  endDate: e.target.value || undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark">备注</Label>
            <Textarea
              id="remark"
              value={formData.remark || ''}
              onChange={(e) =>
                setFormData({ ...formData, remark: e.target.value })
              }
              placeholder="修改原因..."
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
