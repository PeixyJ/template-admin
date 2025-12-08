import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  Loader2Icon,
  RefreshCwIcon,
  EyeIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react'

import type {
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import type { NotificationVO } from '@/types/notification.types'

export interface NotificationFilters {
  userId: string
  keyword: string
  parentType: string
  status: string
}

interface NotificationDatatableProps {
  data: NotificationVO[]
  loading?: boolean
  total: number
  page: number
  pageSize: number
  filters: NotificationFilters
  onFiltersChange: (filters: NotificationFilters) => void
  onPageChange: (page: number) => void
  onView?: (notification: NotificationVO) => void
  onRefresh?: () => void
  onSearch?: () => void
}

const getStatusBadge = (status: string, statusDesc: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    unread: 'default',
    read: 'secondary',
    acted: 'outline',
    expired: 'destructive',
  }
  return (
    <Badge variant={variants[status] || 'outline'}>
      {statusDesc || status}
    </Badge>
  )
}

const columns: ColumnDef<NotificationVO>[] = [
  {
    header: 'ID',
    accessorKey: 'id',
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">
        {row.original.id}
      </span>
    ),
  },
  {
    header: '标题',
    accessorKey: 'title',
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <span className="font-medium line-clamp-1">{row.original.title}</span>
      </div>
    ),
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
    header: '发送者',
    accessorKey: 'senderName',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm">{row.original.senderName}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.senderType}
        </span>
      </div>
    ),
  },
  {
    header: '状态',
    accessorKey: 'status',
    cell: ({ row }) => getStatusBadge(row.original.status, row.original.statusDesc),
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
        onView?: (notification: NotificationVO) => void
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
        </div>
      )
    },
  },
]

export function NotificationDatatable({
  data,
  loading,
  total,
  page,
  pageSize,
  filters,
  onFiltersChange,
  onPageChange,
  onView,
  onRefresh,
  onSearch,
}: NotificationDatatableProps) {
  const id = useId()
  const totalPages = Math.ceil(total / pageSize)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: pageSize,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    meta: {
      onView,
    },
    manualPagination: true,
    pageCount: totalPages,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
  })

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: page,
    totalPages: totalPages,
    paginationItemsToDisplay: 3,
  })

  const handleFilterChange = (key: keyof NotificationFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch?.()
    }
  }

  const handleClearFilters = () => {
    onFiltersChange({
      userId: filters.userId,
      keyword: '',
      parentType: '',
      status: '',
    })
  }

  const hasFilters = filters.keyword || filters.parentType || filters.status

  return (
    <div className="w-full">
      {/* 筛选区域 */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b">
        <Label htmlFor={`${id}-userId`} className="sr-only">
          用户ID
        </Label>
        <Input
          id={`${id}-userId`}
          value={filters.userId}
          onChange={(e) => handleFilterChange('userId', e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="用户ID"
          type="text"
          className="h-9 w-[150px]"
        />

        <Label htmlFor={`${id}-keyword`} className="sr-only">
          关键字
        </Label>
        <Input
          id={`${id}-keyword`}
          value={filters.keyword}
          onChange={(e) => handleFilterChange('keyword', e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索关键字..."
          type="text"
          className="h-9 w-[150px]"
        />

        <Select
          value={filters.parentType}
          onValueChange={(value) => handleFilterChange('parentType', value)}
        >
          <SelectTrigger className="h-9 w-[100px]">
            <SelectValue placeholder="分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INBOX">收件箱</SelectItem>
            <SelectItem value="SYSTEM">系统</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="h-9 w-[100px]">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unread">未读</SelectItem>
            <SelectItem value="read">已读</SelectItem>
            <SelectItem value="acted">已处理</SelectItem>
            <SelectItem value="expired">已过期</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={onSearch}
          disabled={loading}
          title="搜索"
        >
          <SearchIcon className="size-4" />
          <span className="sr-only">搜索</span>
        </Button>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-9"
          >
            <XIcon className="mr-1 size-4" />
            清除筛选
          </Button>
        )}

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
      </div>

      {/* 表格 */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="h-14 border-t">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="text-muted-foreground first:pl-6 last:pr-6"
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
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="h-16 first:pl-6 last:pr-6"
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

      {/* 分页 */}
      <div className="flex items-center justify-between gap-3 px-6 py-4 max-sm:flex-col">
        <p
          className="whitespace-nowrap text-sm text-muted-foreground"
          aria-live="polite"
        >
          {total > 0 ? (
            <>
              显示{' '}
              <span>
                {(page - 1) * pageSize + 1} 到{' '}
                {Math.min(page * pageSize, total)}
              </span>{' '}
              条，共 <span>{total} 条</span>
            </>
          ) : (
            '共 0 条'
          )}
        </p>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  className="disabled:pointer-events-none disabled:opacity-50"
                  variant="ghost"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
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

              {pages.map((pageNum) => {
                const isActive = pageNum === page

                return (
                  <PaginationItem key={pageNum}>
                    <Button
                      size="icon"
                      variant={isActive ? 'default' : 'ghost'}
                      className={cn(
                        !isActive &&
                          'bg-primary/10 text-primary hover:bg-primary/20'
                      )}
                      onClick={() => onPageChange(pageNum)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {pageNum}
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
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
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
