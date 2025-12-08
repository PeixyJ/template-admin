import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { NotificationTemplateDatatable } from '@/components/datatable'
import {
  getTemplateList,
  deleteTemplate,
  updateTemplateStatus,
} from '@/services/notification-template'
import type { TemplateVO, TemplateListParams } from '@/types/notification-template.types'
import { CreateTemplateDialog } from '@/components/notification-template/CreateTemplateDialog'
import { EditTemplateDialog } from '@/components/notification-template/EditTemplateDialog'
import { TemplateDetailSheet } from '@/components/notification-template/TemplateDetailSheet'
import { SendNotificationDialog } from '@/components/notification-template/SendNotificationDialog'

export default function NotificationTemplates() {
  const [templates, setTemplates] = useState<TemplateVO[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [templateToEdit, setTemplateToEdit] = useState<TemplateVO | null>(null)

  // Detail sheet state
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [templateToView, setTemplateToView] = useState<TemplateVO | null>(null)

  // Send notification dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [templateToSend, setTemplateToSend] = useState<TemplateVO | null>(null)

  const fetchTemplates = useCallback(async (searchKeyword?: string) => {
    setLoading(true)
    try {
      const params: TemplateListParams = {
        page: 1,
        size: 100,
        keyword: searchKeyword || keyword || undefined,
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
  }, [keyword])

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleSearch = (searchKeyword: string) => {
    setKeyword(searchKeyword)
    fetchTemplates(searchKeyword)
  }

  const handleView = (template: TemplateVO) => {
    setTemplateToView(template)
    setDetailSheetOpen(true)
  }

  const handleEdit = (template: TemplateVO) => {
    setTemplateToEdit(template)
    setEditDialogOpen(true)
  }

  const handleSendNotification = (template: TemplateVO) => {
    setTemplateToSend(template)
    setSendDialogOpen(true)
  }

  const handleDelete = async (template: TemplateVO) => {
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

  const handleToggleStatus = async (template: TemplateVO) => {
    const newStatus = !template.status
    const action = newStatus ? '启用' : '禁用'

    try {
      const response = await updateTemplateStatus(template.id, newStatus)
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
          onRefresh={() => fetchTemplates()}
          onCreateClick={() => setCreateDialogOpen(true)}
          onSearch={handleSearch}
        />
      </div>

      <CreateTemplateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => fetchTemplates()}
      />

      <EditTemplateDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        template={templateToEdit}
        onSuccess={() => fetchTemplates()}
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
