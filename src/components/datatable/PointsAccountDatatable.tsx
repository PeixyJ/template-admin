import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  Loader2Icon,
  RefreshCwIcon,
  EyeIcon,
  SlidersHorizontalIcon,
  HistoryIcon,
  UsersIcon,
  CoinsIcon,
  ClockIcon,
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
import type { PointsAccountVO } from '@/types/subscription.types'

interface PointsAccountDatatableProps {
  data: PointsAccountVO[]
  loading?: boolean
  onView?: (account: PointsAccountVO) => void
  onAdjust?: (account: PointsAccountVO) => void
  onViewTransactions?: (account: PointsAccountVO) => void
  onSetExpiry?: (account: PointsAccountVO) => void
  onRefresh?: () => void
}

const columns: ColumnDef<PointsAccountVO>[] = [
  {
    header: '团队',
    accessorKey: 'teamName',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <UsersIcon className="size-4 text-muted-foreground" />
        <span className="font-medium">{row.original.teamName}</span>
      </div>
    ),
  },
  {
    header: '可用点数',
    accessorKey: 'availablePoints',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <CoinsIcon className="size-4 text-amber-500" />
        <span className="font-medium text-lg">{row.original.availablePoints.toLocaleString()}</span>
      </div>
    ),
  },
  {
    header: '总获得',
    accessorKey: 'totalPoints',
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-mono">
        +{row.original.totalPoints.toLocaleString()}
      </Badge>
    ),
  },
  {
    header: '已使用',
    accessorKey: 'usedPoints',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.usedPoints.toLocaleString()}
      </span>
    ),
  },
  {
    header: '已冻结',
    accessorKey: 'frozenPoints',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.frozenPoints > 0 ? row.original.frozenPoints.toLocaleString() : '-'}
      </span>
    ),
  },
  {
    header: '已过期',
    accessorKey: 'expiredPoints',
    cell: ({ row }) => (
      <span className={cn(
        row.original.expiredPoints > 0 ? 'text-destructive' : 'text-muted-foreground'
      )}>
        {row.original.expiredPoints > 0 ? row.original.expiredPoints.toLocaleString() : '-'}
      </span>
    ),
  },
  {
    header: '最近使用',
    accessorKey: 'lastUsedTime',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.lastUsedTime
          ? new Date(row.original.lastUsedTime).toLocaleString('zh-CN')
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
          {new Date(row.getValue('createTime')).toLocaleDateString('zh-CN')}
        </span>
      </div>
    ),
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onView?: (account: PointsAccountVO) => void
        onAdjust?: (account: PointsAccountVO) => void
        onViewTransactions?: (account: PointsAccountVO) => void
        onSetExpiry?: (account: PointsAccountVO) => void
      }

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
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title="调整点数"
            onClick={() => meta?.onAdjust?.(row.original)}
          >
            <SlidersHorizontalIcon className="size-4 text-green-600" />
            <span className="sr-only">调整点数</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title="查看交易记录"
            onClick={() => meta?.onViewTransactions?.(row.original)}
          >
            <HistoryIcon className="size-4 text-amber-600" />
            <span className="sr-only">查看交易记录</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title="设置过期时间"
            onClick={() => meta?.onSetExpiry?.(row.original)}
          >
            <ClockIcon className="size-4 text-purple-600" />
            <span className="sr-only">设置过期时间</span>
          </Button>
        </div>
      )
    },
  },
]

export function PointsAccountDatatable({
  data,
  loading,
  onView,
  onAdjust,
  onViewTransactions,
  onSetExpiry,
  onRefresh,
}: PointsAccountDatatableProps) {
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
      onView,
      onAdjust,
      onViewTransactions,
      onSetExpiry,
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
          <span className="font-medium">点数账户列表</span>
          <div className="flex items-center gap-2">
            <Filter column={table.getColumn('teamName')!} />
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
    </div>
  )
}

function Filter({ column }: { column: Column<PointsAccountVO, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()

  return (
    <div>
      <Label htmlFor={`${id}-input`} className="sr-only">
        搜索团队
      </Label>
      <Input
        id={`${id}-input`}
        value={(columnFilterValue ?? '') as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder="搜索团队名称..."
        type="text"
        className="w-[200px]"
      />
    </div>
  )
}
