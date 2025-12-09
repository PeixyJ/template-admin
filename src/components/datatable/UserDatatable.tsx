import { useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  CalendarIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon,
  RefreshCwIcon,
  KeyRoundIcon,
  SearchIcon,
  XIcon,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
import type { UserVO } from '@/types/user.types'

/** 筛选条件（不含分页） */
export interface UserFilters {
  userId?: number
  nickname?: string
  email?: string
  phone?: string
  status?: boolean
}

interface PaginationInfo {
  current: number
  size: number
  total: number
  pages: number
}

interface UserDatatableProps {
  data: UserVO[]
  loading?: boolean
  pagination?: PaginationInfo
  filters?: UserFilters
  onPageChange?: (page: number) => void
  onFiltersChange?: (filters: UserFilters) => void
  onToggleStatus?: (user: UserVO) => void
  onResetPassword?: (user: UserVO, password: string) => Promise<boolean>
  onRefresh?: () => void
  onUserClick?: (userId: number) => void
}

const columns: ColumnDef<UserVO>[] = [
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
    header: '用户信息',
    accessorKey: 'nickname',
    cell: ({ row, table }) => {
      const initials = row.original.nickname
        ? row.original.nickname.charAt(0).toUpperCase()
        : null
      const meta = table.options.meta as {
        onUserClick?: (userId: number) => void
      }
      return (
        <div className="flex items-center gap-4">
          <Avatar className={cn(
            'size-10 rounded-lg ring-2',
            row.original.status ? 'ring-transparent' : 'ring-destructive/40'
          )}>
            {row.original.avatarUrl ? (
              <AvatarImage src={row.original.avatarUrl} alt={row.original.nickname} />
            ) : null}
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
              {initials || <UserIcon className="size-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => meta?.onUserClick?.(row.original.id)}
              className="text-left font-medium transition-colors hover:text-primary hover:underline"
            >
              {row.getValue('nickname')}
            </button>
            <CopyableId id={row.original.id} />
          </div>
        </div>
      )
    },
  },
  {
    header: '邀请码',
    accessorKey: 'inviteCode',
    cell: ({ row }) => {
      const inviteCode = row.getValue('inviteCode') as string | null
      const [copied, setCopied] = useState(false)

      const handleCopy = async () => {
        if (!inviteCode) return
        try {
          await navigator.clipboard.writeText(inviteCode)
          setCopied(true)
          toast.success('邀请码已复制')
          setTimeout(() => setCopied(false), 2000)
        } catch {
          toast.error('复制失败')
        }
      }

      if (!inviteCode) {
        return <span className="text-sm text-muted-foreground">-</span>
      }

      return (
        <button
          onClick={handleCopy}
          className="group flex items-center gap-1.5 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
          title="点击复制"
        >
          {inviteCode}
          {copied ? (
            <CheckIcon className="size-3.5 text-green-500" />
          ) : (
            <CopyIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </button>
      )
    },
  },
  {
    header: '邀请人',
    accessorKey: 'inviter',
    cell: ({ row }) => {
      const inviter = row.original.inviter
      if (!inviter) {
        return <span className="text-sm text-muted-foreground">-</span>
      }
      const initials = inviter.nickname?.charAt(0).toUpperCase()
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-7 rounded-full">
            {inviter.avatarUrl ? (
              <AvatarImage src={inviter.avatarUrl} alt={inviter.nickname} />
            ) : null}
            <AvatarFallback className="rounded-full bg-primary/10 text-xs text-primary">
              {initials || <UserIcon className="size-3" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">{inviter.nickname}</span>
            <CopyableId id={inviter.id} />
          </div>
        </div>
      )
    },
  },
  {
    header: '注册时间',
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
    id: 'status',
    header: '状态',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onToggleStatu?: (user: UserVO) => void
      }
      const isActive = row.original.status
      return (
        <Switch
          checked={isActive}
          onCheckedChange={() => meta?.onToggleStatus?.(row.original)}
          aria-label={isActive ? '禁用用户' : '启用用户'}
        />
      )
    },
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onOpenResetPassword?: (user: UserVO) => void
      }
      return (
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          title="重置密码"
          onClick={() => meta?.onOpenResetPassword?.(row.original)}
        >
          <KeyRoundIcon className="size-4 text-amber-600" />
          <span className="sr-only">重置密码</span>
        </Button>
      )
    },
  },
]

