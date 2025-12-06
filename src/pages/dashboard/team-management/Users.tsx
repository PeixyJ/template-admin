import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

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
import { UserDatatable, type UserFilters } from '@/components/datatable'
import { UserDetailSheet } from '@/components/user/UserDetailSheet'
import { getUserList, updateUserStatus, resetUserPassword } from '@/services/userAdmin'
import type { UserVO, UserListParams } from '@/types/user.types'

export default function Users() {
  const [users, setUsers] = useState<UserVO[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [userToToggle, setUserToToggle] = useState<UserVO | null>(null)

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
  })

  // 筛选条件
  const [filters, setFilters] = useState<UserFilters>({})

  const fetchUsers = useCallback(async (page = 1, size = 10, currentFilters?: UserFilters) => {
    setLoading(true)
    try {
      const filtersToUse = currentFilters ?? filters
      const params: UserListParams = {
        page,
        size,
        ...filtersToUse,
      }
      const response = await getUserList(params)
      if (response.data.code === 'SUCCESS') {
        const data = response.data.data
        setUsers(data?.records || [])
        setPagination({
          current: data?.current || 1,
          size: data?.size || 10,
          total: data?.total || 0,
          pages: data?.pages || 0,
        })
      } else {
        toast.error(response.data.message || '获取用户列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchUsers(1, pagination.size)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (page: number) => {
    fetchUsers(page, pagination.size)
  }

  const handleFiltersChange = (newFilters: UserFilters) => {
    setFilters(newFilters)
    // 筛选条件变化时，回到第一页
    fetchUsers(1, pagination.size, newFilters)
  }

  const handleToggleStatus = (user: UserVO) => {
    setUserToToggle(user)
    setStatusDialogOpen(true)
  }

  const confirmToggleStatus = async () => {
    if (!userToToggle) return

    const newStatus = !userToToggle.status
    const action = newStatus ? '启用' : '禁用'

    try {
      const response = await updateUserStatus({
        userId: userToToggle.id,
        status: newStatus,
      })
      if (response.data.code === 'SUCCESS') {
        toast.success(`用户 "${userToToggle.nickname}" 已${action}`)
        fetchUsers()
      } else {
        toast.error(response.data.message || `${action}用户失败`)
      }
    } catch (error) {
      console.error('Failed to update user status:', error)
      toast.error(`${action}用户失败`)
    } finally {
      setStatusDialogOpen(false)
      setUserToToggle(null)
    }
  }

  const handleUserClick = (userId: number) => {
    setSelectedUserId(userId)
    setSheetOpen(true)
  }

  const handleResetPassword = async (user: UserVO, password: string): Promise<boolean> => {
    try {
      const response = await resetUserPassword(user.id, password)
      if (response.data.code === 'SUCCESS') {
        return true
      } else {
        toast.error(response.data.message || '重置密码失败')
        return false
      }
    } catch (error) {
      console.error('Failed to reset password:', error)
      toast.error('重置密码失败')
      return false
    }
  }

  const newStatus = userToToggle ? !userToToggle.status : true
  const action = newStatus ? '启用' : '禁用'

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card">
        <UserDatatable
          data={users}
          loading={loading}
          pagination={pagination}
          filters={filters}
          onPageChange={handlePageChange}
          onFiltersChange={handleFiltersChange}
          onToggleStatus={handleToggleStatus}
          onResetPassword={handleResetPassword}
          onRefresh={() => fetchUsers(pagination.current, pagination.size)}
          onUserClick={handleUserClick}
        />
      </div>

      <UserDetailSheet
        userId={selectedUserId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认{action}用户</AlertDialogTitle>
            <AlertDialogDescription>
              确定要{action}用户 "{userToToggle?.nickname}" 吗？
              {!newStatus && '禁用后该用户将无法登录系统。'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleStatus}>
              确认{action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
