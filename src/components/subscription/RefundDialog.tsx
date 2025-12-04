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

import { refundOrder } from '@/services/subscription'
import type { AdminOrderVO, RefundOrderDTO } from '@/types/subscription.types'

interface RefundDialogProps {
  order: AdminOrderVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RefundDialog({
  order,
  open,
  onOpenChange,
  onSuccess,
}: RefundDialogProps) {
  const [formData, setFormData] = useState<RefundOrderDTO>({
    refundAmount: 0,
    reason: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order || formData.refundAmount <= 0) return

    setLoading(true)

    try {
      const response = await refundOrder(order.id, formData)
      if (response.code === 'SUCCESS') {
        toast.success('退款申请已提交')
        onSuccess()
        onOpenChange(false)
        setFormData({ refundAmount: 0, reason: '' })
      } else {
        toast.error(response.message || '退款失败')
      }
    } catch (error) {
      console.error('Failed to refund order:', error)
      toast.error('退款失败')
    } finally {
      setLoading(false)
    }
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>订单退款</DialogTitle>
          <DialogDescription>
            为订单 "{order.orderNo}" 申请退款
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>订单金额</Label>
            <Input value={`¥${order.payAmount.toFixed(2)}`} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refundAmount">退款金额 *</Label>
            <Input
              id="refundAmount"
              type="number"
              min={0.01}
              max={order.payAmount}
              step={0.01}
              value={formData.refundAmount || ''}
              onChange={(e) =>
                setFormData({ ...formData, refundAmount: parseFloat(e.target.value) || 0 })
              }
              placeholder="请输入退款金额"
              required
            />
            <p className="text-xs text-muted-foreground">
              最大可退款金额: ¥{order.payAmount.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">退款原因</Label>
            <Textarea
              id="reason"
              value={formData.reason || ''}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="请输入退款原因..."
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
            <Button
              type="submit"
              variant="destructive"
              disabled={loading || formData.refundAmount <= 0}
            >
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              确认退款
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
