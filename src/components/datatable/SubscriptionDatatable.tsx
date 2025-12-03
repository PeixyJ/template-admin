import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  Loader2Icon,
  RefreshCwIcon,
  EyeIcon,
  EditIcon,
  PauseIcon,
  PlayIcon,
  XCircleIcon,
  ClockIcon,
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
import type { SubscriptionVO, SubscriptionStatus, SubscriptionSource } from '@/types/subscription.types'

interface SubscriptionDatatableProps {
  data: SubscriptionVO[]
  loading?: boolean
  onView?: (subscription: SubscriptionVO) => void
  onEdit?: (subscription: SubscriptionVO) => void
  onPause?: (subscription: SubscriptionVO) => void
  onResume?: (subscription: SubscriptionVO) => void
  onCancel?: (subscription: SubscriptionVO) => void
  onExtend?: (subscription: SubscriptionVO) => void
  onRefresh?: () => void
}

const statusConfig: Record<SubscriptionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: '待生效', variant: 'outline' },
  ACTIVE: { label: '生效中', variant: 'default' },
  PAUSED: { label: '已暂停', variant: 'secondary' },
  EXPIRED: { label: '已过期', variant: 'destructive' },
  CANCELLED: { label: '已取消', variant: 'destructive' },
}

const sourceConfig: Record<SubscriptionSource, { label: string }> = {
  PURCHASE: { label: '购买' },
  GRANT: { label: '赠送' },
  TRIAL: { label: '试用' },
  SYSTEM: { label: '系统' },
}

const columns: ColumnDef<SubscriptionVO>[] = [
  {
    header: '订阅信息',
    accessorKey: 'subscriptionNo',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{row.original.planName}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.subscriptionNo}
        </span>
      </div>
    ),
  },
  {
    header: '团队',
    accessorKey: 'teamName',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <UsersIcon className="size-4 text-muted-foreground" />
        <span>{row.original.teamName}</span>
      </div>
    ),
  },
  {
    header: '计划等级',
    accessorKey: 'planLevel',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        Lv.{row.original.planLevel}
      </Badge>
    ),
  },
  {
    header: '状态',
    accessorKey: 'status',
    cell: ({ row }) => {
      const config = statusConfig[row.original.status]
      return (
        <Badge variant={config?.variant || 'outline'}>
          {config?.label || row.original.status}
        </Badge>
      )
    },
  },
  {
    header: '来源',
    accessorKey: 'source',
    cell: ({ row }) => (
      <Badge variant="secondary">
        {sourceConfig[row.original.source]?.label || row.original.source}
      </Badge>
    ),
  },
  {
    header: '有效期',
    accessorKey: 'startDate',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 text-sm">
        <div className="flex items-center gap-1">
          <CalendarIcon className="size-3 text-muted-foreground" />
          <span>{new Date(row.original.startDate).toLocaleDateString('zh-CN')}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <ClockIcon className="size-3" />
          <span>
            {row.original.endDate
              ? new Date(row.original.endDate).toLocaleDateString('zh-CN')
              : '永久'}
          </span>
        </div>
      </div>
    ),
  },
  {
    header: '金额',
    accessorKey: 'paidAmount',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">¥{row.original.paidAmount.toFixed(2)}</span>
        {row.original.price !== row.original.paidAmount && (
          <span className="text-xs text-muted-foreground line-through">
            ¥{row.original.price.toFixed(2)}
          </span>
        )}
      </div>
    ),
  },
  {
    header: '席位',
    accessorKey: 'seats',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.seats ?? '-'}
      </span>
    ),
  },
  {
    header: '创建时间',
    accessorKey: 'createTime',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.getValue('createTime')).toLocaleDateString('zh-CN')}
      </span>
    ),
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onView?: (subscription: SubscriptionVO) => void
        onEdit?: (subscription: SubscriptionVO) => void
        onOpenPause?: (subscription: SubscriptionVO) => void
        onOpenResume?: (subscription: SubscriptionVO) => void
        onOpenCancel?: (subscription: SubscriptionVO) => void
        onExtend?: (subscription: SubscriptionVO) => void
      }
      const status = row.original.status
      const canPause = status === 'ACTIVE'
      const canResume = status === 'PAUSED'
      const canCancel = status === 'ACTIVE' || status === 'PAUSED'

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
          {canPause && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              title="暂停"
              onClick={() => meta?.onOpenPause?.(row.original)}
            >
              <PauseIcon className="size-4 text-orange-600" />
              <span className="sr-only">暂停</span>
            </Button>
          )}
          {canResume && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              title="恢复"
              onClick={() => meta?.onOpenResume?.(row.original)}
            >
              <PlayIcon className="size-4 text-green-600" />
              <span className="sr-only">恢复</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title="延长有效期"
            onClick={() => meta?.onExtend?.(row.original)}
          >
            <ClockIcon className="size-4 text-purple-600" />
            <span className="sr-only">延长有效期</span>
          </Button>
          {canCancel && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive"
              title="取消订阅"
              onClick={() => meta?.onOpenCancel?.(row.original)}
            >
              <XCircleIcon className="size-4" />
              <span className="sr-only">取消订阅</span>
            </Button>
          )}
        </div>
      )
    },
  },
]

