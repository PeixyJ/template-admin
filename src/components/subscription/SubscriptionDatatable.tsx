import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  XIcon,
  CalendarPlusIcon,
  RefreshCwIcon,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'
import type { SubscriptionVO, SubscriptionStatus, SubscriptionSource } from '@/types/subscription.types'

interface SubscriptionDatatableProps {
  data: SubscriptionVO[]
  loading?: boolean
  onCancel?: (subscription: SubscriptionVO) => void
  onExtend?: (subscription: SubscriptionVO) => void
  onRowClick?: (subscription: SubscriptionVO) => void
  onRefresh?: () => void
}

const statusLabels: Record<SubscriptionStatus, string> = {
  PENDING: '待生效',
  ACTIVE: '生效中',
  PAUSED: '已暂停',
  EXPIRED: '已过期',
  CANCELLED: '已取消',
}

const statusColors: Record<SubscriptionStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  PAUSED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const sourceLabels: Record<SubscriptionSource, string> = {
  PURCHASE: '购买',
  GRANT: '赠送',
  SYSTEM: '系统',
}

const columns: ColumnDef<SubscriptionVO>[] = [
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
    header: '订阅信息',
    accessorKey: 'id',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onRowClick?: (subscription: SubscriptionVO) => void
      }
      return (
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            className="text-left font-medium hover:text-primary hover:underline"
            onClick={() => meta?.onRowClick?.(row.original)}
          >
            #{row.original.id}
          </button>
          <span className="text-xs text-muted-foreground">
            {row.original.planName}
          </span>
        </div>
      )
    },
  },
  {
    header: '团队',
    accessorKey: 'teamName',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{row.original.teamName}</span>
        <span className="text-xs text-muted-foreground">
          ID: {row.original.teamId}
        </span>
      </div>
    ),
  },
  {
    header: '计划',
    accessorKey: 'planName',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span>{row.original.planName}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.planCode}
        </span>
      </div>
    ),
  },
  {
    header: '状态',
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.getValue('status') as SubscriptionStatus

      return (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            statusColors[status]
          )}
        >
          {row.original.statusDesc || statusLabels[status] || status}
        </span>
      )
    },
  },
  {
    header: '来源',
    accessorKey: 'source',
    cell: ({ row }) => {
      const source = row.getValue('source') as SubscriptionSource
      return (
        <Badge variant="outline">
          {row.original.sourceDesc || sourceLabels[source] || source}
        </Badge>
      )
    },
  },
  {
    header: '有效期',
    accessorKey: 'startTime',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 text-sm">
        <span>{new Date(row.original.startTime).toLocaleDateString('zh-CN')}</span>
        <span className="text-xs text-muted-foreground">
          至 {row.original.endTime ? new Date(row.original.endTime).toLocaleDateString('zh-CN') : '永久'}
        </span>
      </div>
    ),
  },
  {
    header: '席位',
    accessorKey: 'seats',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('seats')}</span>
    ),
  },
  {
    header: '赠送人',
    accessorKey: 'granterName',
    cell: ({ row }) => {
      const { granterName, granterAvatar, source } = row.original

      if (source !== 'GRANT' || !granterName) {
        return <span className="text-muted-foreground">-</span>
      }

      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={granterAvatar || undefined} alt={granterName} />
            <AvatarFallback className="text-xs">
              {granterName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{granterName}</span>
        </div>
      )
    },
  },
  {
    header: '赠送原因',
    accessorKey: 'grantReason',
    cell: ({ row }) => {
      const { grantReason, source } = row.original

      if (source !== 'GRANT') {
        return <span className="text-muted-foreground">-</span>
      }

      if (!grantReason) {
        return <span className="text-muted-foreground">未填写</span>
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="max-w-[120px] truncate text-sm cursor-default">
                {grantReason}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[300px]">
              {grantReason}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onCancel?: (subscription: SubscriptionVO) => void
        onExtend?: (subscription: SubscriptionVO) => void
      }
      const subscription = row.original
      const isActive = subscription.status === 'ACTIVE'
      const isPaused = subscription.status === 'PAUSED'
      const canOperate = isActive || isPaused

      if (!canOperate) return null

      return (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => meta?.onExtend?.(subscription)}
                  title="延期"
                >
                  <CalendarPlusIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>延期</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  onClick={() => meta?.onCancel?.(subscription)}
                  title="取消"
                >
                  <XIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>取消订阅</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )
    },
  },
]

export function SubscriptionDatatable({
  data,
  loading,
  onCancel,
  onExtend,
  onRowClick,
  onRefresh,
}: SubscriptionDatatableProps) {
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
      onCancel,
      onExtend,
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
          <span className="font-medium">订阅列表</span>
          <Filter column={table.getColumn('teamName')!} onRefresh={onRefresh} loading={loading} />
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

function Filter({
  column,
  onRefresh,
  loading,
}: {
  column: Column<SubscriptionVO, unknown>
  onRefresh?: () => void
  loading?: boolean
}) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={`${id}-input`} className="sr-only">
        搜索订阅
      </Label>
      <Input
        id={`${id}-input`}
        value={(columnFilterValue ?? '') as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder="搜索团队名称..."
        type="text"
        className="w-[200px]"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        disabled={loading}
        title="刷新"
      >
        <RefreshCwIcon className={cn('size-4', loading && 'animate-spin')} />
      </Button>
    </div>
  )
}
