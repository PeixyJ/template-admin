import { useEffect, useState } from 'react'
import { Loader2Icon, HashIcon, TagIcon, SettingsIcon, CoinsIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { getFeatureDetail } from '@/services/subscription'
import type { FeatureDetailVO, FeatureType } from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface FeatureDetailSheetProps {
  featureId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const featureTypeLabels: Record<FeatureType, string> = {
  BOOLEAN: '开关型',
  POINTS: '点数型',
}

const featureTypeColors: Record<FeatureType, string> = {
  BOOLEAN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  POINTS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

export function FeatureDetailSheet({
  featureId,
  open,
  onOpenChange,
}: FeatureDetailSheetProps) {
  const [feature, setFeature] = useState<FeatureDetailVO | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && featureId) {
      setLoading(true)
      getFeatureDetail(featureId)
        .then((response) => {
          if (response.code === 'SUCCESS') {
            setFeature(response.data)
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [open, featureId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <SettingsIcon className="size-5" />
            功能详情
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : feature ? (
          <div className="space-y-6 py-6">
            {/* 基本信息 */}
            <section className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium">
                <TagIcon className="size-4" />
                基本信息
              </h3>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">功能名称</span>
                  <span className="font-medium">{feature.featureName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">功能编码</span>
                  <code className="rounded bg-muted px-2 py-1 text-sm">
                    {feature.featureCode}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">功能类型</span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      featureTypeColors[feature.featureType]
                    )}
                  >
                    {featureTypeLabels[feature.featureType] || feature.featureType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">状态</span>
                  <Badge variant={feature.status ? 'default' : 'secondary'}>
                    {feature.status ? '启用' : '禁用'}
                  </Badge>
                </div>
              </div>
            </section>

            {/* 配置信息 */}
            <section className="space-y-4 border-t pt-4">
              <h3 className="flex items-center gap-2 font-medium">
                <CoinsIcon className="size-4" />
                配置信息
              </h3>
              <div className="grid gap-3">
                {feature.featureType === 'POINTS' && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">点数消耗</span>
                    <Badge variant="outline">{feature.pointsCost || 0}点/次</Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">排序值</span>
                  <span>{feature.sortOrder}</span>
                </div>
              </div>
            </section>

            {/* 描述 */}
            {feature.description && (
              <section className="space-y-4 border-t pt-4">
                <h3 className="flex items-center gap-2 font-medium">
                  <HashIcon className="size-4" />
                  功能描述
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
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
                    {new Date(feature.createTime).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">更新时间</span>
                  <span>
                    {new Date(feature.updateTime).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">数据版本</span>
                  <span>{feature.dataVersion}</span>
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
