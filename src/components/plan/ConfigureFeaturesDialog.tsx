import { useState, useEffect } from 'react'
import { Loader2Icon, CheckIcon, XIcon, ZapIcon, ToggleLeftIcon } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

import {
  getPlanFeatures,
  getAllFeatures,
  configurePlanFeatures,
} from '@/services/subscription'
import type {
  PlanVO,
  PlanFeatureVO,
  FeatureSimpleVO,
  FeatureConfigItem,
} from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface ConfigureFeaturesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: PlanVO | null
  onSuccess: () => void
}

interface FeatureWithConfig extends FeatureSimpleVO {
  enabled: boolean
  featureConfig: Record<string, unknown> | null
}

export function ConfigureFeaturesDialog({
  open,
  onOpenChange,
  plan,
  onSuccess,
}: ConfigureFeaturesDialogProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [features, setFeatures] = useState<FeatureWithConfig[]>([])

  useEffect(() => {
    if (open && plan) {
      fetchData(plan.id)
    }
  }, [open, plan])

  const fetchData = async (planId: number) => {
    setLoading(true)
    try {
      // 并行获取所有功能和已配置的功能
      const [allFeaturesRes, planFeaturesRes] = await Promise.all([
        getAllFeatures(),
        getPlanFeatures(planId),
      ])

      if (allFeaturesRes.data.code === 'SUCCESS' && planFeaturesRes.data.code === 'SUCCESS') {
        const allFeatures = allFeaturesRes.data.data || []
        const planFeatures = planFeaturesRes.data.data || []

        // 创建计划功能的映射
        const planFeatureMap = new Map<number, PlanFeatureVO>()
        planFeatures.forEach((pf) => {
          planFeatureMap.set(pf.featureId, pf)
        })

        // 合并所有功能和已配置状态
        const mergedFeatures: FeatureWithConfig[] = allFeatures.map((f) => {
          const planFeature = planFeatureMap.get(f.id)
          return {
            ...f,
            enabled: planFeature?.enabled ?? false,
            featureConfig: planFeature?.featureConfig ?? null,
          }
        })

        setFeatures(mergedFeatures)
      } else {
        toast.error('获取功能列表失败')
      }
    } catch (error) {
      console.error('Fetch features error:', error)
      toast.error('获取功能列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeature = (featureId: number, enabled: boolean) => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === featureId ? { ...f, enabled } : f
      )
    )
  }

  const handleEnableAll = () => {
    setFeatures((prev) => prev.map((f) => ({ ...f, enabled: true })))
  }

  const handleDisableAll = () => {
    setFeatures((prev) => prev.map((f) => ({ ...f, enabled: false })))
  }

  const handleSubmit = async () => {
    if (!plan) return

    setSaving(true)
    try {
      const featureConfigs: FeatureConfigItem[] = features.map((f) => ({
        featureId: f.id,
        enabled: f.enabled,
        featureConfig: f.featureConfig ?? undefined,
      }))

      const res = await configurePlanFeatures(plan.id, { features: featureConfigs })

      if (res.data.code === 'SUCCESS') {
        toast.success('功能配置已保存')
        onOpenChange(false)
        onSuccess()
      } else {
        toast.error(res.data.message || '保存失败')
      }
    } catch (error) {
      console.error('Save features error:', error)
      toast.error('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const enabledCount = features.filter((f) => f.enabled).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>配置计划功能</DialogTitle>
          <DialogDescription>
            {plan ? (
              <>
                为计划 <span className="font-medium">{plan.planName}</span> 配置可用功能
              </>
            ) : (
              '选择该计划可用的功能'
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 py-4">
              {/* 快速操作和统计 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    已启用 {enabledCount} / {features.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEnableAll}
                  >
                    <CheckIcon className="mr-1 size-3" />
                    全选
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisableAll}
                  >
                    <XIcon className="mr-1 size-3" />
                    全不选
                  </Button>
                </div>
              </div>

              <Separator />

              {/* 功能列表 */}
              {features.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  暂无可配置的功能
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className={cn(
                        'flex items-center justify-between rounded-lg border p-4 transition-colors',
                        feature.enabled
                          ? 'border-primary/50 bg-primary/5'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex size-10 items-center justify-center rounded-lg',
                            feature.featureType === 'POINTS'
                              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          )}
                        >
                          {feature.featureType === 'POINTS' ? (
                            <ZapIcon className="size-5" />
                          ) : (
                            <ToggleLeftIcon className="size-5" />
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{feature.featureName}</span>
                            <Badge
                              variant="outline"
                              className="text-xs"
                            >
                              {feature.featureType === 'POINTS' ? '点数型' : '开关型'}
                            </Badge>
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">
                            {feature.featureCode}
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={(checked) =>
                          handleToggleFeature(feature.id, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving && <Loader2Icon className="mr-2 size-4 animate-spin" />}
                保存配置
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
