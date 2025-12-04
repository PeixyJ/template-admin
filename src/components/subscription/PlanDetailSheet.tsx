import { useEffect, useState } from 'react'
import { Loader2Icon, CheckIcon, XIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

import { getPlanDetail, getPlanFeatures } from '@/services/subscription'
import type { PlanDetailVO, PlanFeatureVO, PlanType, ApplyScope } from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface PlanDetailSheetProps {
  planId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const planTypeLabels: Record<PlanType, string> = {
  FREE: '免费版',
  TRIAL: '试用版',
  PAID: '付费版',
}

const applyScopeLabels: Record<ApplyScope, string> = {
  PERSONAL: '仅个人团队',
  COLLABORATION: '仅协作团队',
  ALL: '通用',
}

export function PlanDetailSheet({
  planId,
  open,
  onOpenChange,
}: PlanDetailSheetProps) {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<PlanDetailVO | null>(null)
  const [features, setFeatures] = useState<PlanFeatureVO[]>([])

  useEffect(() => {
    if (open && planId) {
      fetchPlanDetail(planId)
    }
  }, [open, planId])

  const fetchPlanDetail = async (id: number) => {
    setLoading(true)
    try {
      const [detailRes, featuresRes] = await Promise.all([
        getPlanDetail(id),
        getPlanFeatures(id),
      ])
      if (detailRes.code === 'SUCCESS') {
        setPlan(detailRes.data)
      }
      if (featuresRes.code === 'SUCCESS') {
        setFeatures(featuresRes.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch plan detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseResourceLimits = (resourceLimits: string | null) => {
    if (!resourceLimits) return null
    try {
      return JSON.parse(resourceLimits) as Record<string, number>
    } catch {
      return null
    }
  }

  const resourceTypeLabels: Record<string, string> = {
    PROJECT: '项目数',
    MEMBER: '成员数',
    STORAGE: '存储空间(GB)',
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>计划详情</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : plan ? (
          <div className="mt-6 space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">基本信息</h3>
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">计划名称</span>
                  <span className="font-medium">{plan.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">计划编码</span>
                  <code className="text-sm">{plan.planCode}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">计划等级</span>
                  <Badge variant="outline">Lv.{plan.planLevel}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">计划类型</span>
                  <span>{planTypeLabels[plan.planType]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">适用范围</span>
                  <span>{applyScopeLabels[plan.applyScope]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">状态</span>
                  <Badge variant={plan.status ? 'default' : 'secondary'}>
                    {plan.status ? '启用' : '禁用'}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* 价格信息 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">价格信息</h3>
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">售价</span>
                  <span className="font-medium">
                    {plan.price === 0
                      ? '免费'
                      : `${plan.currency === 'CNY' ? '¥' : '$'}${plan.price}`}
                  </span>
                </div>
                {plan.originalPrice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">原价</span>
                    <span className="text-muted-foreground line-through">
                      {plan.currency === 'CNY' ? '¥' : '$'}
                      {plan.originalPrice}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">有效期</span>
                  <span>{plan.durationDays === null ? '永久' : `${plan.durationDays}天`}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* 配额信息 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">配额信息</h3>
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">每日配额</span>
                  <span>{plan.dailyQuota ?? '无限制'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">月度配额</span>
                  <span>{plan.monthlyQuota ?? '无限制'}</span>
                </div>
              </div>
            </div>

            {/* 资源限制 */}
            {plan.resourceLimits && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">资源限制</h3>
                  <div className="grid gap-3">
                    {Object.entries(parseResourceLimits(plan.resourceLimits) || {}).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">
                            {resourceTypeLabels[key] || key}
                          </span>
                          <span>{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 功能列表 */}
            {features.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    功能列表 ({features.length})
                  </h3>
                  <div className="space-y-2">
                    {features.map((feature) => (
                      <div
                        key={feature.featureId}
                        className={cn(
                          'flex items-center justify-between rounded-lg border p-3',
                          !feature.enabled && 'opacity-50'
                        )}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{feature.featureName}</span>
                          <span className="text-xs text-muted-foreground">
                            {feature.featureCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {feature.featureType === 'POINTS' && feature.pointsCost && (
                            <Badge variant="outline">{feature.pointsCost}点/次</Badge>
                          )}
                          {feature.enabled ? (
                            <CheckIcon className="size-4 text-green-500" />
                          ) : (
                            <XIcon className="size-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* 其他信息 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">其他信息</h3>
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">是否默认</span>
                  <span>{plan.isDefault ? '是' : '否'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">是否试用</span>
                  <span>{plan.isTrial ? '是' : '否'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">前端可见</span>
                  <span>{plan.isVisible ? '是' : '否'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">排序</span>
                  <span>{plan.sortOrder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">创建时间</span>
                  <span>{new Date(plan.createTime).toLocaleString('zh-CN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">更新时间</span>
                  <span>{new Date(plan.updateTime).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            </div>

            {/* 描述 */}
            {plan.description && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">计划描述</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            暂无数据
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
