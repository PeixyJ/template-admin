import { useEffect, useState } from 'react'
import {
  Loader2Icon,
  CalendarIcon,
  CreditCardIcon,
  UsersIcon,
  SettingsIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { getSubscriptionDetail } from '@/services/subscription'
import type { SubscriptionDetailVO, SubscriptionStatus, SubscriptionSource } from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface SubscriptionDetailSheetProps {
  subscriptionId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusLabels: Record<SubscriptionStatus, string> = {
  PENDING: '待生效',
  ACTIVE: '生效中',
  PAUSED: '已暂停',
  EXPIRED: '已过期',
  CANCELLED: '已取消',
}

const statusColors: Record<SubscriptionStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  PAUSED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const sourceLabels: Record<SubscriptionSource, string> = {
  PURCHASE: '购买',
  GRANT: '赠送',
  SYSTEM: '系统',
}

export function SubscriptionDetailSheet({
  subscriptionId,
  open,
  onOpenChange,
}: SubscriptionDetailSheetProps) {
  const [subscription, setSubscription] = useState<SubscriptionDetailVO | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && subscriptionId) {
      setLoading(true)
      getSubscriptionDetail(subscriptionId)
        .then((response) => {
          if (response.code === 'SUCCESS') {
            setSubscription(response.data)
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [open, subscriptionId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <CreditCardIcon className="size-5" />
            订阅详情
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : subscription ? (
          <div className="space-y-6 py-6">
            {/* 基本信息 */}
            <section className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium">
                <CalendarIcon className="size-4" />
                基本信息
              </h3>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">订阅编号</span>
                  <code className="rounded bg-muted px-2 py-1 text-sm">
                    {subscription.subscriptionNo}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">状态</span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      statusColors[subscription.status]
                    )}
                  >
                    {statusLabels[subscription.status] || subscription.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">来源</span>
                  <Badge variant="outline">
                    {sourceLabels[subscription.source] || subscription.source}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">团队</span>
                  <span className="font-medium">{subscription.teamName}</span>
                </div>
              </div>
            </section>

            {/* 计划信息 */}
            <section className="space-y-4 border-t pt-4">
              <h3 className="flex items-center gap-2 font-medium">
                <SettingsIcon className="size-4" />
                计划信息
              </h3>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">计划名称</span>
                  <span className="font-medium">{subscription.planName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">计划编码</span>
                  <code className="rounded bg-muted px-2 py-1 text-sm">
                    {subscription.planCode}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">计划等级</span>
                  <Badge>Lv.{subscription.planLevel}</Badge>
                </div>
              </div>
            </section>

            {/* 有效期信息 */}
            <section className="space-y-4 border-t pt-4">
              <h3 className="flex items-center gap-2 font-medium">
                <CalendarIcon className="size-4" />
                有效期信息
              </h3>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">开始日期</span>
                  <span>{new Date(subscription.startDate).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">结束日期</span>
                  <span>
                    {subscription.endDate
                      ? new Date(subscription.endDate).toLocaleDateString('zh-CN')
                      : '永久'}
                  </span>
                </div>
                {subscription.activatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">激活时间</span>
                    <span>{new Date(subscription.activatedAt).toLocaleString('zh-CN')}</span>
                  </div>
                )}
                {subscription.expiredAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">过期时间</span>
                    <span>{new Date(subscription.expiredAt).toLocaleString('zh-CN')}</span>
                  </div>
                )}
                {subscription.cancelledAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">取消时间</span>
                    <span>{new Date(subscription.cancelledAt).toLocaleString('zh-CN')}</span>
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
                  <span>¥{subscription.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">实付金额</span>
                  <span className="font-medium text-lg">¥{subscription.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">席位数</span>
                  <span>{subscription.seats}</span>
                </div>
              </div>
            </section>

            {/* 关联信息 */}
            {(subscription.orderNo || subscription.grantNo) && (
              <section className="space-y-4 border-t pt-4">
                <h3 className="font-medium">关联信息</h3>
                <div className="grid gap-3">
                  {subscription.orderNo && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">关联订单</span>
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {subscription.orderNo}
                      </code>
                    </div>
                  )}
                  {subscription.grantNo && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">赠送单号</span>
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {subscription.grantNo}
                      </code>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 功能列表 */}
            {subscription.features && subscription.features.length > 0 && (
              <section className="space-y-4 border-t pt-4">
                <h3 className="flex items-center gap-2 font-medium">
                  <UsersIcon className="size-4" />
                  功能列表
                </h3>
                <div className="space-y-2">
                  {subscription.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-2">
                        {feature.enabled ? (
                          <CheckCircle2Icon className="size-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="size-4 text-muted-foreground" />
                        )}
                        <span className={cn(!feature.enabled && 'text-muted-foreground')}>
                          {feature.featureName}
                        </span>
                      </div>
                      {feature.pointsCost !== null && (
                        <Badge variant="outline">{feature.pointsCost}点/次</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 备注 */}
            {subscription.remark && (
              <section className="space-y-4 border-t pt-4">
                <h3 className="font-medium">备注</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {subscription.remark}
                </p>
              </section>
            )}

            {/* 时间信息 */}
            <section className="space-y-3 border-t pt-4">
              <h3 className="font-medium">时间信息</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">创建时间</span>
                  <span>
                    {new Date(subscription.createTime).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">更新时间</span>
                  <span>
                    {new Date(subscription.updateTime).toLocaleString('zh-CN')}
                  </span>
                </div>
              </div>
            </section>
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
