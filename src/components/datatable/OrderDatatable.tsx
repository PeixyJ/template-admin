import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  Loader2Icon,
  RefreshCwIcon,
  EyeIcon,
  XCircleIcon,
  ReceiptIcon,
  CheckCircleIcon,
  UsersIcon,
  CreditCardIcon,
  DownloadIcon,
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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'
import type { AdminOrderVO } from '@/types/subscription.types'

interface OrderDatatableProps {
  data: AdminOrderVO[]
  loading?: boolean
  onView?: (order: AdminOrderVO) => void
  onCancel?: (order: AdminOrderVO) => void
  onRefund?: (order: AdminOrderVO) => void
  onConfirmPayment?: (order: AdminOrderVO) => void
  onExport?: () => void
  onRefresh?: () => void
}

const payStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  UNPAID: { label: '待支付', variant: 'outline' },
  PAYING: { label: '支付中', variant: 'secondary' },
  PAID: { label: '已支付', variant: 'default' },
  CLOSED: { label: '已关闭', variant: 'destructive' },
  REFUNDED: { label: '已退款', variant: 'destructive' },
}

const orderTypeConfig: Record<string, { label: string }> = {
  SUBSCRIPTION: { label: '订阅' },
  POINTS: { label: '点数' },
  RESOURCE_PACK: { label: '扩容包' },
}

const columns: ColumnDef<AdminOrderVO>[] = [
  {
    header: '订单信息',
    accessorKey: 'orderNo',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-sm">{row.original.orderNo}</span>
        <Badge variant="outline" className="w-fit text-xs">
          {orderTypeConfig[row.original.orderType]?.label || row.original.orderTypeDesc}
        </Badge>
      </div>
    ),
  },
  {
    header: '商品',
    accessorKey: 'productName',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{row.original.productName}</span>
        <span className="text-xs text-muted-foreground">
          x{row.original.quantity}
        </span>
      </div>
    ),
  },
  {
    header: '下单用户',
    accessorKey: 'userNickname',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span>{row.original.userNickname}</span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <UsersIcon className="size-3" />
          <span>{row.original.teamName}</span>
        </div>
      </div>
    ),
  },
  {
    header: '金额',
    accessorKey: 'payAmount',
    cell: ({ row }) => {
      const currencySymbol = row.original.currency === 'CNY' ? '¥' : '$'
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">
            {currencySymbol}{row.original.payAmount.toFixed(2)}
          </span>
          {row.original.discountAmount > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              {currencySymbol}{row.original.amount.toFixed(2)}
            </span>
          )}
        </div>
      )
    },
  },
  {
    header: '支付状态',
    accessorKey: 'payStatus',
    cell: ({ row }) => {
      const config = payStatusConfig[row.original.payStatus]
      return (
        <Badge variant={config?.variant || 'outline'}>
          {config?.label || row.original.payStatusDesc}
        </Badge>
      )
    },
  },
  {
    header: '支付渠道',
    accessorKey: 'payChannel',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <CreditCardIcon className="size-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {row.original.payChannelDesc || '-'}
        </span>
      </div>
    ),
  },
  {
    header: '支付时间',
    accessorKey: 'paidAt',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.paidAt
          ? new Date(row.original.paidAt).toLocaleString('zh-CN')
          : '-'}
      </span>
    ),
  },
  {
    header: '创建时间',
    accessorKey: 'createTime',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <CalendarIcon className="size-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {new Date(row.getValue('createTime')).toLocaleString('zh-CN')}
        </span>
      </div>
    ),
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onView?: (order: AdminOrderVO) => void
        onOpenCancel?: (order: AdminOrderVO) => void
        onRefund?: (order: AdminOrderVO) => void
        onConfirmPayment?: (order: AdminOrderVO) => void
      }
      const payStatus = row.original.payStatus
      const canCancel = payStatus === 'UNPAID' || payStatus === 'PAYING'
      const canRefund = payStatus === 'PAID'
      const canConfirm = payStatus === 'UNPAID' || payStatus === 'PAYING'

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title="查看详情"
            onClick={() => meta?.onView?.(row.original)}
          >
            <EyeIcon className="size-4 text-blue-600" />
            <span className="sr-only">查看详情</span>
          </Button>
          {canConfirm && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              title="确认支付"
              onClick={() => meta?.onConfirmPayment?.(row.original)}
            >
              <CheckCircleIcon className="size-4 text-green-600" />
              <span className="sr-only">确认支付</span>
            </Button>
          )}
          {canRefund && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              title="退款"
              onClick={() => meta?.onRefund?.(row.original)}
            >
              <ReceiptIcon className="size-4 text-purple-600" />
              <span className="sr-only">退款</span>
            </Button>
          )}
          {canCancel && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive"
              title="取消订单"
              onClick={() => meta?.onOpenCancel?.(row.original)}
            >
              <XCircleIcon className="size-4" />
              <span className="sr-only">取消订单</span>
            </Button>
          )}
        </div>
      )
    },
  },
]

export function OrderDatatable({
  data,
  loading,
  onView,
  onCancel,
  onRefund,
  onConfirmPayment,
  onExport,
  onRefresh,
}: OrderDatatableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const pageSize = 10

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  })

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<AdminOrderVO | null>(null)

  const handleOpenCancel = (order: AdminOrderVO) => {
    setOrderToCancel(order)
    setCancelDialogOpen(true)
  }

  const handleConfirmCancel = () => {
    if (orderToCancel) {
      onCancel?.(orderToCancel)
    }
    setCancelDialogOpen(false)
    setOrderToCancel(null)
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      pagination,
    },
    meta: {
      onView,
      onOpenCancel: handleOpenCancel,
      onRefund,
      onConfirmPayment,
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
          <div className="flex items-center gap-2">
            <Filter column={table.getColumn('orderNo')!} />
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
              title="刷新"
            >
              <RefreshCwIcon className={cn('size-4', loading && 'animate-spin')} />
              <span className="sr-only">刷新</span>
            </Button>
            <Button variant="outline" onClick={onExport}>
              <DownloadIcon className="mr-2 size-4" />
              导出
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-14 border-t">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-muted-foreground first:pl-4 last:px-4"
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
                      className="h-16 first:pl-4 last:px-4"
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

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>取消订单</AlertDialogTitle>
            <AlertDialogDescription>
              确定要取消订单 <span className="font-medium text-foreground">{orderToCancel?.orderNo}</span> 吗？
              此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认取消
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
        placeholder="搜索订单号..."
        type="text"
        className="w-[200px]"
      />
    </div>
  )
}
