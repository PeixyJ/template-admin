import { useState, useEffect } from 'react'
import { Loader2Icon, EyeIcon, UsersIcon, UserIcon } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  sendNotification,
  batchSendNotification,
  previewTemplate,
  getTemplateDetail,
} from '@/services/notification-template'
import type {
  TemplateVO,
  TemplateDetailVO,
  NotificationVO,
} from '@/types/notification-template.types'

interface SendNotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: TemplateVO | null
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
  const [preview, setPreview] = useState<NotificationVO | null>(null)
  const [sendMode, setSendMode] = useState<'single' | 'batch'>('single')

  const [userId, setUserId] = useState<string>('')
  const [userIds, setUserIds] = useState<string>('')
  const [teamId, setTeamId] = useState<string>('')
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({})

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
        res.data.data.params?.forEach((param) => {
          initialParams[param.paramKey] = param.defaultValue || ''
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
    setUserId('')
    setUserIds('')
    setTeamId('')
    setTemplateParams({})
    setPreview(null)
    setTemplateDetail(null)
    setSendMode('single')
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const handleParamChange = (paramKey: string, value: string) => {
    setTemplateParams((prev) => ({
      ...prev,
      [paramKey]: value,
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

      const res = await previewTemplate(template.id, params)
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

    // 检查必填参数
    const requiredParams = templateDetail?.params?.filter((p) => p.required) || []
    for (const param of requiredParams) {
      if (!templateParams[param.paramKey]?.trim()) {
        toast.error(`请填写参数：${param.paramKey}`)
        return
      }
    }

    const params: Record<string, unknown> = {}
    Object.entries(templateParams).forEach(([key, value]) => {
      if (value) {
        params[key] = value
      }
    })

    setLoading(true)
    try {
      if (sendMode === 'single') {
        // 单个发送
        const userIdNum = parseInt(userId.trim(), 10)
        if (isNaN(userIdNum)) {
          toast.error('请输入有效的用户ID')
          setLoading(false)
          return
        }

        const res = await sendNotification({
          templateCode: template.code,
          userId: userIdNum,
          teamId: teamId ? parseInt(teamId, 10) : undefined,
          params,
        })

        if (res.data.code === 'SUCCESS') {
          toast.success('通知已发送')
          handleClose(false)
        } else {
          toast.error(res.data.message || '发送失败')
        }
      } else {
        // 批量发送
        const userIdList = userIds
          .split(/[,，\s]+/)
          .map((id) => id.trim())
          .filter((id) => id)
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id))

        if (userIdList.length === 0) {
          toast.error('请输入有效的用户ID列表')
          setLoading(false)
          return
        }

        const res = await batchSendNotification({
          templateCode: template.code,
          userIds: userIdList,
          teamId: teamId ? parseInt(teamId, 10) : undefined,
          params,
        })

        if (res.data.code === 'SUCCESS') {
          const sentCount = res.data.data?.length || 0
          toast.success(`通知已发送给 ${sentCount} 个用户`)
          handleClose(false)
        } else {
          toast.error(res.data.message || '发送失败')
        }
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
              <Tabs value={sendMode} onValueChange={(v) => setSendMode(v as 'single' | 'batch')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single" className="flex items-center gap-2">
                    <UserIcon className="size-4" />
                    单个发送
                  </TabsTrigger>
                  <TabsTrigger value="batch" className="flex items-center gap-2">
                    <UsersIcon className="size-4" />
                    批量发送
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="single" className="mt-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="userId">
                      用户ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="userId"
                      placeholder="输入用户ID"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      type="number"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="batch" className="mt-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="userIds">
                      用户ID列表 <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="userIds"
                      placeholder="输入用户ID，多个用逗号或空格分隔，如：1, 2, 3"
                      value={userIds}
                      onChange={(e) => setUserIds(e.target.value)}
                      rows={2}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex flex-col gap-2">
                <Label htmlFor="teamId">团队ID（可选）</Label>
                <Input
                  id="teamId"
                  placeholder="输入团队ID"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  type="number"
                />
              </div>

              {templateDetail?.params && templateDetail.params.length > 0 && (
                <div className="flex flex-col gap-3">
                  <Label>模板参数</Label>
                  {templateDetail.params.map((param) => (
                    <div key={param.paramKey} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={param.paramKey} className="text-sm font-normal">
                          {param.paramKey}
                          {param.required && <span className="text-destructive">*</span>}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {param.paramType}
                        </Badge>
                      </div>
                      <Input
                        id={param.paramKey}
                        placeholder={param.description || `输入 ${param.paramKey}`}
                        value={templateParams[param.paramKey] || ''}
                        onChange={(e) => handleParamChange(param.paramKey, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}

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
                    {preview.buttons && preview.buttons.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground">按钮：</span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {preview.buttons.map((button, index) => (
                            <Badge key={index} variant="secondary">
                              {button.label}
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
