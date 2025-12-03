import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  Trash2Icon,
  BanIcon,
  CheckCircleIcon,
  Loader2Icon,
  RefreshCwIcon,
  PlusIcon,
  EditIcon,
  EyeIcon,
  PackageIcon,
  UsersIcon,
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
import type { AdminPackVO } from '@/types/subscription.types'

interface ResourcePackDatatableProps {
  data: AdminPackVO[]
  loading?: boolean
  onDelete?: (pack: AdminPackVO) => void
  onToggleStatus?: (pack: AdminPackVO) => void
  onEdit?: (pack: AdminPackVO) => void
  onView?: (pack: AdminPackVO) => void
  onAllocate?: (pack: AdminPackVO) => void
  onRefresh?: () => void
  onCreateClick?: () => void
}

const resourceTypeConfig: Record<string, { label: string }> = {
  PROJECT: { label: '项目' },
  MEMBER: { label: '成员' },
  STORAGE: { label: '存储' },
}

const durationTypeConfig: Record<string, { label: string; variant: 'default' | 'secondary' }> = {
  PERMANENT: { label: '永久', variant: 'default' },
  TEMPORARY: { label: '临时', variant: 'secondary' },
}

const columns: ColumnDef<AdminPackVO>[] = [
  {
    header: '扩容包信息',
    accessorKey: 'packName',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <PackageIcon className="size-4 text-purple-500" />
          <span className="font-medium">{row.original.packName}</span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.packCode}
        </span>
      </div>
    ),
  },
  {
    header: '资源类型',
    accessorKey: 'resourceType',
    cell: ({ row }) => (
      <Badge variant="outline">
        {resourceTypeConfig[row.original.resourceType]?.label || row.original.resourceTypeDesc}
      </Badge>
    ),
  },
  {
    header: '资源数量',
    accessorKey: 'resourceAmount',
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.resourceAmount} {row.original.resourceUnit}
      </span>
    ),
  },
  {
    header: '价格',
    accessorKey: 'price',
    cell: ({ row }) => {
      const currencySymbol = row.original.currency === 'CNY' ? '¥' : '$'
      return (
        <span className="font-medium">
          {currencySymbol}{row.original.price.toFixed(2)}
        </span>
      )
    },
  },
  {
    header: '时效类型',
    accessorKey: 'durationType',
    cell: ({ row }) => {
      const config = durationTypeConfig[row.original.durationType]
      return (
        <div className="flex flex-col gap-0.5">
          <Badge variant={config?.variant || 'outline'}>
            {config?.label || row.original.durationTypeDesc}
          </Badge>
          {row.original.durationType === 'TEMPORARY' && row.original.durationDays && (
            <span className="text-xs text-muted-foreground">
              {row.original.durationDays}天
            </span>
          )}
        </div>
      )
    },
  },
  {
    header: '分配次数',
    accessorKey: 'totalAllocations',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <UsersIcon className="size-3 text-muted-foreground" />
        <span className="text-muted-foreground">{row.original.totalAllocations}</span>
      </div>
    ),
  },
  {
    header: '状态',
    accessorKey: 'status',
    cell: ({ row }) => {
      const isActive = row.original.status === 1
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
            isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          )}
        >
          {isActive ? (
            <>
              <CheckCircleIcon className="size-3" />
              启用
            </>
          ) : (
            <>
              <BanIcon className="size-3" />
              禁用
            </>
          )}
        </span>
      )
    },
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
        onView?: (pack: AdminPackVO) => void
        onEdit?: (pack: AdminPackVO) => void
        onAllocate?: (pack: AdminPackVO) => void
        onOpenToggleStatus?: (pack: AdminPackVO) => void
        onOpenDelete?: (pack: AdminPackVO) => void
      }
      const isActive = row.original.status === 1
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
            title="编辑"
            onClick={() => meta?.onEdit?.(row.original)}
          >
            <EditIcon className="size-4 text-amber-600" />
            <span className="sr-only">编辑</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title="分配"
            onClick={() => meta?.onAllocate?.(row.original)}
          >
            <UsersIcon className="size-4 text-purple-600" />
            <span className="sr-only">分配</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => meta?.onOpenToggleStatus?.(row.original)}
            title={isActive ? '禁用' : '启用'}
          >
            {isActive ? (
              <BanIcon className="size-4 text-orange-600" />
            ) : (
              <CheckCircleIcon className="size-4 text-green-600" />
            )}
            <span className="sr-only">{isActive ? '禁用' : '启用'}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            onClick={() => meta?.onOpenDelete?.(row.original)}
          >
            <Trash2Icon className="size-4" />
            <span className="sr-only">删除扩容包</span>
          </Button>
        </div>
      )
    },
  },
]

export function ResourcePackDatatable({
  data,
  loading,
  onDelete,
  onToggleStatus,
  onEdit,
  onView,
  onAllocate,
  onRefresh,
  onCreateClick,
}: ResourcePackDatatableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const pageSize = 10

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  })

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [packToDelete, setPackToDelete] = useState<AdminPackVO | null>(null)

  // Toggle status dialog state
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false)
  const [packToToggle, setPackToToggle] = useState<AdminPackVO | null>(null)

  const handleOpenDelete = (pack: AdminPackVO) => {
    setPackToDelete(pack)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (packToDelete) {
      onDelete?.(packToDelete)
    }
    setDeleteDialogOpen(false)
    setPackToDelete(null)
  }

  const handleOpenToggleStatus = (pack: AdminPackVO) => {
    setPackToToggle(pack)
    setToggleStatusDialogOpen(true)
  }

  const handleConfirmToggleStatus = () => {
    if (packToToggle) {
      onToggleStatus?.(packToToggle)
    }
    setToggleStatusDialogOpen(false)
    setPackToToggle(null)
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
      onEdit,
      onAllocate,
      onOpenDelete: handleOpenDelete,
      onOpenToggleStatus: handleOpenToggleStatus,
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
          <div className="flex items-center gap-2">
            <Filter column={table.getColumn('packName')!} />
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
            <Button onClick={onCreateClick}>
              <PlusIcon className="mr-2 size-4" />
              创建扩容包
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除扩容包 <span className="font-medium text-foreground">{packToDelete?.packName}</span> 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Status Confirmation Dialog */}
      <AlertDialog open={toggleStatusDialogOpen} onOpenChange={setToggleStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {packToToggle?.status === 1 ? '禁用扩容包' : '启用扩容包'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              确定要{packToToggle?.status === 1 ? '禁用' : '启用'}扩容包{' '}
              <span className="font-medium text-foreground">{packToToggle?.packName}</span> 吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggleStatus}>
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
