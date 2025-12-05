import { useEffect, useState } from 'react'
import { Loader2Icon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { getTransactionList } from '@/services/subscription'
import type { AdminTransactionVO, TransactionType, PointsAccountVO } from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface PointsTransactionsSheetProps {
  account: PointsAccountVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const transactionTypeLabels: Record<TransactionType, string> = {
  PURCHASE: '购买',
  CONSUME: '消费',
  GRANT: '赠送',
  ADJUST: '调整',
  EXPIRE: '过期',
  REFUND: '退款',
}

function formatNumber(num: number | null | undefined): string {
  if (num == null) return '0'
  return num.toLocaleString('zh-CN')
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PointsTransactionsSheet({
  account,
  open,
  onOpenChange,
}: PointsTransactionsSheetProps) {
  const [transactions, setTransactions] = useState<AdminTransactionVO[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && account) {
      setLoading(true)
      getTransactionList({
        page: 1,
        size: 50,
        teamId: account.teamId,
      })
        .then((response) => {
          if (response.code === 'SUCCESS') {
            setTransactions(response.data?.records || [])
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [open, account])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[700px] overflow-y-auto p-0 sm:max-w-2xl">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>点数交易记录</SheetTitle>
          {account && (
            <p className="text-sm text-muted-foreground">
              团队: {account.teamName}
            </p>
          )}
        </SheetHeader>
        <div className="px-6 py-4">
          {loading ? (
            <div className="flex h-[200px] items-center justify-center">
              <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length > 0 ? (
            <div className="rounded-lg border">
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
                          {transactionTypeLabels[transaction.transactionType || transaction.type as TransactionType] || transaction.transactionTypeDesc || transaction.typeDesc || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm max-w-[180px] truncate">
                          {transaction.description || transaction.remark || transaction.batchNo || '-'}
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
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              暂无交易记录
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
