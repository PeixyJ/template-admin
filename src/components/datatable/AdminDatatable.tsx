import { useId, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldIcon,
  CalendarIcon,
  Trash2Icon,
  BanIcon,
  CheckCircleIcon,
  Loader2Icon,
  KeyRoundIcon,
  RefreshCwIcon,
  CopyIcon,
  CheckIcon,
  PlusIcon,
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
import type { AdminVO } from '@/types/admin.types'

interface AdminDatatableProps {
  data: AdminVO[]
  loading?: boolean
  onDelete?: (admin: AdminVO) => void
  onToggleStatus?: (admin: AdminVO) => void
  onAdminClick?: (adminId: number) => void
  onResetPassword?: (admin: AdminVO, password: string) => Promise<boolean>
  onRefresh?: () => void
  onCreateClick?: () => void
}

const columns: ColumnDef<AdminVO>[] = [
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
    header: '管理员信息',
    accessorKey: 'nickname',
    cell: ({ row, table }) => {
      const initials = row.original.nickname
        ? row.original.nickname.charAt(0).toUpperCase()
        : null
      const meta = table.options.meta as {
        onAdminClick?: (adminId: number) => void
      }
      return (
        <div className="flex items-center gap-4">
          <Avatar className="size-10 rounded-lg">
            {row.original.avatarUrl ? (
              <AvatarImage src={row.original.avatarUrl} alt={row.original.nickname} />
            ) : null}
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
              {initials || <ShieldIcon className="size-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => meta?.onAdminClick?.(row.original.id)}
              className="text-left font-medium transition-colors hover:text-primary hover:underline"
            >
              {row.getValue('nickname')}
            </button>
            <span className="text-xs text-muted-foreground">
              {row.original.account?.credential || `ID: ${row.original.id}`}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    header: '状态',
    accessorKey: 'status',
    cell: ({ row }) => {
      const isEnabled = row.getValue('status') as boolean
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
            isEnabled
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          )}
        >
          {isEnabled ? (
            <>
              <CheckCircleIcon className="size-3" />
              {row.original.statusDesc || '正常'}
            </>
          ) : (
            <>
              <BanIcon className="size-3" />
              {row.original.statusDesc || '已禁用'}
            </>
          )}
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
        onDelete?: (admin: AdminVO) => void
        onToggleStatus?: (admin: AdminVO) => void
        onOpenResetPassword?: (admin: AdminVO) => void
        onOpenDelete?: (admin: AdminVO) => void
        onOpenToggleStatus?: (admin: AdminVO) => void
      }
      const isEnabled = row.original.status
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
            onClick={() => meta?.onOpenToggleStatus?.(row.original)}
            title={isEnabled ? '禁用' : '启用'}
          >
            {isEnabled ? (
              <BanIcon className="size-4 text-orange-600" />
            ) : (
              <CheckCircleIcon className="size-4 text-green-600" />
            )}
            <span className="sr-only">{isEnabled ? '禁用' : '启用'}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            onClick={() => meta?.onOpenDelete?.(row.original)}
          >
            <Trash2Icon className="size-4" />
            <span className="sr-only">删除管理员</span>
          </Button>
        </div>
      )
    },
  },
]

export function AdminDatatable({
  data,
  loading,
  onDelete,
  onToggleStatus,
  onAdminClick,
  onResetPassword,
  onRefresh,
  onCreateClick,
}: AdminDatatableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const pageSize = 10

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  })

  // Reset password dialog state
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [adminToReset, setAdminToReset] = useState<AdminVO | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const [resultPassword, setResultPassword] = useState('')
  const [resultAdmin, setResultAdmin] = useState<AdminVO | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState<AdminVO | null>(null)

  // Toggle status dialog state
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false)
  const [adminToToggle, setAdminToToggle] = useState<AdminVO | null>(null)

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword(password)
  }

  const handleOpenResetPassword = (admin: AdminVO) => {
    setAdminToReset(admin)
    setNewPassword('')
    setResetPasswordOpen(true)
  }

  const handleConfirmResetPassword = async () => {
    if (!adminToReset) return
    const password = newPassword || generateRandomPasswordString()
    setIsResetting(true)
    try {
      const success = await onResetPassword?.(adminToReset, password)
      if (success) {
        setResultPassword(password)
        setResultAdmin(adminToReset)
        setResetPasswordOpen(false)
        setResultDialogOpen(true)
      }
    } finally {
      setIsResetting(false)
      setAdminToReset(null)
      setNewPassword('')
    }
  }

  const handleOpenDelete = (admin: AdminVO) => {
    setAdminToDelete(admin)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (adminToDelete) {
      onDelete?.(adminToDelete)
    }
    setDeleteDialogOpen(false)
    setAdminToDelete(null)
  }

  const handleOpenToggleStatus = (admin: AdminVO) => {
    setAdminToToggle(admin)
    setToggleStatusDialogOpen(true)
  }

  const handleConfirmToggleStatus = () => {
    if (adminToToggle) {
      onToggleStatus?.(adminToToggle)
    }
    setToggleStatusDialogOpen(false)
    setAdminToToggle(null)
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      pagination,
    },
    meta: {
      onDelete,
      onToggleStatus,
      onAdminClick,
      onOpenResetPassword: handleOpenResetPassword,
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
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 py-3">
        <Filter column={table.getColumn('nickname')!} />
        <div className="flex items-center gap-2">
          <Button onClick={onCreateClick}>
            <PlusIcon className="mr-2 size-4" />
            创建管理员
          </Button>
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

      {/* Reset Password Dialog */}
      <AlertDialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>重置密码</AlertDialogTitle>
            <AlertDialogDescription>
              为管理员 <span className="font-medium text-foreground">{adminToReset?.nickname}</span> 设置新密码。
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

      {/* Password Result Dialog */}
      <AlertDialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>密码重置成功</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  管理员 <span className="font-medium text-foreground">{resultAdmin?.nickname}</span> 的密码已重置。
                </p>
                <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">新密码</p>
                    <p className="mt-1 font-mono text-lg font-medium text-foreground">{resultPassword}</p>
                  </div>
                  <CopyPasswordButton password={resultPassword} />
                </div>
                <p className="text-sm text-muted-foreground">请将新密码告知管理员。</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除管理员 <span className="font-medium text-foreground">{adminToDelete?.nickname}</span> 吗？此操作不可撤销。
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
              {adminToToggle?.status ? '禁用管理员' : '启用管理员'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              确定要{adminToToggle?.status ? '禁用' : '启用'}管理员{' '}
              <span className="font-medium text-foreground">{adminToToggle?.nickname}</span> 吗？
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

function generateRandomPasswordString(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
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

function Filter({ column }: { column: Column<AdminVO, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()

  return (
    <div>
      <Label htmlFor={`${id}-input`} className="sr-only">
        搜索管理员
      </Label>
      <Input
        id={`${id}-input`}
        value={(columnFilterValue ?? '') as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder="搜索管理员昵称..."
        type="text"
        className="w-[200px]"
      />
    </div>
  )
}
