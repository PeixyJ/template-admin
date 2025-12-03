import type { ChangeEvent } from 'react'
import { useState } from 'react'
import { Loader2Icon, PlusIcon, Trash2Icon } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Switch } from '@/components/ui/switch'

import { createTemplate } from '@/services/notification-template'
import type { ActionConfig, ParamSchema, CreateTemplateDTO } from '@/types/notification-template.types'

interface CreateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const NOTIFICATION_TYPES = [
  { value: 'system', label: '系统通知' },
  { value: 'announcement', label: '公告' },
  { value: 'security_alert', label: '安全警告' },
  { value: 'reminder', label: '提醒' },
  { value: 'promotion', label: '推广' },
]

const ACTION_STYLES = [
  { value: 'primary', label: '主要' },
  { value: 'secondary', label: '次要' },
  { value: 'danger', label: '危险' },
  { value: 'success', label: '成功' },
]

const ACTION_TYPES = [
  { value: 'endpoint', label: '调用接口' },
  { value: 'redirect', label: '跳转链接' },
]

const PARAM_TYPES = [
  { value: 'string', label: '字符串' },
  { value: 'number', label: '数字' },
  { value: 'boolean', label: '布尔值' },
]

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const emptyAction: ActionConfig = {
  actionKey: '',
  label: '',
  style: 'primary',
  actionType: 'redirect',
  confirmRequired: false,
}

