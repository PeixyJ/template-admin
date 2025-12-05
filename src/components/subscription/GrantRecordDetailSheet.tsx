import { useEffect, useState } from 'react'
import {
  Loader2Icon,
  GiftIcon,
  CalendarIcon,
  UserIcon,
  AlertCircleIcon,
} from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { getGrantDetail } from '@/services/subscription'
import type { GrantRecordDetailVO, GrantType, GrantRecordStatus } from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface GrantRecordDetailSheetProps {
  grantId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const grantTypeLabels: Record<GrantType, string> = {
  SUBSCRIPTION: '订阅',
  POINTS: '点数',
  RESOURCE: '资源',
  ENTITLEMENT: '权益',
}

const grantTypeColors: Record<GrantType, string> = {
  SUBSCRIPTION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  POINTS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  RESOURCE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ENTITLEMENT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
}

const grantStatusLabels: Record<GrantRecordStatus, string> = {
  ACTIVE: '有效',
  EXPIRED: '已过期',
  REVOKED: '已撤销',
}

const grantStatusColors: Record<GrantRecordStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  REVOKED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export function GrantRecordDetailSheet({
  grantId,
  open,
  onOpenChange,
}: GrantRecordDetailSheetProps) {
  const [record, setRecord] = useState<GrantRecordDetailVO | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && grantId) {
      setLoading(true)
      getGrantDetail(grantId)
        .then((response) => {
          if (response.code === 'SUCCESS') {
            setRecord(response.data)
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [open, grantId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <GiftIcon className="size-5" />
            赠送详情
          </SheetTitle>
        </SheetHeader>
        <div className="px-6">
          {loading ? (
            <div className="flex h-[200px] items-center justify-center">
              <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : record ? (
            <div className="space-y-6">
              {/* 基本信息 */}
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-medium">
                  <GiftIcon className="size-4" />
                  基本信息
                </h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">赠送编号</span>
                    <code className="rounded bg-muted px-2 py-1 text-sm">
                      {record.grantId}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">赠送类型</span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        grantTypeColors[record.grantType]
                      )}
                    >
                      {grantTypeLabels[record.grantType] || record.grantTypeDesc}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">状态</span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        grantStatusColors[record.status]
                      )}
                    >
                      {grantStatusLabels[record.status] || record.statusDesc}
                    </span>
                  </div>
                </div>
              </section>

              {/* 接收方信息 */}
              <section className="space-y-4 border-t pt-4">
                <h3 className="flex items-center gap-2 font-medium">
                  <UserIcon className="size-4" />
                  接收方信息
                </h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">团队</span>
                    <span className="font-medium">{record.teamName}</span>
                  </div>
                </div>
              </section>

              {/* 赠送内容 */}
              <section className="space-y-4 border-t pt-4">
                <h3 className="font-medium">赠送内容</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">赠送内容</span>
                    <span className="font-medium">{record.grantContent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">赠送数量</span>
                    <span>{record.grantAmount}</span>
                  </div>
                  {record.reason && (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">赠送原因</span>
                      <p className="text-sm">{record.reason}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* 生效信息 */}
              <section className="space-y-4 border-t pt-4">
                <h3 className="flex items-center gap-2 font-medium">
                  <CalendarIcon className="size-4" />
                  生效信息
                </h3>
                <div className="grid gap-3">
                  {record.effectiveTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">生效时间</span>
                      <span>{new Date(record.effectiveTime).toLocaleString('zh-CN')}</span>
                    </div>
                  )}
                  {record.expireTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">过期时间</span>
                      <span>{new Date(record.expireTime).toLocaleString('zh-CN')}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* 操作信息 */}
              <section className="space-y-4 border-t pt-4">
                <h3 className="font-medium">操作信息</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">操作人</span>
                    <span>{record.operatorName || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">创建时间</span>
                    <span>{new Date(record.createTime).toLocaleString('zh-CN')}</span>
                  </div>
                </div>
              </section>

              {/* 撤销信息 */}
              {record.status === 'REVOKED' && (
                <section className="space-y-4 border-t pt-4">
                  <h3 className="flex items-center gap-2 font-medium text-destructive">
                    <AlertCircleIcon className="size-4" />
                    撤销信息
                  </h3>
                  <div className="grid gap-3">
                    {record.revokedByName && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">撤销人</span>
                        <span>{record.revokedByName}</span>
                      </div>
                    )}
                    {record.revokedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">撤销时间</span>
                        <span>{new Date(record.revokedAt).toLocaleString('zh-CN')}</span>
                      </div>
                    )}
                    {record.revokeReason && (
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">撤销原因</span>
                        <p className="text-sm text-destructive">{record.revokeReason}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* 备注 */}
              {record.remark && (
                <section className="space-y-3 border-t pt-4">
                  <h3 className="font-medium">备注</h3>
                  <p className="text-sm text-muted-foreground">{record.remark}</p>
                </section>
              )}

              {/* 时间信息 */}
              <section className="space-y-3 border-t pt-4">
                <h3 className="font-medium">时间信息</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">创建时间</span>
                    <span>
                      {new Date(record.createTime).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">更新时间</span>
                    <span>
                      {new Date(record.updateTime).toLocaleString('zh-CN')}
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
