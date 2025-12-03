import { useEffect, useState } from 'react'
import {
  CalendarIcon,
  CreditCardIcon,
  ReceiptIcon,
  UserIcon,
  UsersIcon,
  PackageIcon,
  Loader2Icon,
  ClockIcon,
  HashIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { getOrderDetail, getOrderPayments } from '@/services/subscription'
import type { AdminOrderDetailVO, PaymentRecordVO } from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface OrderDetailSheetProps {
  orderId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const payStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  UNPAID: { label: '待支付', variant: 'outline' },
  PAYING: { label: '支付中', variant: 'secondary' },
  PAID: { label: '已支付', variant: 'default' },
  CLOSED: { label: '已关闭', variant: 'destructive' },
  REFUNDED: { label: '已退款', variant: 'destructive' },
}

const orderTypeConfig: Record<string, { label: string; color: string }> = {
  SUBSCRIPTION: { label: '订阅', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  POINTS: { label: '点数', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  RESOURCE_PACK: { label: '扩容包', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
}

export function OrderDetailSheet({ orderId, open, onOpenChange }: OrderDetailSheetProps) {
  const [order, setOrder] = useState<AdminOrderDetailVO | null>(null)
  const [payments, setPayments] = useState<PaymentRecordVO[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && orderId) {
      fetchOrderData(orderId)
    } else {
      setOrder(null)
      setPayments([])
    }
  }, [open, orderId])

  const fetchOrderData = async (id: number) => {
    setLoading(true)
    try {
      const [detailRes, paymentsRes] = await Promise.all([
        getOrderDetail(id),
        getOrderPayments(id),
      ])

      if (detailRes.data.code === 'SUCCESS') {
        setOrder(detailRes.data.data)
      }

      if (paymentsRes.data.code === 'SUCCESS') {
        setPayments(paymentsRes.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch order data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrencySymbol = (currency: string) => {
    return currency === 'CNY' ? '¥' : '$'
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>订单详情</SheetTitle>
          <SheetDescription>查看订单完整信息和支付记录</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : order ? (
          <div className="flex flex-col gap-6 px-4">
            {/* Order Header */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <ReceiptIcon className="size-5 text-primary" />
                  <span className="font-mono text-sm font-medium">{order.orderNo}</span>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(orderTypeConfig[order.orderType]?.color)}
                >
                  {orderTypeConfig[order.orderType]?.label || order.orderTypeDesc}
                </Badge>
              </div>
              <Badge variant={payStatusConfig[order.payStatus]?.variant || 'outline'}>
                {payStatusConfig[order.payStatus]?.label || order.payStatusDesc}
              </Badge>
            </div>

            {/* Product Info */}
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <PackageIcon className="size-6 text-primary" />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-medium">{order.productName}</span>
                  <span className="text-sm text-muted-foreground">
                    编码: {order.productCode}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    数量: x{order.quantity}
                  </span>
                </div>
              </div>
            </div>

            {/* User & Team Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">下单用户</span>
                <div className="flex items-center gap-2">
                  <UserIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{order.userNickname}</span>
                </div>
                <span className="text-xs text-muted-foreground">ID: {order.userId}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">所属团队</span>
                <div className="flex items-center gap-2">
                  <UsersIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{order.teamName}</span>
                </div>
                <span className="text-xs text-muted-foreground">ID: {order.teamId}</span>
              </div>
            </div>

            <Separator />

            {/* Amount Info */}
            <div className="flex flex-col gap-3">
              <h4 className="font-medium">金额信息</h4>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">订单金额</span>
                    <span className="text-sm">
                      {getCurrencySymbol(order.currency)}{order.amount.toFixed(2)}
                    </span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">优惠金额</span>
                      <span className="text-sm text-green-600">
                        -{getCurrencySymbol(order.currency)}{order.discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <Separator className="my-1" />
                  <div className="flex items-center justify-between">
                    <span className="font-medium">实付金额</span>
                    <span className="text-lg font-semibold text-primary">
                      {getCurrencySymbol(order.currency)}{order.payAmount.toFixed(2)}
                    </span>
                  </div>
                  {order.refundAmount && order.refundAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">退款金额</span>
                      <span className="text-sm text-destructive">
                        {getCurrencySymbol(order.currency)}{order.refundAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">支付渠道</span>
                <div className="flex items-center gap-2">
                  <CreditCardIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm">{order.payChannelDesc || '-'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">支付流水号</span>
                <div className="flex items-center gap-2">
                  <HashIcon className="size-4 text-muted-foreground" />
                  <span className="font-mono text-xs">
                    {order.payTransactionNo || '-'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Time Info */}
            <div className="flex flex-col gap-3">
              <h4 className="font-medium">时间信息</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">创建时间</span>
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="size-3.5 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(order.createTime).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">过期时间</span>
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="size-3.5 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(order.expireAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>

                {order.paidAt && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">支付时间</span>
                    <div className="flex items-center gap-1.5">
                      <CreditCardIcon className="size-3.5 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(order.paidAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                )}

                {order.refundedAt && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">退款时间</span>
                    <div className="flex items-center gap-1.5">
                      <ReceiptIcon className="size-3.5 text-destructive" />
                      <span className="text-sm text-destructive">
                        {new Date(order.refundedAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">更新时间</span>
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="size-3.5 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(order.updateTime).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Remark */}
            {order.remark && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <h4 className="font-medium">备注</h4>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground">{order.remark}</p>
                  </div>
                </div>
              </>
            )}

            {/* Payment Records */}
            {payments.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">支付记录</h4>
                    <Badge variant="outline">{payments.length} 条</Badge>
                  </div>

                  <div className="flex flex-col gap-2">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <CreditCardIcon className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {payment.payChannelDesc}
                            </span>
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">
                            {payment.transactionNo}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(payment.createTime).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-medium">
                            {getCurrencySymbol(order.currency)}{payment.amount.toFixed(2)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {payment.statusDesc}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">
            未找到订单信息
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
