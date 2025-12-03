import { useEffect, useState } from 'react'
import {
  CalendarIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon,
  CrownIcon,
  StarIcon,
  SparklesIcon,
  DollarSignIcon,
  ClockIcon,
  SettingsIcon,
  UsersIcon,
  FolderIcon,
  ZapIcon,
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

import { getPlanDetail } from '@/services/subscription'
import type { PlanVO, PlanDetailVO, PlanType, ApplyScope } from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface PlanDetailSheetProps {
  plan: PlanVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const planTypeConfig: Record<PlanType, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'outline' }> = {
  FREE: { label: '免费版', icon: <StarIcon className="mr-1 size-3" />, variant: 'secondary' },
  TRIAL: { label: '试用版', icon: <SparklesIcon className="mr-1 size-3" />, variant: 'outline' },
  PAID: { label: '付费版', icon: <CrownIcon className="mr-1 size-3" />, variant: 'default' },
}

const applyScopeConfig: Record<ApplyScope, { label: string }> = {
  PERSONAL: { label: '个人空间' },
  COLLABORATION: { label: '协作团队' },
  ALL: { label: '通用' },
}

export function PlanDetailSheet({
  plan,
  open,
  onOpenChange,
}: PlanDetailSheetProps) {
  const [loading, setLoading] = useState(false)
  const [planDetail, setPlanDetail] = useState<PlanDetailVO | null>(null)

  useEffect(() => {
    if (open && plan) {
      fetchPlanDetail(plan.id)
    }
  }, [open, plan])

  const fetchPlanDetail = async (id: number) => {
    setLoading(true)
    try {
      const res = await getPlanDetail(id)
      if (res.data.code === 'SUCCESS') {
        setPlanDetail(res.data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'CNY' ? '¥' : '$'
    return `${symbol}${amount.toFixed(2)}`
  }

  const parseResourceLimits = (json: string | null): Record<string, number> | null => {
    if (!json) return null
    try {
      return JSON.parse(json)
    } catch {
      return null
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>计划详情</SheetTitle>
          <SheetDescription>查看订阅计划的详细信息</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : planDetail ? (
          <div className="flex flex-col gap-6 px-4">
            {/* 基本信息 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{planDetail.planName}</span>
                {(() => {
                  const typeConfig = planTypeConfig[planDetail.planType as PlanType]
                  return (
                    <Badge variant={typeConfig?.variant || 'outline'}>
                      {typeConfig?.icon}
                      {typeConfig?.label || planDetail.planType}
                    </Badge>
                  )
                })()}
                {planDetail.isDefault && (
                  <Badge variant="secondary">默认</Badge>
                )}
              </div>
              <CopyableText
                label="编码"
                value={planDetail.planCode}
                className="font-mono text-sm text-muted-foreground"
              />
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Lv.{planDetail.planLevel}
                </Badge>
                <Badge variant="outline">
                  {applyScopeConfig[planDetail.applyScope]?.label || planDetail.applyScope}
                </Badge>
                <Badge
                  variant={planDetail.status ? 'default' : 'destructive'}
                >
                  {planDetail.status ? '启用' : '禁用'}
                </Badge>
                <Badge variant={planDetail.isVisible ? 'default' : 'secondary'}>
                  {planDetail.isVisible ? '可见' : '隐藏'}
                </Badge>
              </div>
              {planDetail.description && (
                <p className="text-sm text-muted-foreground">{planDetail.description}</p>
              )}
            </div>

            <Separator />

            {/* 价格信息 */}
            <div className="flex flex-col gap-4">
              <h4 className="font-medium">价格信息</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<DollarSignIcon className="size-4" />}
                  label="当前价格"
                  value={formatCurrency(planDetail.price, planDetail.currency)}
                />
                {planDetail.originalPrice !== null && planDetail.originalPrice !== undefined && (
                  <DetailItem
                    icon={<DollarSignIcon className="size-4" />}
                    label="原价"
                    value={
                      <span className="line-through text-muted-foreground">
                        {formatCurrency(planDetail.originalPrice, planDetail.currency)}
                      </span>
                    }
                  />
                )}
              </div>
            </div>

            <Separator />

            {/* 有效期和配额 */}
            <div className="flex flex-col gap-4">
              <h4 className="font-medium">有效期和配额</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<ClockIcon className="size-4" />}
                  label="有效期"
                  value={planDetail.durationDays ? `${planDetail.durationDays} 天` : '永久'}
                />
                {planDetail.dailyQuota !== null && planDetail.dailyQuota !== undefined && (
                  <DetailItem
                    icon={<ZapIcon className="size-4" />}
                    label="每日配额"
                    value={planDetail.dailyQuota.toString()}
                  />
                )}
                {planDetail.monthlyQuota !== null && planDetail.monthlyQuota !== undefined && (
                  <DetailItem
                    icon={<ZapIcon className="size-4" />}
                    label="月度配额"
                    value={planDetail.monthlyQuota.toString()}
                  />
                )}
              </div>
            </div>

            {/* 资源限制 */}
            {planDetail.resourceLimits && (
              <>
                <Separator />
                <div className="flex flex-col gap-4">
                  <h4 className="font-medium">资源限制</h4>
                  {(() => {
                    const limits = parseResourceLimits(planDetail.resourceLimits)
                    if (!limits) {
                      return (
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <pre className="whitespace-pre-wrap text-sm font-mono">
                            {planDetail.resourceLimits}
                          </pre>
                        </div>
                      )
                    }
                    return (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {Object.entries(limits).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center gap-3 rounded-lg border p-3"
                          >
                            {key === 'projects' ? (
                              <FolderIcon className="size-4 text-muted-foreground" />
                            ) : key === 'members' ? (
                              <UsersIcon className="size-4 text-muted-foreground" />
                            ) : (
                              <SettingsIcon className="size-4 text-muted-foreground" />
                            )}
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground capitalize">
                                {key}
                              </span>
                              <span className="font-medium">{value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </>
            )}

            {/* 购买限制 */}
            {(planDetail.maxPurchaseCount !== null || planDetail.maxGrantCount !== null) && (
              <>
                <Separator />
                <div className="flex flex-col gap-4">
                  <h4 className="font-medium">购买限制</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {planDetail.maxPurchaseCount !== null && planDetail.maxPurchaseCount !== undefined && (
                      <DetailItem
                        icon={<SettingsIcon className="size-4" />}
                        label="最大购买次数"
                        value={planDetail.maxPurchaseCount === 0 ? '无限制' : planDetail.maxPurchaseCount.toString()}
                      />
                    )}
                    {planDetail.maxGrantCount !== null && planDetail.maxGrantCount !== undefined && (
                      <DetailItem
                        icon={<SettingsIcon className="size-4" />}
                        label="最大赠送次数"
                        value={planDetail.maxGrantCount === 0 ? '无限制' : planDetail.maxGrantCount.toString()}
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* 其他信息 */}
            <div className="flex flex-col gap-4">
              <h4 className="font-medium">其他信息</h4>
              <div className="grid gap-4">
                <DetailItem
                  icon={<SettingsIcon className="size-4" />}
                  label="排序"
                  value={planDetail.sortOrder.toString()}
                />
                <div className="flex items-center gap-4">
                  <Badge variant={planDetail.isTrial ? 'default' : 'secondary'}>
                    {planDetail.isTrial ? '试用计划' : '非试用'}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* 时间信息 */}
            <div className="grid gap-4">
              <DetailItem
                icon={<CalendarIcon className="size-4" />}
                label="创建时间"
                value={planDetail.createTime}
              />
              <DetailItem
                icon={<CalendarIcon className="size-4" />}
                label="更新时间"
                value={planDetail.updateTime}
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
      className={cn(
        'group inline-flex items-center gap-1.5 text-left transition-colors hover:text-primary',
        className
      )}
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
  value: React.ReactNode
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
