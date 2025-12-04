import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  PencilIcon,
  Trash2Icon,
  GiftIcon,
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
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'
import type { AdminPackVO, ResourceType, DurationType } from '@/types/subscription.types'

interface ResourcePackDatatableProps {
  data: AdminPackVO[]
  loading?: boolean
  onEdit?: (pack: AdminPackVO) => void
  onDelete?: (pack: AdminPackVO) => void
  onStatusChange?: (pack: AdminPackVO, status: boolean) => void
  onAllocate?: (pack: AdminPackVO) => void
  onRowClick?: (pack: AdminPackVO) => void
}

const resourceTypeLabels: Record<ResourceType, string> = {
  PROJECT: '项目数',
  MEMBER: '成员数',
  STORAGE: '存储空间',
}

const resourceTypeColors: Record<ResourceType, string> = {
  PROJECT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  MEMBER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  STORAGE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

const durationTypeLabels: Record<DurationType, string> = {
  PERMANENT: '永久',
  FIXED_DAYS: '固定天数',
  UNTIL_DATE: '固定日期',
}

const columns: ColumnDef<AdminPackVO>[] = [
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
    header: '扩容包信息',
    accessorKey: 'packName',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onRowClick?: (pack: AdminPackVO) => void
      }
      return (
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            className="text-left font-medium hover:text-primary hover:underline"
            onClick={() => meta?.onRowClick?.(row.original)}
          >
            {row.getValue('packName')}
          </button>
          <span className="text-xs text-muted-foreground">
            {row.original.packCode}
          </span>
        </div>
      )
    },
  },
  {
    header: '资源类型',
    accessorKey: 'resourceType',
    cell: ({ row }) => {
      const type = row.getValue('resourceType') as ResourceType
      return (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            resourceTypeColors[type]
          )}
        >
          {resourceTypeLabels[type] || row.original.resourceTypeDesc}
        </span>
      )
    },
  },
  {
    header: '资源额度',
    accessorKey: 'resourceAmount',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">{row.original.resourceAmount}</span>
        <span className="text-xs text-muted-foreground">{row.original.resourceUnit}</span>
      </div>
    ),
  },
  {
    header: '价格',
    accessorKey: 'price',
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.currency === 'CNY' ? '¥' : '$'}
        {row.original.price.toFixed(2)}
      </span>
    ),
  },
  {
    header: '有效期',
    accessorKey: 'durationType',
    cell: ({ row }) => {
      const type = row.getValue('durationType') as DurationType
      const days = row.original.durationDays
      return (
        <div className="flex flex-col gap-0.5">
          <Badge variant="outline">
            {durationTypeLabels[type] || row.original.durationTypeDesc}
          </Badge>
          {type === 'FIXED_DAYS' && days && (
            <span className="text-xs text-muted-foreground">{days}天</span>
          )}
        </div>
      )
    },
  },
  {
    header: '分配数',
    accessorKey: 'totalAllocations',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('totalAllocations')}</span>
    ),
  },
  {
    header: '状态',
    accessorKey: 'status',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onStatusChange?: (pack: AdminPackVO, status: boolean) => void
      }
      const isActive = row.original.status === 1
      return (
        <Switch
          checked={isActive}
          onCheckedChange={(checked) => meta?.onStatusChange?.(row.original, checked)}
        />
      )
    },
  },
  {
    header: '排序',
    accessorKey: 'sortOrder',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('sortOrder')}</span>
    ),
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onEdit?: (pack: AdminPackVO) => void
        onDelete?: (pack: AdminPackVO) => void
        onAllocate?: (pack: AdminPackVO) => void
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
                  onClick={() => meta?.onAllocate?.(row.original)}
                  title="分配"
                >
                  <GiftIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>分配给团队</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => meta?.onEdit?.(row.original)}
                  title="编辑"
                >
                  <PencilIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>编辑</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  onClick={() => meta?.onDelete?.(row.original)}
                  title="删除"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>删除</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )
    },
  },
]

export function ResourcePackDatatable({
  data,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
  onAllocate,
  onRowClick,
}: ResourcePackDatatableProps) {
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
      onEdit,
      onDelete,
      onStatusChange,
      onAllocate,
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
          <span className="font-medium">扩容包列表</span>
          <Filter column={table.getColumn('packName')!} />
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

function Filter({ column }: { column: Column<AdminPackVO, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()

  return (
    <div>
      <Label htmlFor={`${id}-input`} className="sr-only">
        搜索扩容包
      </Label>
      <Input
        id={`${id}-input`}
        value={(columnFilterValue ?? '') as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder="搜索扩容包名称..."
        type="text"
        className="w-[200px]"
      />
    </div>
  )
}
