import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { NotificationTemplateDatatable } from '@/components/datatable'
import {
  getTemplateList,
  deleteTemplate,
  updateTemplateStatus,
} from '@/services/notification-template'
import type { TemplateListVO, TemplateListParams } from '@/types/notification-template.types'
import { CreateTemplateDialog } from '@/components/notification-template/CreateTemplateDialog'
import { EditTemplateDialog } from '@/components/notification-template/EditTemplateDialog'
import { TemplateDetailSheet } from '@/components/notification-template/TemplateDetailSheet'
import { SendNotificationDialog } from '@/components/notification-template/SendNotificationDialog'

export default function NotificationTemplates() {
  const [templates, setTemplates] = useState<TemplateListVO[]>([])
  const [loading, setLoading] = useState(false)

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [templateToEdit, setTemplateToEdit] = useState<TemplateListVO | null>(null)

  // Detail sheet state
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [templateToView, setTemplateToView] = useState<TemplateListVO | null>(null)

  // Send notification dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [templateToSend, setTemplateToSend] = useState<TemplateListVO | null>(null)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const params: TemplateListParams = {
        page: 1,
        size: 100,
      }
      const response = await getTemplateList(params)
      if (response.data.code === 'SUCCESS') {
        setTemplates(response.data.data?.records || [])
      } else {
        toast.error(response.data.message || '获取模板列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      toast.error('获取模板列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleView = (template: TemplateListVO) => {
    setTemplateToView(template)
    setDetailSheetOpen(true)
  }

  const handleEdit = (template: TemplateListVO) => {
    setTemplateToEdit(template)
    setEditDialogOpen(true)
  }

  const handleSendNotification = (template: TemplateListVO) => {
    setTemplateToSend(template)
    setSendDialogOpen(true)
  }

  const handleDelete = async (template: TemplateListVO) => {
    try {
      const response = await deleteTemplate(template.id)
      if (response.data.code === 'SUCCESS') {
        toast.success(`模板 "${template.name}" 已删除`)
        fetchTemplates()
      } else {
        toast.error(response.data.message || '删除模板失败')
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast.error('删除模板失败')
    }
  }

  const handleToggleStatus = async (template: TemplateListVO) => {
    const newStatus = template.status === 'active' ? 'INACTIVE' : 'ACTIVE'
    const action = newStatus === 'ACTIVE' ? '启用' : '禁用'

    try {
      const response = await updateTemplateStatus(template.id, { status: newStatus })
      if (response.data.code === 'SUCCESS') {
        toast.success(`模板 "${template.name}" 已${action}`)
        fetchTemplates()
      } else {
        toast.error(response.data.message || `${action}模板失败`)
      }
    } catch (error) {
      console.error('Failed to update template status:', error)
      toast.error(`${action}模板失败`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card">
        <NotificationTemplateDatatable
          data={templates}
          loading={loading}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onEdit={handleEdit}
          onView={handleView}
          onSendNotification={handleSendNotification}
          onRefresh={fetchTemplates}
          onCreateClick={() => setCreateDialogOpen(true)}
        />
      </div>

      <CreateTemplateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchTemplates}
      />

      <EditTemplateDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        template={templateToEdit}
        onSuccess={fetchTemplates}
      />

      <TemplateDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        template={templateToView}
      />

      <SendNotificationDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        template={templateToSend}
      />
    </div>
  )
}
