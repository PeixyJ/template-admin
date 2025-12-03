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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import type { AdminOrderVO } from '@/types/subscription.types'

interface ConfirmPaymentDialogProps {
  order: AdminOrderVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (orderId: number, payChannel: string, transactionNo: string, remark?: string) => Promise<void>
}

const payChannelOptions = [
  { value: 'ALIPAY', label: '支付宝' },
  { value: 'WECHAT', label: '微信支付' },
  { value: 'BANK_TRANSFER', label: '银行转账' },
  { value: 'CASH', label: '现金' },
  { value: 'OTHER', label: '其他' },
]

export function ConfirmPaymentDialog({ order, open, onOpenChange, onConfirm }: ConfirmPaymentDialogProps) {
  const [payChannel, setPayChannel] = useState('')
  const [transactionNo, setTransactionNo] = useState('')
  const [remark, setRemark] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setPayChannel('')
      setTransactionNo('')
      setRemark('')
      setError('')
    }
    onOpenChange(value)
  }

  const handleConfirm = async () => {
    if (!order) return

    if (!payChannel) {
      setError('请选择支付渠道')
      return
    }

    if (!transactionNo.trim()) {
      setError('请输入支付流水号')
      return
    }

    setLoading(true)
    setError('')
    try {
      await onConfirm(order.id, payChannel, transactionNo.trim(), remark || undefined)
      handleOpenChange(false)
    } catch {
      setError('确认支付失败，请重试')
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
          <DialogTitle>手动确认支付</DialogTitle>
          <DialogDescription>
            请填写支付信息以手动确认订单支付
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
                  <span className="text-sm text-muted-foreground">应付金额</span>
                  <span className="font-medium text-primary">
                    {getCurrencySymbol(order.currency)}{order.payAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">下单用户</span>
                  <span className="text-sm">{order.userNickname}</span>
                </div>
              </div>
            </div>

            {/* Pay Channel */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="payChannel">支付渠道 *</Label>
              <Select value={payChannel} onValueChange={setPayChannel}>
                <SelectTrigger id="payChannel">
                  <SelectValue placeholder="请选择支付渠道" />
                </SelectTrigger>
                <SelectContent>
                  {payChannelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transaction No */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="transactionNo">支付流水号 *</Label>
              <Input
                id="transactionNo"
                value={transactionNo}
                onChange={(e) => setTransactionNo(e.target.value)}
                placeholder="请输入支付流水号"
              />
              <span className="text-xs text-muted-foreground">
                请填写银行或第三方支付平台的交易流水号
              </span>
            </div>

            {/* Remark */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="remark">备注（可选）</Label>
              <Textarea
                id="remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="请输入备注信息..."
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
          <Button onClick={handleConfirm} disabled={loading || !payChannel || !transactionNo.trim()}>
            {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            确认支付
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
