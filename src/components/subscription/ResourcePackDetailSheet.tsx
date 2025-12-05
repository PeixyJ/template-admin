import { useEffect, useState } from 'react'
import {
  Loader2Icon,
  PackageIcon,
  CalendarIcon,
  CreditCardIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { getPackDetail } from '@/services/subscription'
import type { AdminPackDetailVO, ResourceType } from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface ResourcePackDetailSheetProps {
  packId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const resourceTypeLabels: Record<ResourceType, string> = {
  PROJECT: '项目数',
  MEMBER: '成员数',
  STORAGE: '存储空间',
}

const resourceTypeColors: Record<ResourceType, string> = {
  PROJECT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  MEMBER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  STORAGE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

export function ResourcePackDetailSheet({
  packId,
  open,
  onOpenChange,
}: ResourcePackDetailSheetProps) {
  const [pack, setPack] = useState<AdminPackDetailVO | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && packId) {
      setLoading(true)
      getPackDetail(packId)
        .then((response) => {
          if (response.code === 'SUCCESS') {
            setPack(response.data)
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [open, packId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <PackageIcon className="size-5" />
            资源包详情
          </SheetTitle>
        </SheetHeader>
        <div className="px-6">
          {loading ? (
            <div className="flex h-[200px] items-center justify-center">
              <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : pack ? (
            <div className="space-y-6 pb-6">
              {/* 基本信息 */}
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-medium">
                  <PackageIcon className="size-4" />
                  基本信息
                </h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">资源包名称</span>
                    <span className="font-medium">{pack.packName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">编码</span>
                    <code className="rounded bg-muted px-2 py-1 text-sm">
                      {pack.packCode}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">资源类型</span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        resourceTypeColors[pack.resourceType]
                      )}
                    >
                      {resourceTypeLabels[pack.resourceType] || pack.resourceTypeDesc}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">资源额度</span>
                    <span className="font-medium tabular-nums">{pack.resourceAmount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">可见性</span>
                    <Badge variant={pack.isVisible ? 'default' : 'secondary'}>
                      {pack.isVisible ? '可见' : '隐藏'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">状态</span>
                    <Badge variant={pack.status ? 'default' : 'secondary'}>
                      {pack.status ? '启用' : '禁用'}
                    </Badge>
                  </div>
                </div>
              </section>

              {/* 价格信息 */}
              <section className="space-y-4 border-t pt-4">
                <h3 className="flex items-center gap-2 font-medium">
                  <CreditCardIcon className="size-4" />
                  价格信息
                </h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">售价</span>
                    <span className="text-xl font-bold tabular-nums">
                      {pack.currency === 'CNY' ? '¥' : '$'}
                      {pack.price.toFixed(2)}
                    </span>
                  </div>
                  {pack.originalPrice != null && pack.originalPrice > pack.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">原价</span>
                      <span className="text-muted-foreground line-through tabular-nums">
                        {pack.currency === 'CNY' ? '¥' : '$'}
                        {pack.originalPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
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
                    <span className="text-muted-foreground">有效期</span>
                    <Badge variant="outline">
                      {pack.durationDays === null ? '永久' : `${pack.durationDays}天`}
                    </Badge>
                  </div>
                </div>
              </section>

              {/* 统计信息 */}
              <section className="space-y-4 border-t pt-4">
                <h3 className="font-medium">统计信息</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold tabular-nums">{pack.totalAllocations}</div>
                    <div className="text-xs text-muted-foreground">总分配</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold tabular-nums">{pack.totalPurchases}</div>
                    <div className="text-xs text-muted-foreground">购买数</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold tabular-nums">{pack.totalGrants}</div>
                    <div className="text-xs text-muted-foreground">赠送数</div>
                  </div>
                </div>
              </section>

              {/* 描述 */}
              {pack.description && (
                <section className="space-y-4 border-t pt-4">
                  <h3 className="font-medium">描述</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pack.description}
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
                      {new Date(pack.createTime).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">更新时间</span>
                    <span>
                      {new Date(pack.updateTime).toLocaleString('zh-CN')}
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
        </div>
      </SheetContent>
    </Sheet>
  )
}
