import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { AdminDetailSheet, CreateAdminDialog } from '@/components/admin'
import { AdminDatatable } from '@/components/datatable'
import {
  getAdminList,
  deleteAdmin,
  updateAdminStatus,
  resetAdminPassword,
} from '@/services/admin'
import type { AdminVO, AdminListParams } from '@/types/admin.types'

export default function Admins() {
  const [admins, setAdmins] = useState<AdminVO[]>([])
  const [loading, setLoading] = useState(false)

  // Detail sheet state
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    try {
      const params: AdminListParams = {
        page: 1,
        size: 100,
      }
      const response = await getAdminList(params)
      if (response.data.code === 'SUCCESS') {
        setAdmins(response.data.data?.records || [])
      } else {
        toast.error(response.data.message || '获取管理员列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error)
      toast.error('获取管理员列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAdmins()
  }, [fetchAdmins])

  const handleAdminClick = (adminId: number) => {
    setSelectedAdminId(adminId)
    setSheetOpen(true)
  }

  const handleDelete = async (admin: AdminVO) => {
    try {
      const response = await deleteAdmin(admin.id)
      if (response.data.code === 'SUCCESS') {
        toast.success(`管理员 "${admin.nickname}" 已删除`)
        fetchAdmins()
      } else {
        toast.error(response.data.message || '删除管理员失败')
      }
    } catch (error) {
      console.error('Failed to delete admin:', error)
      toast.error('删除管理员失败')
    }
  }

  const handleToggleStatus = async (admin: AdminVO) => {
    const newStatus = !admin.status
    const action = newStatus ? '启用' : '禁用'

    try {
      const response = await updateAdminStatus(admin.id, newStatus)
      if (response.data.code === 'SUCCESS') {
        toast.success(`管理员 "${admin.nickname}" 已${action}`)
        fetchAdmins()
      } else {
        toast.error(response.data.message || `${action}管理员失败`)
      }
    } catch (error) {
      console.error('Failed to update admin status:', error)
      toast.error(`${action}管理员失败`)
    }
  }

  const handleResetPassword = async (
    admin: AdminVO,
    newPassword: string
  ): Promise<boolean> => {
    try {
      const response = await resetAdminPassword({
        adminId: admin.id,
        newPassword,
      })
      if (response.data.code === 'SUCCESS') {
        toast.success(`管理员 "${admin.nickname}" 的密码已重置`)
        return true
      } else {
        toast.error(response.data.message || '重置密码失败')
        return false
      }
    } catch (error) {
      console.error('Failed to reset admin password:', error)
      toast.error('重置密码失败')
      return false
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card">
        <AdminDatatable
          data={admins}
          loading={loading}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onAdminClick={handleAdminClick}
          onResetPassword={handleResetPassword}
          onRefresh={fetchAdmins}
          onCreateClick={() => setCreateDialogOpen(true)}
        />
      </div>

      <AdminDetailSheet
        adminId={selectedAdminId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      <CreateAdminDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchAdmins}
      />
    </div>
  )
}
