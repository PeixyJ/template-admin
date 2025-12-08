import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  Trash2Icon,
  Loader2Icon,
  RefreshCwIcon,
  PlusIcon,
  EditIcon,
  EyeIcon,
  MailIcon,
  SearchIcon,
} from 'lucide-react'

import type {
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
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import type { TemplateVO } from '@/types/notification-template.types'

interface NotificationTemplateDatatableProps {
  data: TemplateVO[]
  loading?: boolean
  onDelete?: (template: TemplateVO) => void
  onToggleStatus?: (template: TemplateVO) => void
  onEdit?: (template: TemplateVO) => void
  onView?: (template: TemplateVO) => void
  onSendNotification?: (template: TemplateVO) => void
  onRefresh?: () => void
  onCreateClick?: () => void
  onSearch?: (keyword: string) => void
}

const columns: ColumnDef<TemplateVO>[] = [
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
    header: '模板信息',
    accessorKey: 'name',
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{row.original.name}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.code}
          </span>
        </div>
      )
    },
  },
  {
    header: '分类',
    accessorKey: 'parentType',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.parentTypeDesc || row.original.parentType}
      </Badge>
    ),
  },
  {
    header: '过期天数',
    accessorKey: 'expireDays',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.expireDays === 0 ? '永不过期' : `${row.original.expireDays} 天`}
      </span>
    ),
  },
  {
    header: '状态',
    accessorKey: 'status',
    cell: ({ row, table }) => {
      const isActive = row.getValue('status') === true
      const meta = table.options.meta as {
        onToggleStatus?: (template: TemplateVO) => void
      }
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={isActive}
            onCheckedChange={() => meta?.onToggleStatus?.(row.original)}
          />
          <span className="text-sm text-muted-foreground">
            {isActive ? '启用' : '禁用'}
          </span>
        </div>
      )
    },
  },
  {
    header: '更新时间',
    accessorKey: 'updateTime',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <CalendarIcon className="size-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {new Date(row.getValue('updateTime')).toLocaleDateString('zh-CN')}
        </span>
      </div>
    ),
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onView?: (template: TemplateVO) => void
        onEdit?: (template: TemplateVO) => void
        onSendNotification?: (template: TemplateVO) => void
        onOpenDelete?: (template: TemplateVO) => void
      }
      const isActive = row.original.status === true
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
            title="发送通知"
            onClick={() => meta?.onSendNotification?.(row.original)}
            disabled={!isActive}
          >
            <MailIcon className={cn('size-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
            <span className="sr-only">发送通知</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            onClick={() => meta?.onOpenDelete?.(row.original)}
          >
            <Trash2Icon className="size-4" />
            <span className="sr-only">删除模板</span>
          </Button>
        </div>
      )
    },
  },
]

export function NotificationTemplateDatatable({
  data,
  loading,
  onDelete,
  onToggleStatus,
  onEdit,
  onView,
  onSendNotification,
  onRefresh,
  onCreateClick,
  onSearch,
}: NotificationTemplateDatatableProps) {
  const id = useId()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [keyword, setKeyword] = useState('')
  const pageSize = 10

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  })

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<TemplateVO | null>(null)

  const handleOpenDelete = (template: TemplateVO) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (templateToDelete) {
      onDelete?.(templateToDelete)
    }
    setDeleteDialogOpen(false)
    setTemplateToDelete(null)
  }

  const handleSearch = () => {
    onSearch?.(keyword)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
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
      onSendNotification,
      onOpenDelete: handleOpenDelete,
      onToggleStatus,
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
          <span className="font-medium">通知模板列表</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={`${id}-search`} className="sr-only">
                搜索模板
              </Label>
              <Input
                id={`${id}-search`}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜索模板..."
                type="text"
                className="h-9 w-[150px]"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={handleSearch}
                disabled={loading}
                title="搜索"
              >
                <SearchIcon className="size-4" />
                <span className="sr-only">搜索</span>
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 ml-auto"
              onClick={onRefresh}
              disabled={loading}
              title="刷新"
            >
              <RefreshCwIcon className={cn('size-4', loading && 'animate-spin')} />
              <span className="sr-only">刷新</span>
            </Button>
            <Button onClick={onCreateClick}>
              <PlusIcon className="mr-2 size-4" />
              创建模板
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除模板 <span className="font-medium text-foreground">{templateToDelete?.name}</span> 吗？此操作不可撤销。
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

          </div>
  )
}
