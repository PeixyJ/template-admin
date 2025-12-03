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
  SettingsIcon,
  CrownIcon,
  StarIcon,
  SparklesIcon,
  CopyIcon,
  CheckIcon,
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
import type { PlanVO, PlanType, ApplyScope } from '@/types/subscription.types'

interface PlanDatatableProps {
  data: PlanVO[]
  loading?: boolean
  onDelete?: (plan: PlanVO) => void
  onToggleStatus?: (plan: PlanVO) => void
  onEdit?: (plan: PlanVO) => void
  onView?: (plan: PlanVO) => void
  onConfigureFeatures?: (plan: PlanVO) => void
  onRefresh?: () => void
  onCreateClick?: () => void
}

const planTypeConfig: Record<PlanType, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'outline' }> = {
  FREE: { label: '免费版', icon: <StarIcon className="mr-1 size-3" />, variant: 'secondary' },
  TRIAL: { label: '试用版', icon: <SparklesIcon className="mr-1 size-3" />, variant: 'outline' },
  PAID: { label: '付费版', icon: <CrownIcon className="mr-1 size-3" />, variant: 'default' },
}

const applyScopeConfig: Record<ApplyScope, { label: string }> = {
  PERSONAL: { label: '个人空间' },
  COLLABORATION: { label: '协作团队' },
  ALL: { label: '通用' },
}

function CopyableId({ id }: { id: number }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(id))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-1.5 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
      title="点击复制 ID"
    >
      <span>{id}</span>
      {copied ? (
        <CheckIcon className="size-3.5 text-green-500" />
      ) : (
        <CopyIcon className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  )
}

const columns: ColumnDef<PlanVO>[] = [
  {
    header: 'ID',
    accessorKey: 'id',
    cell: ({ row }) => <CopyableId id={row.original.id} />,
  },
  {
    header: '计划信息',
    accessorKey: 'planName',
    cell: ({ row }) => {
      const typeConfig = planTypeConfig[row.original.planType as PlanType]
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.original.planName}</span>
            <Badge variant={typeConfig?.variant || 'outline'} className="text-xs">
              {typeConfig?.icon}
              {typeConfig?.label || row.original.planType}
            </Badge>
            {row.original.isDefault && (
              <Badge variant="secondary" className="text-xs">
                默认
              </Badge>
            )}
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.planCode}
          </span>
        </div>
      )
    },
  },
  {
    header: '等级',
    accessorKey: 'planLevel',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        Lv.{row.original.planLevel}
      </Badge>
    ),
  },
  {
    header: '价格',
    accessorKey: 'price',
    cell: ({ row }) => {
      const currencySymbol = row.original.currency === 'CNY' ? '¥' : '$'
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">
            {currencySymbol}{row.original.price.toFixed(2)}
          </span>
        </div>
      )
    },
  },
  {
    header: '有效期',
    accessorKey: 'durationDays',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.durationDays ? `${row.original.durationDays} 天` : '永久'}
      </span>
    ),
  },
  {
    header: '适用范围',
    accessorKey: 'applyScope',
    cell: ({ row }) => (
      <Badge variant="outline">
        {applyScopeConfig[row.original.applyScope]?.label || row.original.applyScope}
      </Badge>
    ),
  },
  {
    header: '状态',
    accessorKey: 'status',
    cell: ({ row }) => {
      const isActive = row.original.status === true
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
    header: '可见性',
    accessorKey: 'isVisible',
    cell: ({ row }) => (
      <Badge variant={row.original.isVisible ? 'default' : 'secondary'}>
        {row.original.isVisible ? '可见' : '隐藏'}
      </Badge>
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
        onView?: (plan: PlanVO) => void
        onEdit?: (plan: PlanVO) => void
        onConfigureFeatures?: (plan: PlanVO) => void
        onOpenToggleStatus?: (plan: PlanVO) => void
        onOpenDelete?: (plan: PlanVO) => void
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
            title="配置功能"
            onClick={() => meta?.onConfigureFeatures?.(row.original)}
          >
            <SettingsIcon className="size-4 text-purple-600" />
            <span className="sr-only">配置功能</span>
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
            <span className="sr-only">删除计划</span>
          </Button>
        </div>
      )
    },
  },
]

export function PlanDatatable({
  data,
  loading,
  onDelete,
  onToggleStatus,
  onEdit,
  onView,
  onConfigureFeatures,
  onRefresh,
  onCreateClick,
}: PlanDatatableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const pageSize = 10

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  })

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<PlanVO | null>(null)

  // Toggle status dialog state
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false)
  const [planToToggle, setPlanToToggle] = useState<PlanVO | null>(null)

  const handleOpenDelete = (plan: PlanVO) => {
    setPlanToDelete(plan)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (planToDelete) {
      onDelete?.(planToDelete)
    }
    setDeleteDialogOpen(false)
    setPlanToDelete(null)
  }

  const handleOpenToggleStatus = (plan: PlanVO) => {
    setPlanToToggle(plan)
    setToggleStatusDialogOpen(true)
  }

  const handleConfirmToggleStatus = () => {
    if (planToToggle) {
      onToggleStatus?.(planToToggle)
    }
    setToggleStatusDialogOpen(false)
    setPlanToToggle(null)
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
      onConfigureFeatures,
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
          <span className="font-medium">订阅计划列表</span>
          <div className="flex items-center gap-2">
            <Filter column={table.getColumn('planName')!} />
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
              创建计划
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
              确定要删除计划 <span className="font-medium text-foreground">{planToDelete?.planName}</span> 吗？此操作不可撤销。
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
              {planToToggle?.status === true ? '禁用计划' : '启用计划'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              确定要{planToToggle?.status === true ? '禁用' : '启用'}计划{' '}
              <span className="font-medium text-foreground">{planToToggle?.planName}</span> 吗？
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

function Filter({ column }: { column: Column<PlanVO, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()

  return (
    <div>
      <Label htmlFor={`${id}-input`} className="sr-only">
        搜索计划
      </Label>
      <Input
        id={`${id}-input`}
        value={(columnFilterValue ?? '') as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder="搜索计划名称..."
        type="text"
        className="w-[200px]"
      />
    </div>
  )
}
