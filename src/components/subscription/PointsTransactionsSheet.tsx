import { useEffect, useState } from 'react'
import { Loader2Icon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

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

const transactionTypeColors: Record<TransactionType, string> = {
  PURCHASE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  CONSUME: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  GRANT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ADJUST: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  EXPIRE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  REFUND: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
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
      <SheetContent className="w-[600px] overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>点数交易记录</SheetTitle>
          {account && (
            <p className="text-sm text-muted-foreground">
              团队: {account.teamName}
            </p>
          )}
        </SheetHeader>

        {loading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4 py-6">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {transaction.points > 0 ? (
                      <ArrowUpIcon className="size-4 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="size-4 text-red-500" />
                    )}
                    <span
                      className={cn(
                        'text-lg font-semibold',
                        transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      transactionTypeColors[transaction.transactionType]
                    )}
                  >
                    {transactionTypeLabels[transaction.transactionType] || transaction.transactionTypeDesc}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">交易前: </span>
                    <span>{transaction.balanceBefore}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">交易后: </span>
                    <span>{transaction.balanceAfter}</span>
                  </div>
                </div>

                {transaction.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {transaction.description}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <code>{transaction.transactionNo}</code>
                  <span>{new Date(transaction.createTime).toLocaleString('zh-CN')}</span>
                </div>

                {transaction.userNickname && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    操作用户: {transaction.userNickname}
                  </div>
                )}

                {transaction.batchNo && (
                  <Badge variant="outline" className="mt-2">
                    批次: {transaction.batchNo}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            暂无交易记录
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