const emptyParam: ParamSchema = {
  name: '',
  type: 'string',
  desc: '',
  required: false,
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTemplateDialogProps) {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<CreateTemplateDTO>({
    code: '',
    name: '',
    description: '',
    type: '',
    titleTemplate: '',
    contentTemplate: '',
    defaultActions: [],
    paramSchema: [],
  })

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: '',
      titleTemplate: '',
      contentTemplate: '',
      defaultActions: [],
      paramSchema: [],
    })
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const handleAddAction = () => {
    setFormData((prev) => ({
      ...prev,
      defaultActions: [...(prev.defaultActions || []), { ...emptyAction }],
    }))
  }

  const handleRemoveAction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      defaultActions: prev.defaultActions?.filter((_, i) => i !== index),
    }))
  }

  const handleUpdateAction = (index: number, field: keyof ActionConfig, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      defaultActions: prev.defaultActions?.map((action, i) =>
        i === index ? { ...action, [field]: value } : action
      ),
    }))
  }

  const handleAddParam = () => {
    setFormData((prev) => ({
      ...prev,
      paramSchema: [...(prev.paramSchema || []), { ...emptyParam }],
    }))
  }

  const handleRemoveParam = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      paramSchema: prev.paramSchema?.filter((_, i) => i !== index),
    }))
  }

  const handleUpdateParam = (index: number, field: keyof ParamSchema, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      paramSchema: prev.paramSchema?.map((param, i) =>
        i === index ? { ...param, [field]: value } : param
      ),
    }))
  }

  const handleSubmit = async () => {
    if (!formData.code.trim()) {
      toast.error('请输入模板编码')
      return
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.code)) {
      toast.error('模板编码必须以字母开头，只能包含字母、数字和下划线')
      return
    }
    if (!formData.name.trim()) {
      toast.error('请输入模板名称')
      return
    }
    if (!formData.type) {
      toast.error('请选择通知类型')
      return
    }
    if (!formData.titleTemplate.trim()) {
      toast.error('请输入标题模板')
      return
    }
    if (!formData.contentTemplate.trim()) {
      toast.error('请输入内容模板')
      return
    }

    setLoading(true)
    try {
      const res = await createTemplate({
        ...formData,
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        titleTemplate: formData.titleTemplate.trim(),
        contentTemplate: formData.contentTemplate.trim(),
      })

      if (res.data.code === 'SUCCESS') {
        toast.success('模板创建成功')
        handleClose(false)
        onSuccess()
      } else {
        toast.error(res.data.message || '创建失败')
      }
    } catch (error) {
      console.error('Create template error:', error)
      toast.error('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>创建通知模板</DialogTitle>
          <DialogDescription>
            填写模板信息，使用 FreeMarker 语法定义标题和内容模板
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">
                模板编码 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                placeholder="如：welcome_notification"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                以字母开头，只能包含字母、数字和下划线
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">
                模板名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="如：欢迎通知"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="type">
              通知类型 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: string) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择通知类型" />
              </SelectTrigger>
              <SelectContent>
                {NOTIFICATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">描述</Label>
            <Input
              id="description"
              placeholder="模板描述（可选）"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="titleTemplate">
              标题模板 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titleTemplate"
              placeholder="如：欢迎 ${username} 加入"
              value={formData.titleTemplate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, titleTemplate: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              支持 FreeMarker 语法，如 ${'{'}variableName{'}'}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="contentTemplate">
              内容模板 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="contentTemplate"
              placeholder="输入通知内容模板..."
              value={formData.contentTemplate}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev) => ({ ...prev, contentTemplate: e.target.value }))
              }
              rows={4}
            />
          </div>

          <Accordion type="multiple" className="w-full">
            {/* 参数说明 */}
            <AccordionItem value="params">
              <AccordionTrigger>参数说明</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3">
                  {formData.paramSchema?.map((param, index) => (
                    <div key={index} className="grid gap-2 rounded-lg border p-3">
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input
                          placeholder="参数名"
                          value={param.name}
                          onChange={(e) => handleUpdateParam(index, 'name', e.target.value)}
                        />
                        <Select
                          value={param.type}
                          onValueChange={(value: string) => handleUpdateParam(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PARAM_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={param.required}
                            onCheckedChange={(checked: boolean) => handleUpdateParam(index, 'required', checked)}
                          />
                          <span className="text-sm">必填</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto text-destructive"
                            onClick={() => handleRemoveParam(index)}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <Input
                        placeholder="参数描述"
                        value={param.desc}
                        onChange={(e) => handleUpdateParam(index, 'desc', e.target.value)}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddParam}
                  >
                    <PlusIcon className="mr-2 size-4" />
                    添加参数
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 操作按钮 */}
            <AccordionItem value="actions">
              <AccordionTrigger>操作按钮</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3">
                  {formData.defaultActions?.map((action, index) => (
                    <div key={index} className="flex flex-col gap-2 rounded-lg border p-3">
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input
                          placeholder="操作标识"
                          value={action.actionKey}
                          onChange={(e) => handleUpdateAction(index, 'actionKey', e.target.value)}
                        />
                        <Input
                          placeholder="按钮文字"
                          value={action.label}
                          onChange={(e) => handleUpdateAction(index, 'label', e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                          <Select
                            value={action.style}
                            onValueChange={(value: string) => handleUpdateAction(index, 'style', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ACTION_STYLES.map((style) => (
                                <SelectItem key={style.value} value={style.value}>
                                  {style.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleRemoveAction(index)}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Select
                          value={action.actionType}
                          onValueChange={(value: string) => handleUpdateAction(index, 'actionType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {action.actionType === 'endpoint' ? (
                          <Select
                            value={action.endpointMethod || 'POST'}
                            onValueChange={(value: string) => handleUpdateAction(index, 'endpointMethod', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {HTTP_METHODS.map((method) => (
                                <SelectItem key={method} value={method}>
                                  {method}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : null}
                      </div>
                      {action.actionType === 'endpoint' ? (
                        <Input
                          placeholder="接口URL模板，如：/api/notifications/${id}/approve"
                          value={action.endpointUrlPattern || ''}
                          onChange={(e) => handleUpdateAction(index, 'endpointUrlPattern', e.target.value)}
                        />
                      ) : (
                        <Input
                          placeholder="跳转URL模板，如：/dashboard/orders/${orderId}"
                          value={action.redirectUrlPattern || ''}
                          onChange={(e) => handleUpdateAction(index, 'redirectUrlPattern', e.target.value)}
                        />
                      )}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={action.confirmRequired}
                            onCheckedChange={(checked: boolean) => handleUpdateAction(index, 'confirmRequired', checked)}
                          />
                          <span className="text-sm">需要确认</span>
                        </div>
                      </div>
                      {action.confirmRequired && (
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Input
                            placeholder="确认框标题"
                            value={action.confirmTitle || ''}
                            onChange={(e) => handleUpdateAction(index, 'confirmTitle', e.target.value)}
                          />
                          <Input
                            placeholder="确认框内容"
                            value={action.confirmMessage || ''}
                            onChange={(e) => handleUpdateAction(index, 'confirmMessage', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddAction}
                  >
                    <PlusIcon className="mr-2 size-4" />
                    添加操作按钮
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
