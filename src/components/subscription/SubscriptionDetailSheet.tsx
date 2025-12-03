import { useEffect, useState } from 'react'
import {
  CalendarIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon,
  UsersIcon,
  CreditCardIcon,
  TagIcon,
  FileTextIcon,
  ClockIcon,
  HashIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

import { getSubscriptionDetail } from '@/services/subscription'
import type {
  SubscriptionVO,
  SubscriptionDetailVO,
  SubscriptionStatus,
  SubscriptionSource,
  EffectiveType,
} from '@/types/subscription.types'

interface SubscriptionDetailSheetProps {
  subscription: SubscriptionVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig: Record<SubscriptionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: '待生效', variant: 'outline' },
  ACTIVE: { label: '生效中', variant: 'default' },
  PAUSED: { label: '已暂停', variant: 'secondary' },
  EXPIRED: { label: '已过期', variant: 'destructive' },
  CANCELLED: { label: '已取消', variant: 'destructive' },
}

const sourceConfig: Record<SubscriptionSource, { label: string }> = {
  PURCHASE: { label: '购买' },
  GRANT: { label: '赠送' },
  TRIAL: { label: '试用' },
  SYSTEM: { label: '系统' },
}

const effectiveTypeConfig: Record<EffectiveType, { label: string }> = {
  IMMEDIATE: { label: '立即生效' },
  SEQUENTIAL: { label: '顺序生效' },
}

export function SubscriptionDetailSheet({
  subscription,
  open,
  onOpenChange,
}: SubscriptionDetailSheetProps) {
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<SubscriptionDetailVO | null>(null)

  useEffect(() => {
    if (open && subscription) {
      fetchDetail(subscription.id)
    }
  }, [open, subscription])

  const fetchDetail = async (id: number) => {
    setLoading(true)
    try {
      const res = await getSubscriptionDetail(id)
      if (res.data.code === 'SUCCESS') {
        setDetail(res.data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('zh-CN')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>订阅详情</SheetTitle>
          <SheetDescription>查看订阅的详细信息</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : detail ? (
          <div className="flex flex-col gap-6 px-4">
            {/* 基本信息 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{detail.planName}</span>
                <Badge variant="outline" className="font-mono">
                  Lv.{detail.planLevel}
                </Badge>
              </div>
              <CopyableText
                label="订阅编号"
                value={detail.subscriptionNo}
                className="font-mono text-sm text-muted-foreground"
              />
              <div className="flex items-center gap-2">
                <Badge variant={statusConfig[detail.status]?.variant || 'outline'}>
                  {statusConfig[detail.status]?.label || detail.status}
                </Badge>
                <Badge variant="secondary">
                  {sourceConfig[detail.source]?.label || detail.source}
                </Badge>
                <Badge variant="outline">
                  {effectiveTypeConfig[detail.effectiveType]?.label || detail.effectiveType}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* 团队信息 */}
            <div className="flex flex-col gap-3">
              <h4 className="font-medium">团队信息</h4>
              <DetailItem
                icon={<UsersIcon className="size-4" />}
                label="团队名称"
                value={detail.teamName}
              />
              <DetailItem
                icon={<HashIcon className="size-4" />}
                label="团队ID"
                value={String(detail.teamId)}
              />
              {detail.seats && (
                <DetailItem
                  icon={<UsersIcon className="size-4" />}
                  label="席位数"
                  value={String(detail.seats)}
                />
              )}
            </div>

            <Separator />

            {/* 计划信息 */}
            <div className="flex flex-col gap-3">
              <h4 className="font-medium">计划信息</h4>
              <DetailItem
                icon={<TagIcon className="size-4" />}
                label="计划编码"
                value={detail.planCode}
              />
              <DetailItem
                icon={<CreditCardIcon className="size-4" />}
                label="实付金额"
                value={`¥${detail.paidAmount.toFixed(2)}`}
              />
              {detail.price !== detail.paidAmount && (
                <DetailItem
                  icon={<CreditCardIcon className="size-4" />}
                  label="原价"
                  value={`¥${detail.price.toFixed(2)}`}
                />
              )}
            </div>

            <Separator />

            {/* 有效期信息 */}
            <div className="flex flex-col gap-3">
              <h4 className="font-medium">有效期</h4>
              <DetailItem
                icon={<CalendarIcon className="size-4" />}
                label="开始日期"
                value={formatDate(detail.startDate)}
              />
              <DetailItem
                icon={<CalendarIcon className="size-4" />}
                label="结束日期"
                value={detail.endDate ? formatDate(detail.endDate) : '永久'}
              />
              {detail.activatedAt && (
                <DetailItem
                  icon={<ClockIcon className="size-4" />}
                  label="激活时间"
                  value={formatDate(detail.activatedAt)}
                />
              )}
              {detail.expiredAt && (
                <DetailItem
                  icon={<ClockIcon className="size-4" />}
                  label="过期时间"
                  value={formatDate(detail.expiredAt)}
                />
              )}
              {detail.cancelledAt && (
                <DetailItem
                  icon={<ClockIcon className="size-4" />}
                  label="取消时间"
                  value={formatDate(detail.cancelledAt)}
                />
              )}
            </div>

            {/* 关联信息 */}
            {(detail.orderNo || detail.grantNo) && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h4 className="font-medium">关联信息</h4>
                  {detail.orderNo && (
                    <CopyableText
                      label="订单编号"
                      value={detail.orderNo}
                      className="font-mono text-sm"
                    >
                      <span className="text-muted-foreground">订单编号：</span>
                      {detail.orderNo}
                    </CopyableText>
                  )}
                  {detail.grantNo && (
                    <CopyableText
                      label="赠送单号"
                      value={detail.grantNo}
                      className="font-mono text-sm"
                    >
                      <span className="text-muted-foreground">赠送单号：</span>
                      {detail.grantNo}
                    </CopyableText>
                  )}
                </div>
              </>
            )}

            {/* 功能列表 */}
            {detail.features && detail.features.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h4 className="font-medium">订阅功能</h4>
                  <div className="flex flex-col gap-2">
                    {detail.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{feature.featureName}</span>
                            <Badge variant="outline" className="text-xs">
                              {feature.featureType}
                            </Badge>
                          </div>
                          <code className="text-xs text-muted-foreground">{feature.featureCode}</code>
                        </div>
                        <Badge variant={feature.enabled ? 'default' : 'secondary'}>
                          {feature.enabled ? '已启用' : '未启用'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 备注 */}
            {detail.remark && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <h4 className="font-medium">备注</h4>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-sm text-muted-foreground">{detail.remark}</p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* 时间信息 */}
            <div className="grid gap-4">
              <DetailItem
                icon={<FileTextIcon className="size-4" />}
                label="创建时间"
                value={formatDate(detail.createTime)}
              />
              <DetailItem
                icon={<FileTextIcon className="size-4" />}
                label="更新时间"
                value={formatDate(detail.updateTime)}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center py-12 text-muted-foreground">
            暂无数据
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function CopyableText({
  value,
  label,
  className,
  children,
}: {
  value: string
  label?: string
  className?: string
  children?: React.ReactNode
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`${label || '内容'}已复制`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`group inline-flex items-center gap-1.5 text-left transition-colors hover:text-primary ${className || ''}`}
      title="点击复制"
    >
      {children || value}
      {copied ? (
        <CheckIcon className="size-3.5 text-green-500" />
      ) : (
        <CopyIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  )
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm">{value}</span>
      </div>
    </div>
  )
}