export function SubscriptionDatatable({
  data,
  loading,
  onView,
  onEdit,
  onPause,
  onResume,
  onCancel,
  onExtend,
  onRefresh,
}: SubscriptionDatatableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const pageSize = 10

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  })

  // Pause dialog state
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false)
  const [subscriptionToPause, setSubscriptionToPause] = useState<SubscriptionVO | null>(null)

  // Resume dialog state
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false)
  const [subscriptionToResume, setSubscriptionToResume] = useState<SubscriptionVO | null>(null)

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<SubscriptionVO | null>(null)

  const handleOpenPause = (subscription: SubscriptionVO) => {
    setSubscriptionToPause(subscription)
    setPauseDialogOpen(true)
  }

  const handleConfirmPause = () => {
    if (subscriptionToPause) {
      onPause?.(subscriptionToPause)
    }
    setPauseDialogOpen(false)
    setSubscriptionToPause(null)
  }

  const handleOpenResume = (subscription: SubscriptionVO) => {
    setSubscriptionToResume(subscription)
    setResumeDialogOpen(true)
  }

  const handleConfirmResume = () => {
    if (subscriptionToResume) {
      onResume?.(subscriptionToResume)
    }
    setResumeDialogOpen(false)
    setSubscriptionToResume(null)
  }

  const handleOpenCancel = (subscription: SubscriptionVO) => {
    setSubscriptionToCancel(subscription)
    setCancelDialogOpen(true)
  }

  const handleConfirmCancel = () => {
    if (subscriptionToCancel) {
      onCancel?.(subscriptionToCancel)
    }
    setCancelDialogOpen(false)
    setSubscriptionToCancel(null)
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
      onOpenPause: handleOpenPause,
      onOpenResume: handleOpenResume,
      onOpenCancel: handleOpenCancel,
      onExtend,
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
          <span className="font-medium">订阅列表</span>
          <div className="flex items-center gap-2">
            <Filter column={table.getColumn('subscriptionNo')!} />
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

      {/* Pause Confirmation Dialog */}
      <AlertDialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>暂停订阅</AlertDialogTitle>
            <AlertDialogDescription>
              确定要暂停订阅 <span className="font-medium text-foreground">{subscriptionToPause?.subscriptionNo}</span> 吗？
              暂停后可以随时恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPause}>
              确认暂停
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resume Confirmation Dialog */}
      <AlertDialog open={resumeDialogOpen} onOpenChange={setResumeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>恢复订阅</AlertDialogTitle>
            <AlertDialogDescription>
              确定要恢复订阅 <span className="font-medium text-foreground">{subscriptionToResume?.subscriptionNo}</span> 吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmResume}>
              确认恢复
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>取消订阅</AlertDialogTitle>
            <AlertDialogDescription>
              确定要取消订阅 <span className="font-medium text-foreground">{subscriptionToCancel?.subscriptionNo}</span> 吗？
              此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认取消
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Filter({ column }: { column: Column<SubscriptionVO, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()

  return (
    <div>
      <Label htmlFor={`${id}-input`} className="sr-only">
        搜索订阅
      </Label>
      <Input
        id={`${id}-input`}
        value={(columnFilterValue ?? '') as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder="搜索订阅编号..."
        type="text"
        className="w-[200px]"
      />
    </div>
  )
}
