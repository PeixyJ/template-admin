import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  EyeIcon,
  UndoIcon,
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
import type { GrantRecordVO, GrantType, GrantRecordStatus } from '@/types/subscription.types'

interface GrantRecordDatatableProps {
  data: GrantRecordVO[]
  loading?: boolean
  onViewDetail?: (record: GrantRecordVO) => void
  onRevoke?: (record: GrantRecordVO) => void
  onRowClick?: (record: GrantRecordVO) => void
}

const grantTypeLabels: Record<GrantType, string> = {
  SUBSCRIPTION: '订阅',
  POINTS: '点数',
  RESOURCE: '资源',
  ENTITLEMENT: '权益',
}

const grantTypeColors: Record<GrantType, string> = {
  SUBSCRIPTION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  POINTS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  RESOURCE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ENTITLEMENT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
}

const grantStatusLabels: Record<GrantRecordStatus, string> = {
  ACTIVE: '有效',
  EXPIRED: '已过期',
  REVOKED: '已撤销',
}

const grantStatusColors: Record<GrantRecordStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  REVOKED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const columns: ColumnDef<GrantRecordVO>[] = [
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
    header: '赠送编号',
    accessorKey: 'grantId',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onRowClick?: (record: GrantRecordVO) => void
      }
      return (
        <button
          type="button"
          className="text-left font-medium hover:text-primary hover:underline"
          onClick={() => meta?.onRowClick?.(row.original)}
        >
          {row.original.grantId}
        </button>
      )
    },
  },
  {
    header: '类型',
    accessorKey: 'grantType',
    cell: ({ row }) => {
      const type = row.getValue('grantType') as GrantType
      return (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            grantTypeColors[type]
          )}
        >
          {grantTypeLabels[type] || row.original.grantTypeDesc}
        </span>
      )
    },
  },
  {
    header: '团队',
    accessorKey: 'teamName',
    cell: ({ row }) => (
      <span>{row.original.teamName}</span>
    ),
  },
  {
    header: '赠送内容',
    accessorKey: 'grantContent',
    cell: ({ row }) => (
      <span>{row.original.grantContent}</span>
    ),
  },
  {
    header: '赠送数量',
    accessorKey: 'grantAmount',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.grantAmount}</span>
    ),
  },
  {
    header: '状态',
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.getValue('status') as GrantRecordStatus
      return (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            grantStatusColors[status]
          )}
        >
          {grantStatusLabels[status] || row.original.statusDesc}
        </span>
      )
    },
  },
  {
    header: '过期时间',
    accessorKey: 'expireTime',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.expireTime
          ? new Date(row.original.expireTime).toLocaleString('zh-CN')
          : '-'}
      </span>
    ),
  },
  {
    header: '原因',
    accessorKey: 'reason',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.reason || '-'}</span>
    ),
  },
  {
    header: '操作人',
    accessorKey: 'operatorName',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.operatorName || '-'}</span>
    ),
  },
  {
    header: '创建时间',
    accessorKey: 'createTime',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.createTime).toLocaleString('zh-CN')}
      </span>
    ),
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onViewDetail?: (record: GrantRecordVO) => void
        onRevoke?: (record: GrantRecordVO) => void
      }
      const record = row.original
      const canRevoke = record.status === 'ACTIVE'

      return (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => meta?.onViewDetail?.(record)}
                  title="查看详情"
                >
                  <EyeIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>查看详情</TooltipContent>
            </Tooltip>

            {canRevoke && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => meta?.onRevoke?.(record)}
                    title="撤销"
                  >
                    <UndoIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>撤销赠送</TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      )
    },
  },
]

export function GrantRecordDatatable({
  data,
  loading,
  onViewDetail,
  onRevoke,
  onRowClick,
}: GrantRecordDatatableProps) {
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
      onRevoke,
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
          <span className="font-medium">赠送记录列表</span>
          <Filter column={table.getColumn('grantId')!} />
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

function Filter({ column }: { column: Column<GrantRecordVO, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()

  return (
    <div>
      <Label htmlFor={`${id}-input`} className="sr-only">
        搜索赠送记录
      </Label>
      <Input
        id={`${id}-input`}
        value={(columnFilterValue ?? '') as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder="搜索赠送编号..."
        type="text"
        className="w-[200px]"
      />
    </div>
  )
}
