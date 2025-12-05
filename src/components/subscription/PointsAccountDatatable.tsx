import { useState, useMemo } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  EyeIcon,
  PlusIcon,
  ListIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
} from 'lucide-react'

import type {
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export interface PointsFilters {
  teamId: string
}

interface PointsAccountDatatableProps {
  data: PointsAccountVO[]
  loading?: boolean
  filters: PointsFilters
  onFiltersChange: (filters: PointsFilters) => void
  onRefresh: () => void
  onViewDetail?: (account: PointsAccountVO) => void
  onAdjust?: (account: PointsAccountVO) => void
  onViewTransactions?: (account: PointsAccountVO) => void
  onRowClick?: (account: PointsAccountVO) => void
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

export function PointsAccountDatatable({
  data,
  loading,
  filters,
  onFiltersChange,
  onRefresh,
  onViewDetail,
  onAdjust,
  onViewTransactions,
  onRowClick,
}: PointsAccountDatatableProps) {
  const pageSize = 10

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  })

  const columns: ColumnDef<PointsAccountVO>[] = useMemo(
    () => [
      {
        header: '团队',
        accessorKey: 'teamName',
        cell: ({ row }) => (
          <button
            type="button"
            className="text-left font-medium hover:text-primary hover:underline"
            onClick={() => onRowClick?.(row.original)}
          >
            {row.original.teamName}
          </button>
        ),
      },
      {
        header: '负责人',
        accessorKey: 'ownerName',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.ownerName}</span>
        ),
      },
      {
        header: '总余额',
        accessorKey: 'totalBalance',
        cell: ({ row }) => (
          <span className="font-bold">{formatNumber(row.original.totalBalance)}</span>
        ),
      },
      {
        header: '可用余额',
        accessorKey: 'availableBalance',
        cell: ({ row }) => (
          <span className="text-green-600 font-medium">
            {formatNumber(row.original.availableBalance)}
          </span>
        ),
      },
      {
        header: '冻结余额',
        accessorKey: 'frozenBalance',
        cell: ({ row }) => {
          const frozen = row.original.frozenBalance ?? 0
          return frozen > 0 ? (
            <span className="text-yellow-600 font-medium">{formatNumber(frozen)}</span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )
        },
      },
      {
        header: '累计获得',
        accessorKey: 'totalEarned',
        cell: ({ row }) => (
          <span className="text-green-600">+{formatNumber(row.original.totalEarned)}</span>
        ),
      },
      {
        header: '累计消费',
        accessorKey: 'totalConsumed',
        cell: ({ row }) => (
          <span className="text-red-600">-{formatNumber(row.original.totalConsumed)}</span>
        ),
      },
      {
        header: '即将过期',
        accessorKey: 'expiringPoints',
        cell: ({ row }) => {
          const expiring = row.original.expiringPoints ?? 0
          return expiring > 0 ? (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangleIcon className="size-3" />
              {formatNumber(expiring)}
            </Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )
        },
      },
      {
        header: '状态',
        accessorKey: 'status',
        cell: ({ row }) => (
          <Badge variant={row.original.status ? 'default' : 'secondary'}>
            {row.original.statusDesc}
          </Badge>
        ),
      },
      {
        header: '活跃批次',
        accessorKey: 'activeBatchCount',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.activeBatchCount ?? 0}</span>
        ),
      },
      {
        header: '最后交易',
        accessorKey: 'lastTransactionTime',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(row.original.lastTransactionTime)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => onViewDetail?.(row.original)}
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
                    onClick={() => onAdjust?.(row.original)}
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
                    onClick={() => onViewTransactions?.(row.original)}
                  >
                    <ListIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>交易记录</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ),
      },
    ],
    [onViewDetail, onAdjust, onViewTransactions, onRowClick]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
          <div className="flex items-center gap-3">
            <Input
              type="number"
              placeholder="输入团队ID筛选..."
              className="w-48"
              value={filters.teamId}
              onChange={(e) => onFiltersChange({ ...filters, teamId: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCwIcon className={loading ? 'size-4 animate-spin' : 'size-4'} />
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-14 border-t">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-muted-foreground first:pl-6 last:px-4"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="h-11 first:pl-6 last:px-4"
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
