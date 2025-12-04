import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  EyeIcon,
  PlusIcon,
  ClockIcon,
  ListIcon,
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
import type { PointsAccountVO } from '@/types/subscription.types'

interface PointsAccountDatatableProps {
  data: PointsAccountVO[]
  loading?: boolean
  onViewDetail?: (account: PointsAccountVO) => void
  onAdjust?: (account: PointsAccountVO) => void
  onSetExpiry?: (account: PointsAccountVO) => void
  onViewTransactions?: (account: PointsAccountVO) => void
  onRowClick?: (account: PointsAccountVO) => void
}

const columns: ColumnDef<PointsAccountVO>[] = [
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
    header: '团队信息',
    accessorKey: 'teamName',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onRowClick?: (account: PointsAccountVO) => void
      }
      return (
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            className="text-left font-medium hover:text-primary hover:underline"
            onClick={() => meta?.onRowClick?.(row.original)}
          >
            {row.original.teamName}
          </button>
          <span className="text-xs text-muted-foreground">
            ID: {row.original.teamId}
          </span>
        </div>
      )
    },
  },
  {
    header: '总点数',
    accessorKey: 'totalPoints',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('totalPoints')}</span>
    ),
  },
  {
    header: '可用点数',
    accessorKey: 'availablePoints',
    cell: ({ row }) => (
      <Badge variant="default" className="bg-green-500">
        {row.getValue('availablePoints')}
      </Badge>
    ),
  },
  {
    header: '已用点数',
    accessorKey: 'usedPoints',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('usedPoints')}</span>
    ),
  },
  {
    header: '冻结点数',
    accessorKey: 'frozenPoints',
    cell: ({ row }) => {
      const frozen = row.getValue('frozenPoints') as number
      return frozen > 0 ? (
        <Badge variant="secondary">{frozen}</Badge>
      ) : (
        <span className="text-muted-foreground">0</span>
      )
    },
  },
  {
    header: '已过期点数',
    accessorKey: 'expiredPoints',
    cell: ({ row }) => {
      const expired = row.getValue('expiredPoints') as number
      return expired > 0 ? (
        <Badge variant="destructive">{expired}</Badge>
      ) : (
        <span className="text-muted-foreground">0</span>
      )
    },
  },
  {
    header: '最后使用时间',
    accessorKey: 'lastUsedTime',
    cell: ({ row }) => {
      const time = row.getValue('lastUsedTime') as string | null
      return time ? (
        <span className="text-sm text-muted-foreground">
          {new Date(time).toLocaleString('zh-CN')}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onViewDetail?: (account: PointsAccountVO) => void
        onAdjust?: (account: PointsAccountVO) => void
        onSetExpiry?: (account: PointsAccountVO) => void
        onViewTransactions?: (account: PointsAccountVO) => void
      }

      return (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => meta?.onViewDetail?.(row.original)}
                  title="查看详情"
                >
                  <EyeIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>查看详情</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => meta?.onAdjust?.(row.original)}
                  title="调整点数"
                >
                  <PlusIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>调整点数</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => meta?.onSetExpiry?.(row.original)}
                  title="设置过期"
                >
                  <ClockIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>设置过期</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => meta?.onViewTransactions?.(row.original)}
                  title="交易记录"
                >
                  <ListIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>交易记录</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )
    },
  },
]

export function PointsAccountDatatable({
  data,
  loading,
  onViewDetail,
  onAdjust,
  onSetExpiry,
  onViewTransactions,
  onRowClick,
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
      onViewDetail,
      onAdjust,
      onSetExpiry,
      onViewTransactions,
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
          <span className="font-medium">点数账户列表</span>
          <Filter column={table.getColumn('teamName')!} />
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
