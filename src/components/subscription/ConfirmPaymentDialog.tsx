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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { confirmPayment } from '@/services/subscription'
import type { AdminOrderVO, ConfirmPaymentDTO, PayChannel } from '@/types/subscription.types'

interface ConfirmPaymentDialogProps {
  order: AdminOrderVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ConfirmPaymentDialog({
  order,
  open,
  onOpenChange,
  onSuccess,
}: ConfirmPaymentDialogProps) {
  const [formData, setFormData] = useState<ConfirmPaymentDTO>({
    payChannel: 'ALIPAY',
    externalPaymentNo: '',
    remark: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return

    setLoading(true)

    try {
      const response = await confirmPayment(order.id, formData)
      if (response.code === 'SUCCESS') {
        toast.success('支付确认成功')
        onSuccess()
        onOpenChange(false)
        setFormData({ payChannel: 'ALIPAY', externalPaymentNo: '', remark: '' })
      } else {
        toast.error(response.message || '确认支付失败')
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error)
      toast.error('确认支付失败')
    } finally {
      setLoading(false)
    }
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>手动确认支付</DialogTitle>
          <DialogDescription>
            为订单 "{order.orderNo}" 手动确认支付
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>订单金额</Label>
            <Input value={`¥${order.payAmount.toFixed(2)}`} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payChannel">支付渠道 *</Label>
            <Select
              value={formData.payChannel}
              onValueChange={(value) =>
                setFormData({ ...formData, payChannel: value as PayChannel })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALIPAY">支付宝</SelectItem>
                <SelectItem value="WECHAT">微信</SelectItem>
                <SelectItem value="STRIPE">Stripe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="externalPaymentNo">外部支付单号</Label>
            <Input
              id="externalPaymentNo"
              value={formData.externalPaymentNo || ''}
              onChange={(e) =>
                setFormData({ ...formData, externalPaymentNo: e.target.value })
              }
              placeholder="第三方支付平台的支付单号"
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
              placeholder="请输入备注..."
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
              确认支付
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
