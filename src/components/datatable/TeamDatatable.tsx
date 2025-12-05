import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  UsersIcon,
  UserIcon,
  CalendarIcon,
  Trash2Icon,
  Loader2Icon,
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

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

import { TeamDetailSheet } from './TeamDetailSheet'
import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'
import type { TeamVO, TeamType } from '@/types/team.types'

interface TeamDatatableProps {
  data: TeamVO[]
  loading?: boolean
  onDisband?: (team: TeamVO) => void
  pagination?: { pageIndex: number; pageSize: number }
  totalCount?: number
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void
}

const teamTypeLabels: Record<TeamType, string> = {
  PERSONAL_SPACE: '个人空间',
  COLLABORATION_TEAM: '协作团队',
}

const columns: ColumnDef<TeamVO>[] = [
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
    header: '团队信息',
    accessorKey: 'name',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onTeamClick?: (team: TeamVO) => void
      }
      return (
        <div className="flex items-center gap-4">
          <Avatar className="size-10 rounded-lg">
            {row.original.logoUrl ? (
              <AvatarImage src={row.original.logoUrl} alt={row.original.name} />
            ) : null}
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
              <UsersIcon className="size-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              className="text-left font-medium hover:text-primary hover:underline"
              onClick={() => meta?.onTeamClick?.(row.original)}
            >
              {row.getValue('name')}
            </button>
            <span className="text-xs text-muted-foreground">
              ID: {row.original.id}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    header: '类型',
    accessorKey: 'type',
    cell: ({ row }) => {
      const type = row.getValue('type') as TeamType
      return (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            type === 'PERSONAL_SPACE'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          )}
        >
          {teamTypeLabels[type] || type}
        </span>
      )
    },
  },
  {
    header: '所有者',
    accessorKey: 'ownerNickname',
    cell: ({ row }) => {
      const initials = row.original.ownerNickname
        ? row.original.ownerNickname.charAt(0).toUpperCase()
        : null
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-7">
            <AvatarImage
              src={row.original.ownerAvatarUrl ?? undefined}
              alt={row.original.ownerNickname || ''}
            />
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {initials || <UserIcon className="size-3" />}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground">
            {row.original.ownerNickname || `用户 #${row.original.ownerId}`}
          </span>
        </div>
      )
    },
  },
  {
    header: '描述',
    accessorKey: 'description',
    cell: ({ row }) => (
      <span className="line-clamp-1 max-w-[200px] text-muted-foreground">
        {row.getValue('description') || '-'}
      </span>
    ),
  },
  {
    header: '套餐',
    accessorKey: 'planName',
    cell: ({ row }) => {
      const planName = row.getValue('planName') as string | null
      const planEndDate = row.original.planEndDate
      return (
        <div className="flex flex-col gap-0.5">
          <span className={cn(
            'text-sm',
            planName ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {planName || '无套餐'}
          </span>
          {planEndDate && (
            <span className="text-xs text-muted-foreground">
              到期: {new Date(planEndDate).toLocaleDateString('zh-CN')}
            </span>
          )}
        </div>
      )
    },
  },
  {
    header: '积分',
    accessorKey: 'availablePoints',
    cell: ({ row }) => {
      const points = row.getValue('availablePoints') as number | null
      return (
        <span className={cn(
          'tabular-nums',
          points !== null && points > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
        )}>
          {points !== null ? points.toLocaleString() : '-'}
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
        onDisband?: (team: TeamVO) => void
      }
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            onClick={() => meta?.onDisband?.(row.original)}
          >
            <Trash2Icon className="size-4" />
            <span className="sr-only">解散团队</span>
          </Button>
        </div>
      )
    },
  },
]

export function TeamDatatable({
  data,
  loading,
  onDisband,
  pagination: externalPagination,
  totalCount,
  onPaginationChange,
}: TeamDatatableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const pageSize = 10

  // 服务端分页模式
  const isServerSide = !!externalPagination && !!onPaginationChange

  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  })

  const pagination: PaginationState = isServerSide ? externalPagination : internalPagination

  const handlePaginationChange = (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
    if (isServerSide) {
      const currentPagination = externalPagination
      const newPagination = typeof updater === 'function' ? updater(currentPagination) : updater
      onPaginationChange(newPagination)
    } else {
      setInternalPagination(updater)
    }
  }

  const handleTeamClick = (team: TeamVO) => {
    setSelectedTeamId(team.id)
    setSheetOpen(true)
  }

  // 服务端分页时计算总页数
  const serverSidePageCount = isServerSide && totalCount
    ? Math.ceil(totalCount / pagination.pageSize)
    : undefined

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      pagination,
    },
    meta: {
      onTeamClick: handleTeamClick,
      onDisband,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: isServerSide ? undefined : getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    onPaginationChange: handlePaginationChange,
    manualPagination: isServerSide,
    pageCount: serverSidePageCount,
  })

  const actualPageCount = isServerSide ? (serverSidePageCount ?? 1) : table.getPageCount()

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: pagination.pageIndex + 1,
    totalPages: actualPageCount,
    paginationItemsToDisplay: 3,
  })

  return (
    <div className="w-full">
      <div className="border-b">
        <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-6 py-3">
          <span className="font-medium">团队列表</span>
          <Filter column={table.getColumn('name')!} />
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
            {pagination.pageIndex * pagination.pageSize + 1}{' '}
            到{' '}
            {Math.min(
              pagination.pageIndex * pagination.pageSize + pagination.pageSize,
              isServerSide ? (totalCount ?? 0) : table.getRowCount()
            )}
          </span>{' '}
          条，共 <span>{isServerSide ? (totalCount ?? 0) : table.getRowCount()} 条</span>
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
                const isActive = page === pagination.pageIndex + 1

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

      <TeamDetailSheet
        teamId={selectedTeamId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}

function Filter({ column }: { column: Column<TeamVO, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()

  return (
    <div>
      <Label htmlFor={`${id}-input`} className="sr-only">
        搜索团队
      </Label>
      <Input
        id={`${id}-input`}
        value={(columnFilterValue ?? '') as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder="搜索团队名称..."
        type="text"
        className="w-[200px]"
      />
    </div>
  )
}
