import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  Loader2Icon,
  RefreshCwIcon,
  EyeIcon,
  XCircleIcon,
  GiftIcon,
  UsersIcon,
  PlusIcon,
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
import type { GrantRecordVO } from '@/types/subscription.types'

interface GrantRecordDatatableProps {
  data: GrantRecordVO[]
  loading?: boolean
  onView?: (record: GrantRecordVO) => void
  onRevoke?: (record: GrantRecordVO) => void
  onRefresh?: () => void
  onCreateClick?: () => void
}

const grantTypeConfig: Record<string, { label: string }> = {
  SUBSCRIPTION: { label: '订阅' },
  POINTS: { label: '点数' },
  RESOURCE_PACK: { label: '扩容包' },
  QUOTA: { label: '配额' },
}

const grantCategoryConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  VIP: { label: 'VIP', variant: 'default' },
  PROMOTION: { label: '促销', variant: 'secondary' },
  COMPENSATION: { label: '补偿', variant: 'outline' },
  OTHER: { label: '其他', variant: 'outline' },
}

const grantStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: '待处理', variant: 'outline' },
  SUCCESS: { label: '成功', variant: 'default' },
  FAILED: { label: '失败', variant: 'destructive' },
  REVOKED: { label: '已撤销', variant: 'destructive' },
}

const columns: ColumnDef<GrantRecordVO>[] = [
  {
    header: '赠送信息',
    accessorKey: 'grantNo',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <GiftIcon className="size-4 text-pink-500" />
          <span className="font-mono text-sm">{row.original.grantNo}</span>
        </div>
        {row.original.batchNo && (
          <span className="text-xs text-muted-foreground">
            批次: {row.original.batchNo}
          </span>
        )}
      </div>
    ),
  },
  {
    header: '接收方',
    accessorKey: 'teamName',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1">
          <UsersIcon className="size-3 text-muted-foreground" />
          <span>{row.original.teamName}</span>
        </div>
        {row.original.userName && (
          <span className="text-xs text-muted-foreground">
            {row.original.userName}
          </span>
        )}
      </div>
    ),
  },
  {
    header: '赠送类型',
    accessorKey: 'grantType',
    cell: ({ row }) => (
      <Badge variant="outline">
        {grantTypeConfig[row.original.grantType]?.label || row.original.grantTypeDesc}
      </Badge>
    ),
  },
  {
    header: '商品/数量',
    accessorKey: 'productName',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{row.original.productName || '-'}</span>
        <span className="text-xs text-muted-foreground">
          x{row.original.quantity}
        </span>
      </div>
    ),
  },
  {
    header: '原价值',
    accessorKey: 'originalValue',
    cell: ({ row }) => (
      <span className="font-medium">
        ¥{row.original.originalValue.toFixed(2)}
      </span>
    ),
  },
  {
    header: '赠送分类',
    accessorKey: 'grantCategory',
    cell: ({ row }) => {
      const config = grantCategoryConfig[row.original.grantCategory]
      return (
        <Badge variant={config?.variant || 'outline'}>
          {config?.label || row.original.grantCategoryDesc}
        </Badge>
      )
    },
  },
  {
    header: '状态',
    accessorKey: 'status',
    cell: ({ row }) => {
      const config = grantStatusConfig[row.original.status]
      return (
        <Badge variant={config?.variant || 'outline'}>
          {config?.label || row.original.statusDesc}
        </Badge>
      )
    },
  },
  {
    header: '操作人',
    accessorKey: 'grantedByName',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.grantedByName}</span>
    ),
  },
  {
    header: '赠送时间',
    accessorKey: 'grantedAt',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.grantedAt
          ? new Date(row.original.grantedAt).toLocaleString('zh-CN')
          : '-'}
      </span>
    ),
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
        onView?: (record: GrantRecordVO) => void
        onOpenRevoke?: (record: GrantRecordVO) => void
      }
      const canRevoke = row.original.status === 'SUCCESS'

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
          {canRevoke && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive"
              title="撤销赠送"
              onClick={() => meta?.onOpenRevoke?.(row.original)}
            >
              <XCircleIcon className="size-4" />
              <span className="sr-only">撤销赠送</span>
            </Button>
          )}
        </div>
      )
    },
  },
]

export function GrantRecordDatatable({
  data,
  loading,
  onView,
  onRevoke,
  onRefresh,
  onCreateClick,
}: GrantRecordDatatableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const pageSize = 10

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  })

  // Revoke dialog state
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [recordToRevoke, setRecordToRevoke] = useState<GrantRecordVO | null>(null)

  const handleOpenRevoke = (record: GrantRecordVO) => {
    setRecordToRevoke(record)
    setRevokeDialogOpen(true)
  }

  const handleConfirmRevoke = () => {
    if (recordToRevoke) {
      onRevoke?.(recordToRevoke)
    }
    setRevokeDialogOpen(false)
    setRecordToRevoke(null)
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
      onOpenRevoke: handleOpenRevoke,
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
          <div className="flex items-center gap-2">
            <Filter column={table.getColumn('grantNo')!} />
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
              新建赠送
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

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>撤销赠送</AlertDialogTitle>
            <AlertDialogDescription>
              确定要撤销赠送记录 <span className="font-medium text-foreground">{recordToRevoke?.grantNo}</span> 吗？
              此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRevoke}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认撤销
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
        placeholder="搜索赠送单号..."
        type="text"
        className="w-[200px]"
      />
    </div>
  )
}
