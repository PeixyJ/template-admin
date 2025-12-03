import { useEffect, useState } from 'react'
import {
  CalendarIcon,
  GiftIcon,
  UsersIcon,
  UserIcon,
  PackageIcon,
  Loader2Icon,
  TagIcon,
  XCircleIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  ClockIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { getGrantRecordDetail } from '@/services/subscription'
import type { GrantRecordDetailVO } from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface GrantRecordDetailSheetProps {
  grantId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const grantTypeConfig: Record<string, { label: string; color: string }> = {
  SUBSCRIPTION: { label: '订阅', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  POINTS: { label: '点数', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  RESOURCE_PACK: { label: '扩容包', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  QUOTA: { label: '配额', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
}

const grantCategoryConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  VIP: { label: 'VIP', variant: 'default' },
  PROMOTION: { label: '促销', variant: 'secondary' },
  COMPENSATION: { label: '补偿', variant: 'outline' },
  OTHER: { label: '其他', variant: 'outline' },
}

const grantStatusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PENDING: { label: '待处理', icon: ClockIcon, color: 'text-yellow-600' },
  SUCCESS: { label: '成功', icon: CheckCircle2Icon, color: 'text-green-600' },
  FAILED: { label: '失败', icon: AlertCircleIcon, color: 'text-red-600' },
  REVOKED: { label: '已撤销', icon: XCircleIcon, color: 'text-red-600' },
}

export function GrantRecordDetailSheet({ grantId, open, onOpenChange }: GrantRecordDetailSheetProps) {
  const [grant, setGrant] = useState<GrantRecordDetailVO | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && grantId) {
      fetchGrantData(grantId)
    } else {
      setGrant(null)
    }
  }, [open, grantId])

  const fetchGrantData = async (id: number) => {
    setLoading(true)
    try {
      const response = await getGrantRecordDetail(id)
      if (response.data.code === 'SUCCESS') {
        setGrant(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch grant data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatusIcon = grant ? grantStatusConfig[grant.status]?.icon : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>赠送详情</SheetTitle>
          <SheetDescription>查看赠送记录完整信息</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : grant ? (
          <div className="flex flex-col gap-6 px-4">
            {/* Grant Header */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <GiftIcon className="size-5 text-pink-500" />
                  <span className="font-mono text-sm font-medium">{grant.grantNo}</span>
                </div>
                {grant.batchNo && (
                  <span className="text-xs text-muted-foreground">
                    批次号: {grant.batchNo}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {StatusIcon && (
                  <StatusIcon className={cn('size-4', grantStatusConfig[grant.status]?.color)} />
                )}
                <span className={cn('text-sm font-medium', grantStatusConfig[grant.status]?.color)}>
                  {grantStatusConfig[grant.status]?.label || grant.statusDesc}
                </span>
              </div>
            </div>

            {/* Grant Type & Category */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(grantTypeConfig[grant.grantType]?.color)}
              >
                {grantTypeConfig[grant.grantType]?.label || grant.grantTypeDesc}
              </Badge>
              <Badge variant={grantCategoryConfig[grant.grantCategory]?.variant || 'outline'}>
                {grantCategoryConfig[grant.grantCategory]?.label || grant.grantCategoryDesc}
              </Badge>
            </div>

            {/* Product Info */}
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <PackageIcon className="size-6 text-primary" />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-medium">{grant.productName || '点数/配额'}</span>
                  <span className="text-sm text-muted-foreground">
                    数量: x{grant.quantity}
                  </span>
                  <span className="text-sm font-medium text-primary">
                    原价值: ¥{grant.originalValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Recipient Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">接收团队</span>
                <div className="flex items-center gap-2">
                  <UsersIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{grant.teamName}</span>
                </div>
                <span className="text-xs text-muted-foreground">ID: {grant.teamId}</span>
              </div>

              {grant.userName && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">接收用户</span>
                  <div className="flex items-center gap-2">
                    <UserIcon className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{grant.userName}</span>
                  </div>
                  {grant.userId && (
                    <span className="text-xs text-muted-foreground">ID: {grant.userId}</span>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Operator Info */}
            <div className="flex flex-col gap-3">
              <h4 className="font-medium">操作信息</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">操作人</span>
                  <div className="flex items-center gap-2">
                    <UserIcon className="size-4 text-muted-foreground" />
                    <span className="text-sm">{grant.grantedByName}</span>
                  </div>
                </div>

                {grant.relatedId && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">关联记录ID</span>
                    <span className="text-sm font-mono">{grant.relatedId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Grant Reason */}
            {grant.grantReason && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <h4 className="font-medium">赠送原因</h4>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground">{grant.grantReason}</p>
                  </div>
                </div>
              </>
            )}

            {/* Remark */}
            {grant.remark && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <h4 className="font-medium">备注</h4>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground">{grant.remark}</p>
                  </div>
                </div>
              </>
            )}

            {/* Revoke Info */}
            {grant.status === 'REVOKED' && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h4 className="font-medium text-destructive">撤销信息</h4>
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">撤销人</span>
                        <span className="text-sm">{grant.revokedByName || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">撤销时间</span>
                        <span className="text-sm">
                          {grant.revokedAt
                            ? new Date(grant.revokedAt).toLocaleString('zh-CN')
                            : '-'}
                        </span>
                      </div>
                      {grant.revokeReason && (
                        <div className="flex flex-col gap-1 pt-2">
                          <span className="text-sm text-muted-foreground">撤销原因</span>
                          <p className="text-sm">{grant.revokeReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Time Info */}
            <div className="flex flex-col gap-3">
              <h4 className="font-medium">时间信息</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">创建时间</span>
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="size-3.5 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(grant.createTime).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>

                {grant.grantedAt && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">赠送时间</span>
                    <div className="flex items-center gap-1.5">
                      <GiftIcon className="size-3.5 text-pink-500" />
                      <span className="text-sm">
                        {new Date(grant.grantedAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">更新时间</span>
                  <div className="flex items-center gap-1.5">
                    <TagIcon className="size-3.5 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(grant.updateTime).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">
            未找到赠送记录信息
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
