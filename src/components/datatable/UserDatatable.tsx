import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  BanIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon,
  RefreshCwIcon,
  KeyRoundIcon,
} from 'lucide-react'
import { toast } from 'sonner'

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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

import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'
import type { UserVO } from '@/types/user.types'

interface UserDatatableProps {
  data: UserVO[]
  loading?: boolean
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
          <Avatar className="size-10 rounded-lg">
            {row.original.avatarUrl ? (
              <AvatarImage src={row.original.avatarUrl} alt={row.original.nickname} />
            ) : null}
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
              {initials || <UserIcon className="size-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => meta?.onUserClick?.(row.original.id)}
                className="text-left font-medium transition-colors hover:text-primary hover:underline"
              >
                {row.getValue('nickname')}
              </button>
              <Badge
                variant={row.original.status ? 'outline' : 'destructive'}
                className={cn(
                  'text-xs',
                  row.original.status && 'border-green-500/50 bg-green-500/10 text-green-600'
                )}
              >
                {row.original.statusDesc}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              ID: {row.original.id}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    header: '',
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
          <span className="text-sm text-muted-foreground">{inviter.nickname}</span>
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
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onToggleStatus?: (user: UserVO) => void
        onOpenResetPassword?: (user: UserVO) => void
      }
      const isActive = row.original.status
      return (
        <div className="flex items-center gap-1">
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
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => meta?.onToggleStatus?.(row.original)}
            title={isActive ? '禁用用户' : '启用用户'}
          >
            {isActive ? (
              <BanIcon className="size-4 text-destructive" />
            ) : (
              <CheckCircleIcon className="size-4 text-green-600" />
            )}
            <span className="sr-only">{isActive ? '禁用' : '启用'}</span>
          </Button>
        </div>
      )
    },
  },
]

export function UserDatatable({
  data,
  loading,
  onToggleStatus,
  onResetPassword,
  onRefresh,
  onUserClick,
}: UserDatatableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const pageSize = 10

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  })

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

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      pagination,
    },
    meta: {
      onToggleStatus,
      onOpenResetPassword: handleOpenResetPassword,
      onUserClick,
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
          <span className="font-medium">用户列表</span>
          <div className="flex items-center gap-2">
            <Filter column={table.getColumn('nickname')!} />
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

function Filter({ column }: { column: Column<UserVO, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()

  return (
    <div>
      <Label htmlFor={`${id}-input`} className="sr-only">
        搜索用户
      </Label>
      <Input
        id={`${id}-input`}
        value={(columnFilterValue ?? '') as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder="搜索用户昵称..."
        type="text"
        className="w-[200px]"
      />
    </div>
  )
}
