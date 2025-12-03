import { useEffect, useState } from 'react'
import {
  CalendarIcon,
  CoinsIcon,
  Loader2Icon,
  UsersIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  LockIcon,
  AlertCircleIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { getPointsAccountDetail } from '@/services/subscription'
import type { PointsAccountDetailVO, BatchVO } from '@/types/subscription.types'

interface PointsAccountDetailSheetProps {
  teamId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
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
      fetchAccountData(teamId)
    } else {
      setAccount(null)
    }
  }, [open, teamId])

  const fetchAccountData = async (id: number) => {
    setLoading(true)
    try {
      const response = await getPointsAccountDetail(id)
      if (response.data.code === 'SUCCESS') {
        setAccount(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch points account data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUsagePercentage = () => {
    if (!account || account.totalPoints === 0) return 0
    return Math.round((account.usedPoints / account.totalPoints) * 100)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>点数账户详情</SheetTitle>
          <SheetDescription>查看团队点数账户的完整信息</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : account ? (
          <div className="flex flex-col gap-6 px-4">
            {/* Team Header */}
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <UsersIcon className="size-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-lg">{account.teamName}</span>
                <span className="text-sm text-muted-foreground">
                  团队 ID: {account.teamId}
                </span>
              </div>
            </div>

            {/* Points Overview */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CoinsIcon className="size-5 text-amber-500" />
                  <span className="font-medium">可用点数</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {account.availablePoints.toLocaleString()}
                </span>
              </div>

              {/* Usage Progress */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">使用率</span>
                  <span className="font-medium">{getUsagePercentage()}%</span>
                </div>
                <Progress value={getUsagePercentage()} className="h-2" />
              </div>
            </div>

            {/* Points Statistics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
                <div className="flex items-center gap-1.5">
                  <TrendingUpIcon className="size-4 text-green-600" />
                  <span className="text-xs text-muted-foreground">总获得</span>
                </div>
                <span className="text-lg font-semibold text-green-600">
                  +{account.totalPoints.toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                <div className="flex items-center gap-1.5">
                  <TrendingDownIcon className="size-4 text-blue-600" />
                  <span className="text-xs text-muted-foreground">已使用</span>
                </div>
                <span className="text-lg font-semibold text-blue-600">
                  -{account.usedPoints.toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 p-3">
                <div className="flex items-center gap-1.5">
                  <LockIcon className="size-4 text-orange-600" />
                  <span className="text-xs text-muted-foreground">已冻结</span>
                </div>
                <span className="text-lg font-semibold text-orange-600">
                  {account.frozenPoints.toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-1 rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
                <div className="flex items-center gap-1.5">
                  <AlertCircleIcon className="size-4 text-red-600" />
                  <span className="text-xs text-muted-foreground">已过期</span>
                </div>
                <span className="text-lg font-semibold text-red-600">
                  {account.expiredPoints.toLocaleString()}
                </span>
              </div>
            </div>

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
                      {new Date(account.createTime).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">最近使用</span>
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="size-3.5 text-muted-foreground" />
                    <span className="text-sm">
                      {account.lastUsedTime
                        ? new Date(account.lastUsedTime).toLocaleString('zh-CN')
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Batches */}
            {account.batches && account.batches.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">点数批次</h4>
                    <Badge variant="outline">{account.batches.length} 批</Badge>
                  </div>

                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    {account.batches.map((batch: BatchVO) => (
                      <div
                        key={batch.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <CoinsIcon className="size-4 text-amber-500" />
                            <span className="text-sm font-medium">
                              {batch.remainingPoints.toLocaleString()} / {batch.points.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            来源: {batch.source}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(batch.createTime).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {batch.expireDate ? (
                            <Badge
                              variant={
                                new Date(batch.expireDate) < new Date()
                                  ? 'destructive'
                                  : 'outline'
                              }
                              className="text-xs"
                            >
                              {new Date(batch.expireDate) < new Date()
                                ? '已过期'
                                : `${new Date(batch.expireDate).toLocaleDateString('zh-CN')} 到期`}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              永久有效
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">
            未找到账户信息
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
