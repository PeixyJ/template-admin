import { useEffect, useState } from 'react'
import {
  Loader2Icon,
  ShoppingCartIcon,
  CreditCardIcon,
  CalendarIcon,
  LinkIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { getOrderDetail, getOrderPayments } from '@/services/subscription'
import type { AdminOrderDetailVO, PaymentRecordVO, OrderType, PayStatus, PayChannel } from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface OrderDetailSheetProps {
  orderId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const orderTypeLabels: Record<OrderType, string> = {
  SUBSCRIPTION: '订阅',
  POINTS_PACK: '点数包',
  RESOURCE_PACK: '扩容包',
}

const payStatusLabels: Record<PayStatus, string> = {
  PENDING: '待支付',
  PAID: '已支付',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDING: '退款中',
  REFUNDED: '已退款',
  CLOSED: '已关闭',
}

const payStatusColors: Record<PayStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  PAID: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  REFUNDING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  REFUNDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  CLOSED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const payChannelLabels: Record<PayChannel, string> = {
  ALIPAY: '支付宝',
  WECHAT: '微信',
  STRIPE: 'Stripe',
}

export function OrderDetailSheet({
  orderId,
  open,
  onOpenChange,
}: OrderDetailSheetProps) {
  const [order, setOrder] = useState<AdminOrderDetailVO | null>(null)
  const [payments, setPayments] = useState<PaymentRecordVO[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && orderId) {
      setLoading(true)
      Promise.all([
        getOrderDetail(orderId),
        getOrderPayments(orderId),
      ])
        .then(([orderRes, paymentsRes]) => {
          if (orderRes.code === 'SUCCESS') {
            setOrder(orderRes.data)
          }
          if (paymentsRes.code === 'SUCCESS') {
            setPayments(paymentsRes.data || [])
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [open, orderId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="size-5" />
            订单详情
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : order ? (
          <div className="space-y-6 py-6">
            {/* 基本信息 */}
            <section className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium">
                <ShoppingCartIcon className="size-4" />
                基本信息
              </h3>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">订单编号</span>
                  <code className="rounded bg-muted px-2 py-1 text-sm">
                    {order.orderNo}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">订单类型</span>
                  <Badge>{orderTypeLabels[order.orderType] || order.orderTypeDesc}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">支付状态</span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      payStatusColors[order.payStatus]
                    )}
                  >
                    {payStatusLabels[order.payStatus] || order.payStatusDesc}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">团队</span>
                  <span>{order.teamName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">下单用户</span>
                  <span>{order.userNickname}</span>
                </div>
              </div>
            </section>

            {/* 商品信息 */}
            <section className="space-y-4 border-t pt-4">
              <h3 className="font-medium">商品信息</h3>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">商品名称</span>
                  <span className="font-medium">{order.productName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">商品编码</span>
                  <code className="rounded bg-muted px-2 py-1 text-sm">
                    {order.productCode}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">数量</span>
                  <span>{order.quantity}</span>
                </div>
                {order.seats && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">席位数</span>
                    <span>{order.seats}</span>
                  </div>
                )}
              </div>
            </section>

            {/* 费用信息 */}
            <section className="space-y-4 border-t pt-4">
              <h3 className="flex items-center gap-2 font-medium">
                <CreditCardIcon className="size-4" />
                费用信息
              </h3>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">原价</span>
                  <span>¥{order.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">优惠</span>
                  <span className="text-green-600">
                    -¥{order.discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">实付</span>
                  <span className="text-xl font-bold">¥{order.payAmount.toFixed(2)}</span>
                </div>
                {order.payChannel && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">支付渠道</span>
                    <Badge variant="outline">
                      {payChannelLabels[order.payChannel] || order.payChannelDesc}
                    </Badge>
                  </div>
                )}
              </div>
            </section>

            {/* 关联信息 */}
            {(order.subscriptionNo || order.externalOrderNo) && (
              <section className="space-y-4 border-t pt-4">
                <h3 className="flex items-center gap-2 font-medium">
                  <LinkIcon className="size-4" />
                  关联信息
                </h3>
                <div className="grid gap-3">
                  {order.subscriptionNo && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">关联订阅</span>
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {order.subscriptionNo}
                      </code>
                    </div>
                  )}
                  {order.externalOrderNo && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">外部订单号</span>
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {order.externalOrderNo}
                      </code>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 支付记录 */}
            {payments.length > 0 && (
              <section className="space-y-4 border-t pt-4">
                <h3 className="font-medium">支付记录 ({payments.length})</h3>
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <code className="text-sm">{payment.paymentNo}</code>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            payStatusColors[payment.status]
                          )}
                        >
                          {payStatusLabels[payment.status] || payment.statusDesc}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">金额: </span>
                          <span className="font-medium">¥{payment.amount.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">渠道: </span>
                          <span>{payChannelLabels[payment.payChannel] || payment.payChannelDesc}</span>
                        </div>
                      </div>
                      {payment.paidAt && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          支付时间: {new Date(payment.paidAt).toLocaleString('zh-CN')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 时间信息 */}
            <section className="space-y-3 border-t pt-4">
              <h3 className="flex items-center gap-2 font-medium">
                <CalendarIcon className="size-4" />
                时间信息
              </h3>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">创建时间</span>
                  <span>
                    {new Date(order.createTime).toLocaleString('zh-CN')}
                  </span>
                </div>
                {order.paidAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">支付时间</span>
                    <span>
                      {new Date(order.paidAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                )}
                {order.expireAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">过期时间</span>
                    <span>
                      {new Date(order.expireAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                )}
                {order.closedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">关闭时间</span>
                    <span>
                      {new Date(order.closedAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* 备注 */}
            {(order.remark || order.closeReason) && (
              <section className="space-y-4 border-t pt-4">
                <h3 className="font-medium">备注</h3>
                {order.remark && (
                  <p className="text-sm text-muted-foreground">{order.remark}</p>
                )}
                {order.closeReason && (
                  <p className="text-sm text-destructive">关闭原因: {order.closeReason}</p>
                )}
              </section>
            )}
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            无数据
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
