import { useEffect, useState, useCallback } from 'react'
import {
  Loader2Icon,
  CoinsIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  RefreshCwIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { getPointsTransactionList } from '@/services/subscription'
import type { AdminTransactionVO, PointsAccountVO } from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface PointsTransactionsSheetProps {
  account: PointsAccountVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const transactionTypeConfig: Record<string, { label: string; color: string; icon: typeof ArrowUpIcon }> = {
  RECHARGE: { label: '充值', color: 'text-green-600', icon: ArrowUpIcon },
  GRANT: { label: '赠送', color: 'text-green-600', icon: ArrowUpIcon },
  CONSUME: { label: '消费', color: 'text-blue-600', icon: ArrowDownIcon },
  REFUND: { label: '退款', color: 'text-green-600', icon: ArrowUpIcon },
  EXPIRE: { label: '过期', color: 'text-red-600', icon: ArrowDownIcon },
  ADJUST: { label: '调整', color: 'text-purple-600', icon: ArrowUpIcon },
  FREEZE: { label: '冻结', color: 'text-orange-600', icon: ArrowDownIcon },
  UNFREEZE: { label: '解冻', color: 'text-orange-600', icon: ArrowUpIcon },
}

export function PointsTransactionsSheet({
  account,
  open,
  onOpenChange,
}: PointsTransactionsSheetProps) {
  const [transactions, setTransactions] = useState<AdminTransactionVO[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const pageSize = 10

  const fetchTransactions = useCallback(async () => {
    if (!account) return

    setLoading(true)
    try {
      const response = await getPointsTransactionList({
        teamId: account.teamId,
        type: typeFilter === 'all' ? undefined : typeFilter,
        page,
        size: pageSize,
      })
      if (response.data.code === 'SUCCESS') {
        setTransactions(response.data.data?.records || [])
        setTotal(response.data.data?.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }, [account, page, typeFilter])

  useEffect(() => {
    if (open && account) {
      fetchTransactions()
    } else {
      setTransactions([])
      setPage(1)
      setTotal(0)
      setTypeFilter('all')
    }
  }, [open, account, fetchTransactions])

  const totalPages = Math.ceil(total / pageSize)

  const getTransactionConfig = (type: string) => {
    return transactionTypeConfig[type] || { label: type, color: 'text-gray-600', icon: ArrowUpIcon }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>交易记录</SheetTitle>
          <SheetDescription>
            {account ? `查看 ${account.teamName} 的点数交易记录` : '查看点数交易记录'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          {/* Filters */}
          <div className="flex items-center justify-between gap-2">
            <Select value={typeFilter} onValueChange={(value) => {
              setTypeFilter(value)
              setPage(1)
            }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="RECHARGE">充值</SelectItem>
                <SelectItem value="GRANT">赠送</SelectItem>
                <SelectItem value="CONSUME">消费</SelectItem>
                <SelectItem value="REFUND">退款</SelectItem>
                <SelectItem value="EXPIRE">过期</SelectItem>
                <SelectItem value="ADJUST">调整</SelectItem>
                <SelectItem value="FREEZE">冻结</SelectItem>
                <SelectItem value="UNFREEZE">解冻</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchTransactions}
              disabled={loading}
            >
              <RefreshCwIcon className={cn('size-4', loading && 'animate-spin')} />
            </Button>
          </div>

          {/* Transactions List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length > 0 ? (
            <div className="flex flex-col gap-2">
              {transactions.map((tx) => {
                const config = getTransactionConfig(tx.transactionType)
                const Icon = config.icon
                const points = tx.points ?? 0
                const balanceAfter = tx.balanceAfter ?? 0
                const isPositive = points > 0

                return (
                  <div
                    key={tx.id}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'flex size-8 items-center justify-center rounded-full',
                        isPositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                      )}>
                        <Icon className={cn(
                          'size-4',
                          isPositive ? 'text-green-600' : 'text-red-600'
                        )} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn('text-xs', config.color)}>
                            {tx.transactionTypeDesc || config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {tx.sourceType}
                          </span>
                        </div>
                        {tx.description && (
                          <span className="text-xs text-muted-foreground">
                            {tx.description}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(tx.createTime).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn(
                        'text-lg font-semibold',
                        isPositive ? 'text-green-600' : 'text-red-600'
                      )}>
                        {isPositive ? '+' : ''}{points.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CoinsIcon className="size-3" />
                        <span>余额: {balanceAfter.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无交易记录
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">
                共 {total} 条记录
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <span className="text-sm">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
