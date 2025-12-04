import { useId, useState } from 'react'
import { toast } from 'sonner'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  Loader2Icon,
  PencilIcon,
  Trash2Icon,
  SettingsIcon,
  RefreshCwIcon,
  SearchIcon,
  XIcon,
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

import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'
import type { PlanVO, PlanType, ApplyScope, PlanListParams } from '@/types/subscription.types'

export interface PlanFilters {
  keyword?: string
  planType?: PlanType | ''
  status?: boolean | ''
  isVisible?: boolean | ''
}

interface PlanDatatableProps {
  data: PlanVO[]
  loading?: boolean
  filters?: PlanFilters
  onFiltersChange?: (filters: PlanFilters) => void
  onRefresh?: () => void
  onEdit?: (plan: PlanVO) => void
  onDelete?: (plan: PlanVO) => void
  onStatusChange?: (plan: PlanVO, status: boolean) => void
  onConfigureFeatures?: (plan: PlanVO) => void
  onRowClick?: (plan: PlanVO) => void
}

const planTypeLabels: Record<PlanType, string> = {
  FREE: '免费版',
  TRIAL: '试用版',
  PAID: '付费版',
}

const planTypeColors: Record<PlanType, string> = {
  FREE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  TRIAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  PAID: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

const applyScopeLabels: Record<ApplyScope, string> = {
  PERSONAL: '个人',
  COLLABORATION: '协作',
  ALL: '通用',
}

const columns: ColumnDef<PlanVO>[] = [
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
    header: '计划信息',
    accessorKey: 'planName',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onRowClick?: (plan: PlanVO) => void
      }
      return (
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            className="text-left font-medium hover:text-primary hover:underline"
            onClick={() => meta?.onRowClick?.(row.original)}
          >
            {row.getValue('planName')}
          </button>
          {row.original.description && (
            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
              {row.original.description}
            </span>
          )}
        </div>
      )
    },
  },
  {
    header: '编码',
    accessorKey: 'planCode',
    cell: ({ row }) => {
      const code = row.getValue('planCode') as string
      const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText(code)
          toast.success('已复制到剪贴板')
        } catch {
          toast.error('复制失败')
        }
      }
      return (
        <button
          type="button"
          className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-mono"
          onClick={handleCopy}
          title="点击复制"
        >
          {code}
          <CopyIcon className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )
    },
  },
  {
    header: '等级',
    accessorKey: 'planLevel',
    cell: ({ row }) => {
      const level = row.getValue('planLevel') as number
      const getLevelStyle = (lvl: number) => {
        const styles: Record<number, string> = {
          0: 'bg-muted text-muted-foreground',
          1: 'bg-secondary text-secondary-foreground',
          2: 'bg-primary/10 text-primary',
          3: 'bg-primary/20 text-primary',
          4: 'bg-primary/40 text-primary-foreground',
          5: 'bg-primary text-primary-foreground',
        }
        if (lvl > 5) return 'bg-primary text-primary-foreground'
        return styles[lvl] || styles[0]
      }

      return (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
            getLevelStyle(level)
          )}
        >
          Lv.{level}
        </span>
      )
    },
  },
  {
    header: '类型',
    accessorKey: 'planType',
    cell: ({ row }) => {
      const type = row.getValue('planType') as PlanType
      return (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            planTypeColors[type]
          )}
        >
          {planTypeLabels[type] || type}
        </span>
      )
    },
  },
  {
    header: '适用范围',
    accessorKey: 'applyScope',
    cell: ({ row }) => {
      const scope = row.getValue('applyScope') as ApplyScope
      return (
        <span className="text-muted-foreground">
          {applyScopeLabels[scope] || scope}
        </span>
      )
    },
  },
  {
    header: '功能数',
    id: 'featureCount',
    cell: ({ row }) => {
      const features = row.original.features || []
      const enabledCount = features.filter(f => f.enabled).length
      const totalCount = features.length
      return (
        <span className="text-muted-foreground tabular-nums">
          {enabledCount}/{totalCount}
        </span>
      )
    },
  },
  {
    header: '价格',
    accessorKey: 'price',
    cell: ({ row }) => {
      const price = row.getValue('price') as number
      const originalPrice = row.original.originalPrice
      const currency = row.original.currency
      const currencySymbol = currency === 'CNY' ? '¥' : '$'
      return (
        <div className="flex flex-col gap-0.5">
          <span className="tabular-nums font-medium">
            {price === 0 ? '免费' : `${currencySymbol}${price}`}
          </span>
          {originalPrice != null && originalPrice > 0 && (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              {currencySymbol}{originalPrice}
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
      const days = row.getValue('durationDays') as number | null
      return (
        <span className="text-muted-foreground">
          {days === null ? '永久' : `${days}天`}
        </span>
      )
    },
  },
  {
    header: '标签',
    id: 'tags',
    cell: ({ row }) => {
      const isDefault = row.original.isDefault
      const isTrial = row.original.isTrial
      const isVisible = row.original.isVisible
      const tags = []
      if (isDefault) tags.push({ label: '默认', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' })
      if (isTrial) tags.push({ label: '试用', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' })
      if (isVisible === false) tags.push({ label: '隐藏', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' })

      if (tags.length === 0) return <span className="text-muted-foreground">-</span>

      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag.label}
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                tag.color
              )}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )
    },
  },
  {
    header: '状态',
    accessorKey: 'status',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onStatusChange?: (plan: PlanVO, status: boolean) => void
      }
      return (
        <Switch
          checked={row.getValue('status')}
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
        onEdit?: (plan: PlanVO) => void
        onDelete?: (plan: PlanVO) => void
        onConfigureFeatures?: (plan: PlanVO) => void
      }
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => meta?.onConfigureFeatures?.(row.original)}
            title="配置功能"
          >
            <SettingsIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => meta?.onEdit?.(row.original)}
            title="编辑"
          >
            <PencilIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            onClick={() => meta?.onDelete?.(row.original)}
            title="删除"
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      )
    },
  },
]

