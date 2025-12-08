import { useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  UsersIcon,
  UserIcon,
  CalendarIcon,
  Trash2Icon,
  Loader2Icon,
  RefreshCwIcon,
  SearchIcon,
  XIcon,
  CopyIcon,
  CheckIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import type {
  ColumnDef,
  ColumnFiltersState,
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
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

import { TeamDetailSheet } from './TeamDetailSheet'
import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'
import type { TeamVO, TeamType, TeamFilters } from '@/types/team.types'

interface PaginationInfo {
  current: number
  size: number
  total: number
  pages: number
}

interface TeamDatatableProps {
  data: TeamVO[]
  loading?: boolean
  pagination?: PaginationInfo
  filters?: TeamFilters
  onPageChange?: (page: number) => void
  onFiltersChange?: (filters: TeamFilters) => void
  onDisband?: (team: TeamVO) => void
  onRefresh?: () => void
}

const teamTypeLabels: Record<TeamType, string> = {
  PERSONAL_SPACE: '个人空间',
  COLLABORATION_TEAM: '协作团队',
}

// 可点击复制的文本组件
function CopyableText({
  value,
  label,
  className,
  prefix,
}: {
  value: string | number
  label?: string
  className?: string
  prefix?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value))
      setCopied(true)
      toast.success(`已复制${label || '内容'}`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1 hover:text-primary cursor-pointer transition-colors',
        className
      )}
      title={`点击复制${label || ''}`}
    >
      <span>{prefix}{value}</span>
      {copied ? (
        <CheckIcon className="size-3 text-green-500" />
      ) : (
        <CopyIcon className="size-3 opacity-0 group-hover:opacity-50 hover:!opacity-100" />
      )}
    </button>
  )
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
        <div className="group flex items-center gap-4">
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
            <CopyableText
              value={row.original.id}
              label="团队ID"
              className="text-xs text-muted-foreground"
            />
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
        <div className="group flex items-center gap-2">
          <Avatar className="size-7">
            <AvatarImage
              src={row.original.ownerAvatarUrl ?? undefined}
              alt={row.original.ownerNickname || ''}
            />
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {initials || <UserIcon className="size-3" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            {row.original.ownerNickname ? (
              <CopyableText
                value={row.original.ownerNickname}
                label="所有者名称"
                className="text-muted-foreground"
              />
            ) : (
              <span className="text-muted-foreground">未知用户</span>
            )}
            <CopyableText
              value={row.original.ownerId}
              label="所有者ID"
              className="text-xs text-muted-foreground"
              prefix="#"
            />
          </div>
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
      const planLevel = row.original.planLevel ?? 0
      const planEndDate = row.original.planEndDate

      // 根据 planLevel (0-10) 决定 badge 的鲜艳程度
      const getPlanBadgeStyle = (level: number) => {
        // level 0-2: 灰色调（低调）
        // level 3-4: 蓝色调（普通）
        // level 5-6: 绿色调（中等）
        // level 7-8: 紫色调（高级）
        // level 9-10: 金色/橙色调（顶级）
        if (level <= 2) {
          return 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400'
        }
        if (level <= 4) {
          return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
        }
        if (level <= 6) {
          return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
        }
        if (level <= 8) {
          return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
        }
        // level 9-10: 最鲜艳的金色/橙色
        return 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 dark:from-amber-900/50 dark:to-orange-900/50 dark:text-amber-400 font-semibold'
      }

      return (
        <div className="flex flex-col gap-1">
          {planName ? (
            <Badge
              variant="secondary"
              className={cn('border-0', getPlanBadgeStyle(planLevel))}
            >
              {planName}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">无套餐</Badge>
          )}
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
  pagination: serverPagination,
  filters = {},
  onPageChange,
  onFiltersChange,
  onDisband,
  onRefresh,
}: TeamDatatableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // 本地筛选表单状态
  const [localFilters, setLocalFilters] = useState<TeamFilters>(filters)

  // 服务端分页模式
  const isServerPagination = !!serverPagination && !!onPageChange

  const handleTeamClick = (team: TeamVO) => {
    setSelectedTeamId(team.id)
    setSheetOpen(true)
  }

  // 处理筛选表单提交
  const handleSearch = () => {
    const cleanedFilters: TeamFilters = {}
    if (localFilters.teamId) cleanedFilters.teamId = localFilters.teamId
    if (localFilters.name?.trim()) cleanedFilters.name = localFilters.name.trim()
    if (localFilters.type) cleanedFilters.type = localFilters.type
    if (localFilters.ownerId) cleanedFilters.ownerId = localFilters.ownerId
    if (localFilters.disbanded !== undefined) cleanedFilters.disbanded = localFilters.disbanded
    onFiltersChange?.(cleanedFilters)
  }

  // 重置筛选条件
  const handleReset = () => {
    setLocalFilters({})
    onFiltersChange?.({})
  }

  // 检查是否有筛选条件
  const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== '')

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      ...(isServerPagination && {
        pagination: {
          pageIndex: serverPagination.current - 1,
          pageSize: serverPagination.size,
        },
      }),
    },
    meta: {
      onTeamClick: handleTeamClick,
      onDisband,
    },
    manualPagination: isServerPagination,
    pageCount: isServerPagination ? serverPagination.pages : undefined,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const currentPage = isServerPagination
    ? serverPagination.current
    : table.getState().pagination.pageIndex + 1
  const totalPages = isServerPagination
    ? serverPagination.pages
    : table.getPageCount()
  const totalRecords = isServerPagination
    ? serverPagination.total
    : data.length
  const pageSize = isServerPagination
    ? serverPagination.size
    : 10

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay: 3,
  })

  const handlePreviousPage = () => {
    if (isServerPagination) {
      onPageChange(currentPage - 1)
    } else {
      table.previousPage()
    }
  }

  const handleNextPage = () => {
    if (isServerPagination) {
      onPageChange(currentPage + 1)
    } else {
      table.nextPage()
    }
  }

  const handleGoToPage = (page: number) => {
    if (isServerPagination) {
      onPageChange(page)
    } else {
      table.setPageIndex(page - 1)
    }
  }

  // 处理回车键搜索
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="w-full">
      <div className="border-b">
        {/* 筛选区域 */}
        <div className="flex flex-wrap items-center gap-3 py-4">
          {/* 团队ID */}
          <Input
            placeholder="团队ID"
            value={localFilters.teamId ?? ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                teamId: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            onKeyDown={handleKeyDown}
            className="w-48"
          />

          {/* 团队名称 */}
          <Input
            placeholder="团队名称"
            value={localFilters.name ?? ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                name: e.target.value || undefined,
              }))
            }
            onKeyDown={handleKeyDown}
            className="w-48"
          />

          {/* 所有者ID */}
          <Input
            placeholder="所有者ID"
            value={localFilters.ownerId ?? ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                ownerId: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            onKeyDown={handleKeyDown}
            className="w-48"
          />

          {/* 团队类型 */}
          <Select
            value={localFilters.type ?? 'all'}
            onValueChange={(value) => {
              const newFilters = {
                ...localFilters,
                type: value === 'all' ? undefined : value as TeamType,
              }
              setLocalFilters(newFilters)
              // 类型变化时立即触发搜索
              const cleanedFilters: TeamFilters = {}
              if (newFilters.teamId) cleanedFilters.teamId = newFilters.teamId
              if (newFilters.name?.trim()) cleanedFilters.name = newFilters.name.trim()
              if (newFilters.type) cleanedFilters.type = newFilters.type
              if (newFilters.ownerId) cleanedFilters.ownerId = newFilters.ownerId
              if (newFilters.disbanded !== undefined) cleanedFilters.disbanded = newFilters.disbanded
              onFiltersChange?.(cleanedFilters)
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="全部类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="PERSONAL_SPACE">个人空间</SelectItem>
              <SelectItem value="COLLABORATION_TEAM">协作团队</SelectItem>
            </SelectContent>
          </Select>

          {/* 是否已解散 */}
          <Select
            value={localFilters.disbanded === undefined ? 'all' : localFilters.disbanded ? 'true' : 'false'}
            onValueChange={(value) => {
              const newFilters = {
                ...localFilters,
                disbanded: value === 'all' ? undefined : value === 'true',
              }
              setLocalFilters(newFilters)
              // 状态变化时立即触发搜索
              const cleanedFilters: TeamFilters = {}
              if (newFilters.teamId) cleanedFilters.teamId = newFilters.teamId
              if (newFilters.name?.trim()) cleanedFilters.name = newFilters.name.trim()
              if (newFilters.type) cleanedFilters.type = newFilters.type
              if (newFilters.ownerId) cleanedFilters.ownerId = newFilters.ownerId
              if (newFilters.disbanded !== undefined) cleanedFilters.disbanded = newFilters.disbanded
              onFiltersChange?.(cleanedFilters)
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="false">正常</SelectItem>
              <SelectItem value="true">已解散</SelectItem>
            </SelectContent>
          </Select>



          {/* 清除筛选 */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <XIcon className="mr-1 size-4" />
              清除筛选
            </Button>
          )}

          {/* 刷新按钮 */}
          <div className="ml-auto space-x-2.5">
            <Button size="icon" variant="outline" onClick={handleSearch}>
              <SearchIcon className="size-4" />
            </Button>
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
            {(currentPage - 1) * pageSize + 1} 到{' '}
            {Math.min(currentPage * pageSize, totalRecords)}
          </span>{' '}
          条，共 <span>{totalRecords} 条</span>
        </p>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  className="disabled:pointer-events-none disabled:opacity-50"
                  variant="ghost"
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1}
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
                const isActive = page === currentPage

                return (
                  <PaginationItem key={page}>
                    <Button
                      size="icon"
                      variant={isActive ? 'default' : 'ghost'}
                      className={cn(
                        !isActive &&
                        'bg-primary/10 text-primary hover:bg-primary/20'
                      )}
                      onClick={() => handleGoToPage(page)}
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
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
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
