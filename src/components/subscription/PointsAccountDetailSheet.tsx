import { useEffect, useState } from 'react'
import {
  Loader2Icon,
  CoinsIcon,
  CalendarIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { getPointsAccountDetail } from '@/services/subscription'
import type { PointsAccountDetailVO, BatchStatus, BatchSource } from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface PointsAccountDetailSheetProps {
  teamId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const batchStatusLabels: Record<BatchStatus, string> = {
  ACTIVE: '可用',
  DEPLETED: '已用完',
  EXPIRED: '已过期',
}

const batchStatusColors: Record<BatchStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  DEPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const batchSourceLabels: Record<BatchSource, string> = {
  PURCHASE: '购买',
  GRANT: '赠送',
  SUBSCRIPTION: '订阅',
}

export function PointsAccountDetailSheet({
  teamId,
  open,
  onOpenChange,
}: PointsAccountDetailSheetProps) {
  const [account, setAccount] = useState<PointsAccountDetailVO | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && teamId) {
      setLoading(true)
      getPointsAccountDetail(teamId)
        .then((response) => {
          if (response.code === 'SUCCESS') {
            setAccount(response.data)
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [open, teamId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <CoinsIcon className="size-5" />
            点数账户详情
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : account ? (
          <div className="space-y-6 py-6">
            {/* 账户概览 */}
            <section className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium">
                <CoinsIcon className="size-4" />
                账户概览
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">团队名称</div>
                  <div className="mt-1 font-medium">{account.teamName}</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">总点数</div>
                  <div className="mt-1 text-2xl font-bold">{account.totalPoints}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                  <div className="text-xs text-muted-foreground">可用</div>
                  <div className="mt-1 text-lg font-semibold text-green-600">
                    {account.availablePoints}
                  </div>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                  <div className="text-xs text-muted-foreground">已用</div>
                  <div className="mt-1 text-lg font-semibold text-blue-600">
                    {account.usedPoints}
                  </div>
                </div>
                <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                  <div className="text-xs text-muted-foreground">冻结</div>
                  <div className="mt-1 text-lg font-semibold text-yellow-600">
                    {account.frozenPoints}
                  </div>
                </div>
                <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                  <div className="text-xs text-muted-foreground">过期</div>
                  <div className="mt-1 text-lg font-semibold text-red-600">
                    {account.expiredPoints}
                  </div>
                </div>
              </div>
            </section>

            {/* 批次列表 */}
            {account.batches && account.batches.length > 0 && (
              <section className="space-y-4 border-t pt-4">
                <h3 className="flex items-center gap-2 font-medium">
                  <CalendarIcon className="size-4" />
                  点数批次 ({account.batches.length})
                </h3>
                <div className="space-y-3">
                  {account.batches.map((batch) => (
                    <div
                      key={batch.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <code className="text-sm">{batch.batchNo}</code>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                              batchStatusColors[batch.status]
                            )}
                          >
                            {batchStatusLabels[batch.status] || batch.status}
                          </span>
                        </div>
                        <Badge variant="outline">
                          {batchSourceLabels[batch.source] || batch.source}
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">原始点数: </span>
                          <span className="font-medium">{batch.originalPoints}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">剩余点数: </span>
                          <span className="font-medium">{batch.remainingPoints}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">过期时间: </span>
                          <span>
                            {batch.expireAt
                              ? new Date(batch.expireAt).toLocaleDateString('zh-CN')
                              : '永久'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        创建于 {new Date(batch.createTime).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 时间信息 */}
            <section className="space-y-3 border-t pt-4">
              <h3 className="font-medium">时间信息</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">最后使用时间</span>
                  <span>
                    {account.lastUsedTime
                      ? new Date(account.lastUsedTime).toLocaleString('zh-CN')
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">创建时间</span>
                  <span>
                    {new Date(account.createTime).toLocaleString('zh-CN')}
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
      </SheetContent>
    </Sheet>
  )
}
