import { useState } from 'react'
import {
  Loader2Icon,
  CoinsIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  UserIcon,
  ActivityIcon,
  ClockIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { PointsAccountVO, BatchVO, TransactionVO } from '@/types/subscription.types'
import { cn } from '@/lib/utils'
import { SetBatchExpiryDialog } from './SetBatchExpiryDialog'

interface PointsAccountDetailSheetProps {
  account: PointsAccountVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  loading?: boolean
  onRefresh?: () => void
}

function formatNumber(num: number | null | undefined): string {
  if (num == null) return '0'
  return num.toLocaleString('zh-CN')
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 统计卡片组件
function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string
  value: number
  color: 'green' | 'blue' | 'yellow' | 'red' | 'gray'
  icon?: React.ComponentType<{ className?: string }>
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20',
    gray: 'bg-gray-50 text-gray-600 dark:bg-gray-900/20',
  }

  return (
    <div className={cn('rounded-lg p-3', colorClasses[color])}>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {Icon && <Icon className="size-3" />}
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{formatNumber(value)}</div>
    </div>
  )
}

// 批次卡片组件
function BatchCard({
  batch,
  onSetExpiry
}: {
  batch: BatchVO
  onSetExpiry?: (batch: BatchVO) => void
}) {
  const usagePercent = batch.totalPoints > 0
    ? ((batch.totalPoints - batch.remainingPoints) / batch.totalPoints) * 100
    : 0
  const isExpiringSoon = batch.expireTime &&
    new Date(batch.expireTime).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
  const isActive = batch.status === 'ACTIVE'

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono">{batch.batchNo}</code>
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className={cn('text-xs', isActive && 'bg-green-500')}
          >
            {batch.statusDesc}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {batch.sourceDesc}
          </Badge>
          {isActive && onSetExpiry && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onSetExpiry(batch)}
            >
              <ClockIcon className="mr-1 size-3" />
              设置过期
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">使用进度</span>
          <span>
            {formatNumber(batch.usedPoints)} / {formatNumber(batch.totalPoints)}
          </span>
        </div>
        <Progress value={usagePercent} className="h-2" />
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">剩余点数</div>
          <div className="font-medium text-green-600">
            {formatNumber(batch.remainingPoints)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">已使用</div>
          <div className="font-medium">{formatNumber(batch.usedPoints)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">过期时间</div>
          <div className={cn('font-medium', isExpiringSoon && 'text-orange-500')}>
            {batch.expireTime ? formatDate(batch.expireTime) : '永久'}
            {isExpiringSoon && (
              <AlertTriangleIcon className="ml-1 inline size-3" />
            )}
          </div>
        </div>
      </div>

      {batch.packName && (
        <div className="text-xs text-muted-foreground">
          点数包: {batch.packName}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        创建于 {formatDateTime(batch.createTime)}
      </div>
    </div>
  )
}

// 交易记录表格组件
function TransactionsTable({ transactions }: { transactions: TransactionVO[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10"></TableHead>
          <TableHead className="w-[60px]">类型</TableHead>
          <TableHead>描述</TableHead>
          <TableHead className="text-right w-[90px]">点数</TableHead>
          <TableHead className="text-right w-[90px]">余额</TableHead>
          <TableHead className="text-right w-[100px]">时间</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => {
          const isPositive = transaction.points > 0
          return (
            <TableRow key={transaction.id}>
              <TableCell className="pr-0">
                {isPositive ? (
                  <TrendingUpIcon className="size-4 text-green-600" />
                ) : (
                  <TrendingDownIcon className="size-4 text-red-600" />
                )}
              </TableCell>
              <TableCell className="text-xs">
                {transaction.typeDesc}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm max-w-[180px] truncate">
                {transaction.featureName || transaction.remark || '-'}
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={cn(
                    'font-medium tabular-nums',
                    isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {isPositive ? '+' : ''}{formatNumber(transaction.points)}
                </span>
              </TableCell>
              <TableCell className="text-right text-muted-foreground tabular-nums">
                {formatNumber(transaction.balanceAfter)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground text-xs">
                {formatDateTime(transaction.createTime)}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export function PointsAccountDetailSheet({
  account,
  open,
  onOpenChange,
  loading,
  onRefresh,
}: PointsAccountDetailSheetProps) {
  const [expiryDialogOpen, setExpiryDialogOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<BatchVO | null>(null)

  const handleSetExpiry = (batch: BatchVO) => {
    setSelectedBatch(batch)
    setExpiryDialogOpen(true)
  }

  const handleExpirySuccess = () => {
    onRefresh?.()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[700px] overflow-y-auto p-0 sm:max-w-2xl">
        <div className="">
          <SheetHeader className="border-b py-4">
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
          <div className="space-y-6 px-6 py-6">
            {/* 账户概览 */}
            <section className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                  'rounded-lg border-2 p-4',
                  account.status
                    ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
                    : 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
                )}>
                  <div className={cn(
                    'flex items-center gap-2 text-sm',
                    account.status ? 'text-green-600' : 'text-red-600'
                  )}>
                    <UserIcon className="size-4" />
                    团队信息
                  </div>
                  <div className="mt-2">
                    <div className="font-medium">{account.teamName}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {account.teamId} · 负责人: {account.ownerName}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">总余额</div>
                  <div className="mt-1 text-3xl font-bold">
                    {formatNumber(account.totalBalance)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <StatCard
                  label="可用余额"
                  value={account.availableBalance}
                  color="green"
                />
                <StatCard
                  label="冻结余额"
                  value={account.frozenBalance}
                  color="yellow"
                />
                <StatCard
                  label="即将过期"
                  value={account.expiringPoints}
                  color="red"
                  icon={AlertTriangleIcon}
                />
                <StatCard
                  label="活跃批次"
                  value={account.activeBatchCount}
                  color="blue"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-4 gap-3">
                <StatCard
                  label="累计获得"
                  value={account.totalEarned}
                  color="green"
                  icon={TrendingUpIcon}
                />
                <StatCard
                  label="累计消费"
                  value={account.totalConsumed}
                  color="red"
                  icon={TrendingDownIcon}
                />
                <StatCard
                  label="累计过期"
                  value={account.totalExpired}
                  color="gray"
                />
                <StatCard
                  label="累计调整"
                  value={account.totalAdjusted}
                  color="blue"
                />
              </div>
            </section>

            {/* 详细信息 Tabs */}
            <Tabs defaultValue="batches" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="batches" className="gap-2">
                  <CalendarIcon className="size-4" />
                  点数批次 ({account.activeBatches?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="transactions" className="gap-2">
                  <ActivityIcon className="size-4" />
                  最近交易 ({account.recentTransactions?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="batches" className="mt-4 space-y-3">
                {account.activeBatches && account.activeBatches.length > 0 ? (
                  account.activeBatches.map((batch) => (
                    <BatchCard
                      key={batch.id}
                      batch={batch}
                      onSetExpiry={handleSetExpiry}
                    />
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    暂无活跃批次
                  </div>
                )}
              </TabsContent>

              <TabsContent value="transactions" className="mt-4">
                {account.recentTransactions && account.recentTransactions.length > 0 ? (
                  <div className="rounded-lg border">
                    <TransactionsTable transactions={account.recentTransactions} />
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    暂无交易记录
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* 时间信息 */}
            <section className="space-y-3 border-t pt-4">
              <h3 className="font-medium">时间信息</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">最后交易时间</span>
                  <span>{formatDateTime(account.lastTransactionTime)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">账户创建时间</span>
                  <span>{formatDateTime(account.createTime)}</span>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center px-6 text-muted-foreground">
            无数据
          </div>
        )}
        </div>

        <SetBatchExpiryDialog
          batch={selectedBatch}
          open={expiryDialogOpen}
          onOpenChange={setExpiryDialogOpen}
          onSuccess={handleExpirySuccess}
        />
      </SheetContent>
    </Sheet>
  )
}
