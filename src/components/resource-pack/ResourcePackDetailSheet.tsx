import { useEffect, useState } from 'react'
import {
  CalendarIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon,
  PackageIcon,
  DollarSignIcon,
  ClockIcon,
  SettingsIcon,
  UsersIcon,
  FolderIcon,
  HardDriveIcon,
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

import { getResourcePackDetail } from '@/services/subscription'
import type { AdminPackVO, AdminPackDetailVO, ResourceType, DurationType } from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface ResourcePackDetailSheetProps {
  pack: AdminPackVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const resourceTypeConfig: Record<ResourceType, { label: string; icon: React.ReactNode }> = {
  PROJECT: { label: '项目', icon: <FolderIcon className="size-4" /> },
  MEMBER: { label: '成员', icon: <UsersIcon className="size-4" /> },
  STORAGE: { label: '存储', icon: <HardDriveIcon className="size-4" /> },
}

const durationTypeConfig: Record<DurationType, { label: string; variant: 'default' | 'secondary' }> = {
  PERMANENT: { label: '永久', variant: 'default' },
  TEMPORARY: { label: '临时', variant: 'secondary' },
}

export function ResourcePackDetailSheet({
  pack,
  open,
  onOpenChange,
}: ResourcePackDetailSheetProps) {
  const [loading, setLoading] = useState(false)
  const [packDetail, setPackDetail] = useState<AdminPackDetailVO | null>(null)

  useEffect(() => {
    if (open && pack) {
      fetchPackDetail(pack.id)
    }
  }, [open, pack])

  const fetchPackDetail = async (id: number) => {
    setLoading(true)
    try {
      const res = await getResourcePackDetail(id)
      if (res.data.code === 'SUCCESS') {
        setPackDetail(res.data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'CNY' ? '¥' : '$'
    return `${symbol}${amount.toFixed(2)}`
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>扩容包详情</SheetTitle>
          <SheetDescription>查看扩容包的详细信息</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : packDetail ? (
          <div className="flex flex-col gap-6 px-4">
            {/* 基本信息 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <PackageIcon className="size-5 text-purple-500" />
                <span className="text-lg font-semibold">{packDetail.packName}</span>
                {(() => {
                  const typeConfig = resourceTypeConfig[packDetail.resourceType as ResourceType]
                  return (
                    <Badge variant="outline">
                      {typeConfig?.icon}
                      <span className="ml-1">{typeConfig?.label || packDetail.resourceTypeDesc}</span>
                    </Badge>
                  )
                })()}
              </div>
              <CopyableText
                label="编码"
                value={packDetail.packCode}
                className="font-mono text-sm text-muted-foreground"
              />
              <div className="flex items-center gap-2">
                {(() => {
                  const durConfig = durationTypeConfig[packDetail.durationType as DurationType]
                  return (
                    <Badge variant={durConfig?.variant || 'outline'}>
                      {durConfig?.label || packDetail.durationTypeDesc}
                    </Badge>
                  )
                })()}
                <Badge
                  variant={packDetail.status === 1 ? 'default' : 'destructive'}
                >
                  {packDetail.status === 1 ? '启用' : '禁用'}
                </Badge>
              </div>
              {packDetail.description && (
                <p className="text-sm text-muted-foreground">{packDetail.description}</p>
              )}
            </div>

            <Separator />

            {/* 资源信息 */}
            <div className="flex flex-col gap-4">
              <h4 className="font-medium">资源信息</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={resourceTypeConfig[packDetail.resourceType as ResourceType]?.icon || <PackageIcon className="size-4" />}
                  label="资源类型"
                  value={resourceTypeConfig[packDetail.resourceType as ResourceType]?.label || packDetail.resourceTypeDesc}
                />
                <DetailItem
                  icon={<SettingsIcon className="size-4" />}
                  label="资源数量"
                  value={`${packDetail.resourceAmount} ${packDetail.resourceUnit}`}
                />
              </div>
            </div>

            <Separator />

            {/* 价格信息 */}
            <div className="flex flex-col gap-4">
              <h4 className="font-medium">价格信息</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<DollarSignIcon className="size-4" />}
                  label="当前价格"
                  value={formatCurrency(packDetail.price, packDetail.currency)}
                />
                {packDetail.originalPrice !== null && packDetail.originalPrice !== undefined && (
                  <DetailItem
                    icon={<DollarSignIcon className="size-4" />}
                    label="原价"
                    value={
                      <span className="line-through text-muted-foreground">
                        {formatCurrency(packDetail.originalPrice, packDetail.currency)}
                      </span>
                    }
                  />
                )}
              </div>
            </div>

            <Separator />

            {/* 时效信息 */}
            <div className="flex flex-col gap-4">
              <h4 className="font-medium">时效信息</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<ClockIcon className="size-4" />}
                  label="时效类型"
                  value={durationTypeConfig[packDetail.durationType as DurationType]?.label || packDetail.durationTypeDesc}
                />
                {packDetail.durationType === 'TEMPORARY' && packDetail.durationDays && (
                  <DetailItem
                    icon={<CalendarIcon className="size-4" />}
                    label="有效期"
                    value={`${packDetail.durationDays} 天`}
                  />
                )}
              </div>
            </div>

            <Separator />

            {/* 使用统计 */}
            <div className="flex flex-col gap-4">
              <h4 className="font-medium">使用统计</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<UsersIcon className="size-4" />}
                  label="总分配次数"
                  value={packDetail.totalAllocations.toString()}
                />
                <DetailItem
                  icon={<SettingsIcon className="size-4" />}
                  label="排序"
                  value={packDetail.sortOrder.toString()}
                />
              </div>
            </div>

            <Separator />

            {/* 时间信息 */}
            <div className="grid gap-4">
              <DetailItem
                icon={<CalendarIcon className="size-4" />}
                label="创建时间"
                value={packDetail.createTime}
              />
              <DetailItem
                icon={<CalendarIcon className="size-4" />}
                label="更新时间"
                value={packDetail.updateTime}
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
