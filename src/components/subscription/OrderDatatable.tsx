import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  EyeIcon,
  XIcon,
  RefreshCwIcon,
  CreditCardIcon,
} from 'lucide-react'

import type {
  Column,
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'
import type { AdminOrderVO, OrderType, PayStatus, PayChannel } from '@/types/subscription.types'

interface OrderDatatableProps {
  data: AdminOrderVO[]
  loading?: boolean
  onViewDetail?: (order: AdminOrderVO) => void
  onCancel?: (order: AdminOrderVO) => void
  onRefund?: (order: AdminOrderVO) => void
  onConfirmPayment?: (order: AdminOrderVO) => void
  onRowClick?: (order: AdminOrderVO) => void
}

const orderTypeLabels: Record<OrderType, string> = {
  SUBSCRIPTION: '订阅',
  POINTS_PACK: '点数包',
  RESOURCE_PACK: '扩容包',
}

const orderTypeColors: Record<OrderType, string> = {
  SUBSCRIPTION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  POINTS_PACK: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  RESOURCE_PACK: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

const payStatusLabels: Record<PayStatus, string> = {
  PENDING: '待支付',
  PAID: '已支付',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDING: '退款中',
  REFUNDED: '已退款',
  CLOSED: '已关闭',
}

const payStatusColors: Record<PayStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  PAID: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  REFUNDING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  REFUNDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  CLOSED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const payChannelLabels: Record<PayChannel, string> = {
  ALIPAY: '支付宝',
  WECHAT: '微信',
  STRIPE: 'Stripe',
}

const columns: ColumnDef<AdminOrderVO>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-label="全选"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="选择行"
      />
    ),
  },
  {
    header: '订单信息',
    accessorKey: 'orderNo',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onRowClick?: (order: AdminOrderVO) => void
      }
      return (
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            className="text-left font-medium hover:text-primary hover:underline"
            onClick={() => meta?.onRowClick?.(row.original)}
          >
            {row.original.orderNo}
          </button>
          <span className="text-xs text-muted-foreground">
            {row.original.productName}
          </span>
        </div>
      )
    },
  },
  {
    header: '类型',
    accessorKey: 'orderType',
    cell: ({ row }) => {
      const type = row.getValue('orderType') as OrderType
      return (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            orderTypeColors[type]
          )}
        >
          {orderTypeLabels[type] || row.original.orderTypeDesc}
        </span>
      )
    },
  },
  {
    header: '团队',
    accessorKey: 'teamName',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span>{row.original.teamName}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.userNickname}
        </span>
      </div>
    ),
  },
  {
    header: '金额',
    accessorKey: 'payAmount',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">
          {row.original.currency === 'CNY' ? '¥' : '$'}
          {row.original.payAmount.toFixed(2)}
        </span>
        {row.original.discountAmount > 0 && (
          <span className="text-xs text-green-600">
            -¥{row.original.discountAmount.toFixed(2)}
          </span>
        )}
      </div>
    ),
  },
  {
    header: '支付状态',
    accessorKey: 'payStatus',
    cell: ({ row }) => {
      const status = row.getValue('payStatus') as PayStatus
      return (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            payStatusColors[status]
          )}
        >
          {payStatusLabels[status] || row.original.payStatusDesc}
        </span>
      )
    },
  },
  {
    header: '支付渠道',
    accessorKey: 'payChannel',
    cell: ({ row }) => {
      const channel = row.getValue('payChannel') as PayChannel | null
      return channel ? (
        <Badge variant="outline">
          {payChannelLabels[channel] || row.original.payChannelDesc}
        </Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    header: '创建时间',
    accessorKey: 'createTime',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.getValue('createTime')).toLocaleString('zh-CN')}
      </span>
    ),
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onViewDetail?: (order: AdminOrderVO) => void
        onCancel?: (order: AdminOrderVO) => void
        onRefund?: (order: AdminOrderVO) => void
        onConfirmPayment?: (order: AdminOrderVO) => void
      }
      const order = row.original
      const canCancel = order.payStatus === 'PENDING'
      const canRefund = order.payStatus === 'PAID' || order.payStatus === 'COMPLETED'
      const canConfirm = order.payStatus === 'PENDING'

      return (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => meta?.onViewDetail?.(order)}
                  title="查看详情"
                >
                  <EyeIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>查看详情</TooltipContent>
            </Tooltip>

            {canConfirm && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => meta?.onConfirmPayment?.(order)}
                    title="确认支付"
                  >
                    <CreditCardIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>确认支付</TooltipContent>
              </Tooltip>
            )}

            {canRefund && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => meta?.onRefund?.(order)}
                    title="退款"
                  >
                    <RefreshCwIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>退款</TooltipContent>
              </Tooltip>
            )}

            {canCancel && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => meta?.onCancel?.(order)}
                    title="取消"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>取消订单</TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      )
    },
  },
]

export function OrderDatatable({
  data,
  loading,
  onViewDetail,
  onCancel,
  onRefund,
  onConfirmPayment,
  onRowClick,
}: OrderDatatableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const pageSize = 10

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      pagination,
    },
    meta: {
      onViewDetail,
      onCancel,
      onRefund,
      onConfirmPayment,
      onRowClick,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
  })

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 3,
  })

  return (
    <div className="w-full">
      <div className="border-b">
        <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-6 py-3">
          <span className="font-medium">订单列表</span>
          <Filter column={table.getColumn('orderNo')!} />
        </div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-14 border-t">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-muted-foreground first:w-12 first:pl-4 last:px-4"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2Icon className="size-5 animate-spin" />
                    <span>加载中...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="h-16 first:w-12 first:pl-4 last:px-4"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3 px-6 py-4 max-sm:flex-col">
        <p
          className="whitespace-nowrap text-sm text-muted-foreground"
          aria-live="polite"
        >
          显示{' '}
          <span>
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{' '}
            到{' '}
            {Math.min(
              Math.max(
                table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  table.getState().pagination.pageSize,
                0
              ),
              table.getRowCount()
            )}
          </span>{' '}
          条，共 <span>{table.getRowCount().toString()} 条</span>
        </p>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  className="disabled:pointer-events-none disabled:opacity-50"
                  variant="ghost"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="上一页"
                >
                  <ChevronLeftIcon aria-hidden="true" />
                  上一页
                </Button>
              </PaginationItem>

              {showLeftEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {pages.map((page) => {
                const isActive =
                  page === table.getState().pagination.pageIndex + 1

                return (
                  <PaginationItem key={page}>
                    <Button
                      size="icon"
                      variant={isActive ? 'default' : 'ghost'}
                      className={cn(
                        !isActive &&
                          'bg-primary/10 text-primary hover:bg-primary/20'
                      )}
                      onClick={() => table.setPageIndex(page - 1)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {page}
                    </Button>
                  </PaginationItem>
                )
              })}

              {showRightEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <Button
                  className="disabled:pointer-events-none disabled:opacity-50"
                  variant="ghost"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="下一页"
                >
                  下一页
                  <ChevronRightIcon aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}

function Filter({ column }: { column: Column<AdminOrderVO, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()

  return (
    <div>
      <Label htmlFor={`${id}-input`} className="sr-only">
        搜索订单
      </Label>
      <Input
        id={`${id}-input`}
        value={(columnFilterValue ?? '') as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder="搜索订单编号..."
        type="text"
        className="w-[200px]"
      />
    </div>
  )
}
