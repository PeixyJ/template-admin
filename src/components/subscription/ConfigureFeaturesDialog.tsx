import { useEffect, useState } from 'react'
import { Loader2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

import { getFeatureList, configurePlanFeatures } from '@/services/subscription'
import type { PlanVO, FeatureVO, ConfigurePlanFeaturesDTO, PlanFeatureItemVO } from '@/types/subscription.types'

interface ConfigureFeaturesDialogProps {
  plan: PlanVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FeatureConfig {
  featureId: number
  selected: boolean  // 是否选中（绑定到计划）
  enabled: boolean   // 是否启用
}

export function ConfigureFeaturesDialog({
  plan,
  open,
  onOpenChange,
  onSuccess,
}: ConfigureFeaturesDialogProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [allFeatures, setAllFeatures] = useState<FeatureVO[]>([])
  const [featureConfigs, setFeatureConfigs] = useState<FeatureConfig[]>([])

  useEffect(() => {
    if (open && plan) {
      initializeFromPlan(plan)
    }
  }, [open, plan])

  const initializeFromPlan = async (currentPlan: PlanVO) => {
    setLoading(true)
    try {
      // 获取所有启用状态的功能列表
      const allRes = await getFeatureList({ page: 1, size: 1000 })
      const enabledFeatures = allRes.code === 'SUCCESS'
        ? (allRes.data?.records || []).filter((feature: FeatureVO) => feature.status)
        : []
      setAllFeatures(enabledFeatures)

      // 使用 plan.features 来初始化已配置的功能状态
      const planFeatures = currentPlan.features || []

      // 初始化配置 - 基于所有启用的功能
      const configs = enabledFeatures.map((feature: FeatureVO) => {
        const planFeature = planFeatures.find(
          (pf: PlanFeatureItemVO) => pf.featureId === feature.id
        )
        // 如果在 plan.features 中存在，则为选中状态
        const isSelected = !!planFeature
        return {
          featureId: feature.id,
          selected: isSelected,
          enabled: planFeature?.enabled ?? true, // 默认启用
        }
      })
      setFeatureConfigs(configs)
    } catch (error) {
      console.error('Failed to fetch features:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSelected = (featureId: number, selected: boolean) => {
    setFeatureConfigs((prev) =>
      prev.map((config) =>
        config.featureId === featureId ? { ...config, selected } : config
      )
    )
  }

  const handleToggleEnabled = (featureId: number, enabled: boolean) => {
    setFeatureConfigs((prev) =>
      prev.map((config) =>
        config.featureId === featureId ? { ...config, enabled } : config
      )
    )
  }

  const handleSubmit = async () => {
    if (!plan) return

    setSaving(true)
    try {
      // 只提交选中的功能
      const data: ConfigurePlanFeaturesDTO = {
        features: featureConfigs
          .filter((config) => config.selected)
          .map((config) => ({
            featureId: config.featureId,
            enabled: config.enabled,
          })),
      }
      const response = await configurePlanFeatures(plan.id, data)
      if (response.code === 'SUCCESS') {
        onSuccess?.()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Failed to configure features:', error)
    } finally {
      setSaving(false)
    }
  }

  const getFeatureConfig = (featureId: number) => {
    return featureConfigs.find((config) => config.featureId === featureId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            配置功能 - {plan?.planName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              选择此计划包含的功能
            </p>

            <div className="space-y-2">
              {allFeatures.map((feature) => {
                const config = getFeatureConfig(feature.id)
                const isSelected = config?.selected ?? false
                const isEnabled = config?.enabled ?? true

                return (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleToggleSelected(feature.id, checked as boolean)
                        }
                      />
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {feature.featureName}
                          </span>
                          <Badge
                            variant={
                              feature.featureType === 'BOOLEAN' ? 'secondary' : 'outline'
                            }
                          >
                            {feature.featureTypeDesc || (feature.featureType === 'BOOLEAN' ? '开关型' : '点数型')}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {feature.featureCode}
                          {feature.description && ` · ${feature.description}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">
                        {isEnabled ? '启用' : '禁用'}
                      </Label>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) =>
                          handleToggleEnabled(feature.id, checked)
                        }
                        disabled={!isSelected}
                      />
                    </div>
                  </div>
                )
              })}

              {allFeatures.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  暂无可配置的功能
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={saving || loading}>
            {saving && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            保存配置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
