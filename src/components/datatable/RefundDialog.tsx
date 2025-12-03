import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'

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

import type { AdminOrderVO } from '@/types/subscription.types'

interface RefundDialogProps {
  order: AdminOrderVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (orderId: number, refundAmount: number, reason?: string) => Promise<void>
}

export function RefundDialog({ order, open, onOpenChange, onConfirm }: RefundDialogProps) {
  const [refundAmount, setRefundAmount] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setRefundAmount('')
      setReason('')
      setError('')
    } else if (order) {
      setRefundAmount(order.payAmount.toFixed(2))
    }
    onOpenChange(value)
  }

  const handleConfirm = async () => {
    if (!order) return

    const amount = parseFloat(refundAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('请输入有效的退款金额')
      return
    }

    if (amount > order.payAmount) {
      setError('退款金额不能超过实付金额')
      return
    }

    setLoading(true)
    setError('')
    try {
      await onConfirm(order.id, amount, reason || undefined)
      handleOpenChange(false)
    } catch {
      setError('退款失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const getCurrencySymbol = (currency: string) => {
    return currency === 'CNY' ? '¥' : '$'
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>订单退款</DialogTitle>
          <DialogDescription>
            请确认退款信息，退款操作不可撤销
          </DialogDescription>
        </DialogHeader>

        {order && (
          <div className="flex flex-col gap-4">
            {/* Order Info */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">订单号</span>
                  <span className="font-mono text-sm">{order.orderNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">商品名称</span>
                  <span className="text-sm">{order.productName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">实付金额</span>
                  <span className="font-medium text-primary">
                    {getCurrencySymbol(order.currency)}{order.payAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Refund Amount */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="refundAmount">退款金额</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {getCurrencySymbol(order.currency)}
                </span>
                <Input
                  id="refundAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={order.payAmount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="pl-7"
                  placeholder="请输入退款金额"
                />
              </div>
              <span className="text-xs text-muted-foreground">
                最大可退款金额: {getCurrencySymbol(order.currency)}{order.payAmount.toFixed(2)}
              </span>
            </div>

            {/* Reason */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="reason">退款原因（可选）</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请输入退款原因..."
                rows={3}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !refundAmount}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            确认退款
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
