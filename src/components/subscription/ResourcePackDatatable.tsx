import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  PencilIcon,
  Trash2Icon,
  GiftIcon,
  RefreshCwIcon,
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
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import type { AdminPackVO, ResourceType } from '@/types/subscription.types'

export interface ResourcePackFilters {
  packCode?: string
  packName?: string
  resourceType?: ResourceType | ''
  status?: boolean | ''
}

interface ResourcePackDatatableProps {
  data: AdminPackVO[]
  loading?: boolean
  total: number
  page: number
  pageSize: number
  filters?: ResourcePackFilters
  onFiltersChange?: (filters: ResourcePackFilters) => void
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onRefresh?: () => void
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
    header: '资源包信息',
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
      <span className="font-medium tabular-nums">{row.original.resourceAmount}</span>
    ),
  },
  {
    header: '价格',
    accessorKey: 'price',
    cell: ({ row }) => {
      const price = row.original.price
      const originalPrice = row.original.originalPrice
      const currencySymbol = row.original.currency === 'CNY' ? '¥' : '$'
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium tabular-nums">
            {currencySymbol}{price.toFixed(2)}
          </span>
          {originalPrice != null && originalPrice > price && (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              {currencySymbol}{originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      )
    },
  },
  {
    header: '有效期',
    accessorKey: 'durationDays',
    cell: ({ row }) => {
      const days = row.original.durationDays
      return (
        <Badge variant="outline">
          {days === null ? '永久' : `${days}天`}
        </Badge>
      )
    },
  },
  {
    header: '可见性',
    accessorKey: 'isVisible',
    cell: ({ row }) => {
      const isVisible = row.original.isVisible
      return (
        <Badge variant={isVisible ? 'default' : 'secondary'}>
          {isVisible ? '可见' : '隐藏'}
        </Badge>
      )
    },
  },
  {
    header: '状态',
    accessorKey: 'status',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onStatusChange?: (pack: AdminPackVO, status: boolean) => void
      }
      return (
        <Switch
          checked={row.original.status}
          onCheckedChange={(checked) => meta?.onStatusChange?.(row.original, checked)}
        />
      )
    },
  },
  {
    header: '排序',
    accessorKey: 'sortOrder',
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">{row.getValue('sortOrder')}</span>
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
  total,
  page,
  pageSize,
  filters,
  onFiltersChange,
  onPageChange,
  onRefresh,
  onEdit,
  onDelete,
  onStatusChange,
  onAllocate,
  onRowClick,
}: ResourcePackDatatableProps) {
  const id = useId()
  const [localKeyword, setLocalKeyword] = useState(filters?.packName || '')

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
      onEdit,
      onDelete,
      onStatusChange,
      onAllocate,
      onRowClick,
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    onPaginationChange: setPagination,
  })

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: page,
    totalPages: totalPages,
    paginationItemsToDisplay: 3,
  })

  const handleSearch = () => {
    onFiltersChange?.({ ...filters, packName: localKeyword })
    onPageChange?.(1) // 搜索时重置到第一页
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleClearFilters = () => {
    setLocalKeyword('')
    onFiltersChange?.({
      packCode: '',
      packName: '',
      resourceType: '',
      status: '',
    })
    onPageChange?.(1)
  }

  const handlePageChange = (newPage: number) => {
    onPageChange?.(newPage)
  }

  const hasActiveFilters = filters?.packName || filters?.packCode || filters?.resourceType || filters?.status !== ''

  // 计算当前显示的记录范围
  const startRecord = (page - 1) * pageSize + 1
  const endRecord = Math.min(page * pageSize, total)

  return (
    <div className="w-full">
      <div className="border-b">
        {/* 筛选区域 */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b">
          {/* 关键词搜索 */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                id={`${id}-keyword`}
                value={localKeyword}
                onChange={(e) => setLocalKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜索资源包名称..."
                className="w-[200px] pr-8"
              />
              {localKeyword && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setLocalKeyword('')
                    onFiltersChange?.({ ...filters, packName: '' })
                    onPageChange?.(1)
                  }}
                >
                  <XIcon className="size-4" />
                </button>
              )}
            </div>
            <Button size="icon" variant="outline" onClick={handleSearch}>
              <SearchIcon className="size-4" />
            </Button>
          </div>

          {/* 资源类型筛选 */}
          <Select
            value={filters?.resourceType || 'all'}
            onValueChange={(value) => {
              onFiltersChange?.({ ...filters, resourceType: value === 'all' ? '' : value as ResourceType })
              onPageChange?.(1)
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="资源类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="PROJECT">项目数</SelectItem>
              <SelectItem value="MEMBER">成员数</SelectItem>
              <SelectItem value="STORAGE">存储空间</SelectItem>
            </SelectContent>
          </Select>

          {/* 状态筛选 */}
          <Select
            value={filters?.status === '' ? 'all' : filters?.status?.toString() || 'all'}
            onValueChange={(value) => {
              onFiltersChange?.({
                ...filters,
                status: value === 'all' ? '' : value === 'true',
              })
              onPageChange?.(1)
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="true">已启用</SelectItem>
              <SelectItem value="false">已禁用</SelectItem>
            </SelectContent>
          </Select>

          {/* 清除筛选 */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <XIcon className="mr-1 size-4" />
              清除筛选
            </Button>
          )}

          {/* 刷新按钮 */}
          <div className="ml-auto">
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
          {total > 0 ? (
            <>
              显示 <span>{startRecord}</span> 到 <span>{endRecord}</span> 条，共{' '}
              <span>{total}</span> 条
            </>
          ) : (
            '暂无数据'
          )}
        </p>

        {totalPages > 1 && (
          <div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    className="disabled:pointer-events-none disabled:opacity-50"
                    variant="ghost"
                    onClick={() => handlePageChange(page - 1)}
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
                        onClick={() => handlePageChange(pageNum)}
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
                    onClick={() => handlePageChange(page + 1)}
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
        )}
      </div>
    </div>
  )
}
