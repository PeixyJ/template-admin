import { useState, useEffect } from 'react'
import { Loader2Icon, EyeIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

import {
  sendNotification,
  previewTemplate,
  getTemplateDetail,
} from '@/services/notification-template'
import type {
  TemplateListVO,
  TemplateDetailVO,
  TemplatePreviewVO,
} from '@/types/notification-template.types'

interface SendNotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: TemplateListVO | null
}

export function SendNotificationDialog({
  open,
  onOpenChange,
  template,
}: SendNotificationDialogProps) {
  const [loading, setLoading] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [fetchingDetail, setFetchingDetail] = useState(false)
  const [templateDetail, setTemplateDetail] = useState<TemplateDetailVO | null>(null)
  const [preview, setPreview] = useState<TemplatePreviewVO | null>(null)

  const [userIds, setUserIds] = useState<string>('')
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({})
  const [expiresInDays, setExpiresInDays] = useState<string>('')

  useEffect(() => {
    if (open && template) {
      fetchDetail(template.id)
    }
  }, [open, template])

  const fetchDetail = async (id: number) => {
    setFetchingDetail(true)
    try {
      const res = await getTemplateDetail(id)
      if (res.data.code === 'SUCCESS' && res.data.data) {
        setTemplateDetail(res.data.data)
        // 初始化参数
        const initialParams: Record<string, string> = {}
        res.data.data.paramSchema?.forEach((param) => {
          initialParams[param.name] = ''
        })
        setTemplateParams(initialParams)
      }
    } catch (error) {
      console.error('Fetch template detail error:', error)
    } finally {
      setFetchingDetail(false)
    }
  }

  const resetForm = () => {
    setUserIds('')
    setTemplateParams({})
    setExpiresInDays('')
    setPreview(null)
    setTemplateDetail(null)
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const handleParamChange = (name: string, value: string) => {
    setTemplateParams((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePreview = async () => {
    if (!template) return

    setPreviewing(true)
    try {
      const params: Record<string, unknown> = {}
      Object.entries(templateParams).forEach(([key, value]) => {
        if (value) {
          params[key] = value
        }
      })

      const res = await previewTemplate(template.id, { params })
      if (res.data.code === 'SUCCESS' && res.data.data) {
        setPreview(res.data.data)
      } else {
        toast.error(res.data.message || '预览失败')
      }
    } catch (error) {
      console.error('Preview template error:', error)
      toast.error('预览失败')
    } finally {
      setPreviewing(false)
    }
  }

  const handleSubmit = async () => {
    if (!template) return

    const userIdList = userIds
      .split(/[,，\s]+/)
      .map((id) => id.trim())
      .filter((id) => id)
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id))

    if (userIdList.length === 0) {
      toast.error('请输入有效的用户ID')
      return
    }

    // 检查必填参数
    const requiredParams = templateDetail?.paramSchema?.filter((p) => p.required) || []
    for (const param of requiredParams) {
      if (!templateParams[param.name]?.trim()) {
        toast.error(`请填写参数：${param.name}`)
        return
      }
    }

    setLoading(true)
    try {
      const params: Record<string, unknown> = {}
      Object.entries(templateParams).forEach(([key, value]) => {
        if (value) {
          params[key] = value
        }
      })

      const res = await sendNotification({
        userIds: userIdList,
        templateCode: template.code,
        templateParams: params,
        expiresInDays: expiresInDays ? parseInt(expiresInDays, 10) : undefined,
      })

      if (res.data.code === 'SUCCESS') {
        const sentCount = res.data.data?.length || 0
        toast.success(`通知已发送给 ${sentCount} 个用户`)
        handleClose(false)
      } else {
        toast.error(res.data.message || '发送失败')
      }
    } catch (error) {
      console.error('Send notification error:', error)
      toast.error('发送失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>发送通知</DialogTitle>
          <DialogDescription>
            使用模板 <span className="font-medium">{template?.name}</span> 发送通知
          </DialogDescription>
        </DialogHeader>

        {fetchingDetail ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="userIds">
                  用户ID <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="userIds"
                  placeholder="输入用户ID，多个用逗号或空格分隔，如：1, 2, 3"
                  value={userIds}
                  onChange={(e) => setUserIds(e.target.value)}
                  rows={2}
                />
              </div>

              {templateDetail?.paramSchema && templateDetail.paramSchema.length > 0 && (
                <div className="flex flex-col gap-3">
                  <Label>模板参数</Label>
                  {templateDetail.paramSchema.map((param) => (
                    <div key={param.name} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={param.name} className="text-sm font-normal">
                          {param.name}
                          {param.required && <span className="text-destructive">*</span>}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {param.type}
                        </Badge>
                      </div>
                      <Input
                        id={param.name}
                        placeholder={param.desc || `输入 ${param.name}`}
                        value={templateParams[param.name] || ''}
                        onChange={(e) => handleParamChange(param.name, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="expiresInDays">过期天数（可选）</Label>
                <Input
                  id="expiresInDays"
                  type="number"
                  placeholder="通知在多少天后过期"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  min={1}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  disabled={previewing}
                >
                  {previewing ? (
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                  ) : (
                    <EyeIcon className="mr-2 size-4" />
                  )}
                  预览
                </Button>
              </div>

              {preview && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="mb-2 text-xs font-medium text-muted-foreground">预览结果</div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground">标题：</span>
                      <span className="font-medium">{preview.title}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">内容：</span>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{preview.content}</p>
                    </div>
                    {preview.actions && preview.actions.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground">操作按钮：</span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {preview.actions.map((action, index) => (
                            <Badge key={index} variant="secondary">
                              {action.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
                发送通知
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
