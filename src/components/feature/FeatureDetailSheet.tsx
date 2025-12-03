import { useEffect, useState } from 'react'
import {
  CalendarIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon,
  ToggleLeftIcon,
  CoinsIcon,
  HashIcon,
  FileTextIcon,
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

import { getFeatureDetail } from '@/services/subscription'
import type { FeatureVO, FeatureDetailVO } from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface FeatureDetailSheetProps {
  feature: FeatureVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const featureTypeConfig: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' }> = {
  BOOLEAN: { label: '开关型', icon: <ToggleLeftIcon className="mr-1 size-3" />, variant: 'secondary' },
  POINTS: { label: '点数型', icon: <CoinsIcon className="mr-1 size-3" />, variant: 'default' },
}

export function FeatureDetailSheet({
  feature,
  open,
  onOpenChange,
}: FeatureDetailSheetProps) {
  const [loading, setLoading] = useState(false)
  const [featureDetail, setFeatureDetail] = useState<FeatureDetailVO | null>(null)

  useEffect(() => {
    if (open && feature) {
      fetchFeatureDetail(feature.id)
    }
  }, [open, feature])

  const fetchFeatureDetail = async (id: number) => {
    setLoading(true)
    try {
      const res = await getFeatureDetail(id)
      if (res.data.code === 'SUCCESS') {
        setFeatureDetail(res.data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const typeConfig = featureDetail ? featureTypeConfig[featureDetail.featureType] : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>功能详情</SheetTitle>
          <SheetDescription>查看功能的详细信息</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : featureDetail ? (
          <div className="flex flex-col gap-6 px-4">
            {/* 基本信息 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{featureDetail.featureName}</span>
                <Badge variant={typeConfig?.variant || 'outline'}>
                  {typeConfig?.icon}
                  {typeConfig?.label || featureDetail.featureTypeDesc}
                </Badge>
              </div>
              <CopyableText
                label="功能编码"
                value={featureDetail.featureCode}
                className="font-mono text-sm text-muted-foreground"
              />
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    featureDetail.status
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  )}
                >
                  {featureDetail.status ? '启用' : '禁用'}
                </span>
              </div>
            </div>

            <Separator />

            {/* 功能配置 */}
            <div className="flex flex-col gap-4">
              <h4 className="font-medium">功能配置</h4>

              <div className="grid gap-4">
                <DetailItem
                  icon={<HashIcon className="size-4" />}
                  label="排序值"
                  value={String(featureDetail.sortOrder)}
                />

                {featureDetail.featureType === 'POINTS' && (
                  <DetailItem
                    icon={<CoinsIcon className="size-4" />}
                    label="消耗点数"
                    value={featureDetail.pointsCost !== null ? `${featureDetail.pointsCost} 点/次` : '-'}
                  />
                )}

                {featureDetail.description && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileTextIcon className="size-4" />
                      描述
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-sm">{featureDetail.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* 时间信息 */}
            <div className="grid gap-4">
              <DetailItem
                icon={<CalendarIcon className="size-4" />}
                label="创建时间"
                value={featureDetail.createTime}
              />
              <DetailItem
                icon={<CalendarIcon className="size-4" />}
                label="更新时间"
                value={featureDetail.updateTime}
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