export function UserDatatable({
  data,
  loading,
  pagination: serverPagination,
  filters = {},
  onPageChange,
  onFiltersChange,
  onToggleStatus,
  onResetPassword,
  onRefresh,
  onUserClick,
}: UserDatatableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // 本地筛选表单状态
  const [localFilters, setLocalFilters] = useState<UserFilters>(filters)

  // 服务端分页模式
  const isServerPagination = !!serverPagination && !!onPageChange

  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [userToReset, setUserToReset] = useState<UserVO | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const [resultPassword, setResultPassword] = useState('')
  const [resultUser, setResultUser] = useState<UserVO | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  const generateRandomPassword = () => {
    const password = Math.random().toString(36).slice(-8)
    setNewPassword(password)
  }

  const handleOpenResetPassword = (user: UserVO) => {
    setUserToReset(user)
    setNewPassword('')
    setResetPasswordOpen(true)
  }

  const handleConfirmResetPassword = async () => {
    if (!userToReset) return
    const password = newPassword || Math.random().toString(36).slice(-8)
    setIsResetting(true)
    try {
      const success = await onResetPassword?.(userToReset, password)
      if (success) {
        setResultPassword(password)
        setResultUser(userToReset)
        setResetPasswordOpen(false)
        setResultDialogOpen(true)
      }
    } finally {
      setIsResetting(false)
      setUserToReset(null)
      setNewPassword('')
    }
  }

  // 处理筛选表单提交
  const handleSearch = () => {
    // 清理空值
    const cleanedFilters: UserFilters = {}
    if (localFilters.userId) cleanedFilters.userId = localFilters.userId
    if (localFilters.nickname?.trim()) cleanedFilters.nickname = localFilters.nickname.trim()
    if (localFilters.email?.trim()) cleanedFilters.email = localFilters.email.trim()
    if (localFilters.phone?.trim()) cleanedFilters.phone = localFilters.phone.trim()
    if (localFilters.status !== undefined) cleanedFilters.status = localFilters.status
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
      onToggleStatus,
      onOpenResetPassword: handleOpenResetPassword,
      onUserClick,
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
      {/* 筛选区域 */}
      <div className="flex flex-wrap items-center gap-3 py-4">
        {/* 用户ID */}
        <Input
          type="number"
          placeholder="用户ID"
          value={localFilters.userId ?? ''}
          onChange={(e) =>
            setLocalFilters((prev) => ({
              ...prev,
              userId: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
          onKeyDown={handleKeyDown}
          className="w-48"
        />

        {/* 用户昵称 */}
        <Input
          placeholder="用户昵称"
          value={localFilters.nickname ?? ''}
          onChange={(e) =>
            setLocalFilters((prev) => ({
              ...prev,
              nickname: e.target.value || undefined,
            }))
          }
          onKeyDown={handleKeyDown}
          className="w-48"
        />

        {/* 邮箱 */}
        <Input
          type="email"
          placeholder="邮箱"
          value={localFilters.email ?? ''}
          onChange={(e) =>
            setLocalFilters((prev) => ({
              ...prev,
              email: e.target.value || undefined,
            }))
          }
          onKeyDown={handleKeyDown}
          className="w-48"
        />

        {/* 手机号 */}
        <Input
          type="tel"
          placeholder="手机号"
          value={localFilters.phone ?? ''}
          onChange={(e) =>
            setLocalFilters((prev) => ({
              ...prev,
              phone: e.target.value || undefined,
            }))
          }
          onKeyDown={handleKeyDown}
          className="w-48"
        />

        {/* 状态 */}
        <Select
          value={localFilters.status === undefined ? 'all' : localFilters.status ? 'true' : 'false'}
          onValueChange={(value) => {
            const newFilters = {
              ...localFilters,
              status: value === 'all' ? undefined : value === 'true',
            }
            setLocalFilters(newFilters)
            // 状态变化时立即触发搜索
            const cleanedFilters: UserFilters = {}
            if (newFilters.userId) cleanedFilters.userId = newFilters.userId
            if (newFilters.nickname?.trim()) cleanedFilters.nickname = newFilters.nickname.trim()
            if (newFilters.email?.trim()) cleanedFilters.email = newFilters.email.trim()
            if (newFilters.phone?.trim()) cleanedFilters.phone = newFilters.phone.trim()
            if (newFilters.status !== undefined) cleanedFilters.status = newFilters.status
            onFiltersChange?.(cleanedFilters)
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="全部状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="true">正常</SelectItem>
            <SelectItem value="false">禁用</SelectItem>
          </SelectContent>
        </Select>

        {/* 搜索按钮 */}


        {/* 清除筛选 */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <XIcon className="mr-1 size-4" />
            清除筛选
          </Button>
        )}

        {/* 刷新按钮 */}
        <div className="ml-auto space-x-2">
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

      <AlertDialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>重置密码</AlertDialogTitle>
            <AlertDialogDescription>
              为用户 <span className="font-medium text-foreground">{userToReset?.nickname}</span> 设置新密码。
              留空则自动生成随机密码。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <Input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="输入新密码或留空自动生成"
              type="text"
              disabled={isResetting}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={generateRandomPassword}
              title="随机生成"
              disabled={isResetting}
            >
              <RefreshCwIcon className="size-4" />
              <span className="sr-only">随机生成</span>
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmResetPassword} disabled={isResetting}>
              {isResetting ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  重置中...
                </>
              ) : (
                '确认重置'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>密码重置成功</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  用户 <span className="font-medium text-foreground">{resultUser?.nickname}</span> 的密码已重置。
                </p>
                <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">新密码</p>
                    <p className="mt-1 font-mono text-lg font-medium text-foreground">{resultPassword}</p>
                  </div>
                  <CopyPasswordButton password={resultPassword} />
                </div>
                <p className="text-sm text-muted-foreground">请将新密码告知用户。</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CopyableId({ id }: { id: number }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(id))
      setCopied(true)
      toast.success('ID已复制')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="group inline-flex items-center gap-1 text-left text-xs text-muted-foreground/70 transition-colors hover:text-primary"
      title="点击复制ID"
    >
      #{id}
      {copied ? (
        <CheckIcon className="size-3 text-green-500" />
      ) : (
        <CopyIcon className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  )
}

function CopyPasswordButton({ password }: { password: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleCopy}
      title="复制密码"
    >
      {copied ? (
        <CheckIcon className="size-4 text-green-500" />
      ) : (
        <CopyIcon className="size-4" />
      )}
      <span className="sr-only">复制密码</span>
    </Button>
  )
}