export function PlanDatatable({
  data,
  loading,
  filters,
  onFiltersChange,
  onRefresh,
  onEdit,
  onDelete,
  onStatusChange,
  onConfigureFeatures,
  onRowClick,
}: PlanDatatableProps) {
  const id = useId()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [localKeyword, setLocalKeyword] = useState(filters?.keyword || '')
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
      onConfigureFeatures,
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

  const handleSearch = () => {
    onFiltersChange?.({ ...filters, keyword: localKeyword })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleClearFilters = () => {
    setLocalKeyword('')
    onFiltersChange?.({
      keyword: '',
      planType: '',
      status: '',
      isVisible: '',
    })
  }

  const hasActiveFilters = filters?.keyword || filters?.planType || filters?.status !== '' || filters?.isVisible !== ''

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
                placeholder="搜索计划名称或编码..."
                className="w-[200px] pr-8"
              />
              {localKeyword && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setLocalKeyword('')
                    onFiltersChange?.({ ...filters, keyword: '' })
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

          {/* 计划类型 */}
          <Select
            value={filters?.planType || 'all'}
            onValueChange={(value) =>
              onFiltersChange?.({ ...filters, planType: value === 'all' ? '' : value as PlanType })
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="计划类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="FREE">免费版</SelectItem>
              <SelectItem value="TRIAL">试用版</SelectItem>
              <SelectItem value="PAID">付费版</SelectItem>
            </SelectContent>
          </Select>

          {/* 状态 */}
          <Select
            value={filters?.status === '' ? 'all' : filters?.status?.toString() || 'all'}
            onValueChange={(value) =>
              onFiltersChange?.({
                ...filters,
                status: value === 'all' ? '' : value === 'true',
              })
            }
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

          {/* 可见性 */}
          <Select
            value={filters?.isVisible === '' ? 'all' : filters?.isVisible?.toString() || 'all'}
            onValueChange={(value) =>
              onFiltersChange?.({
                ...filters,
                isVisible: value === 'all' ? '' : value === 'true',
              })
            }
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="可见性" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="true">可见</SelectItem>
              <SelectItem value="false">隐藏</SelectItem>
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
