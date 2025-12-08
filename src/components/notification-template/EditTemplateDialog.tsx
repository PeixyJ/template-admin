import { useState, useEffect } from 'react'
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

import { updateTemplate, getTemplateDetail } from '@/services/notification-template'
import type {
  TemplateParam,
  TemplateButton,
  UpdateTemplateDTO,
  TemplateVO,
  TemplateDetailVO,
  ParentType,
  ButtonStyle,
  ButtonActionType,
} from '@/types/notification-template.types'

interface EditTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: TemplateVO | null
  onSuccess: () => void
}

const PARENT_TYPES: { value: ParentType; label: string }[] = [
  { value: 'INBOX', label: '收件箱' },
  { value: 'SYSTEM', label: '系统通知' },
]

const BUTTON_STYLES: { value: ButtonStyle; label: string }[] = [
  { value: 'PRIMARY', label: '主要' },
  { value: 'DANGER', label: '危险' },
  { value: 'DEFAULT', label: '默认' },
]

const BUTTON_ACTION_TYPES: { value: ButtonActionType; label: string }[] = [
  { value: 'API', label: '调用接口' },
  { value: 'REDIRECT', label: '跳转链接' },
  { value: 'BEAN', label: 'Bean调用' },
]

const PARAM_TYPES = [
  { value: 'string', label: '字符串' },
  { value: 'number', label: '数字' },
  { value: 'boolean', label: '布尔值' },
  { value: 'object', label: '对象' },
  { value: 'array', label: '数组' },
]

const emptyButton: TemplateButton = {
  buttonKey: '',
  label: '',
  style: 'DEFAULT',
  actionType: 'REDIRECT',
  sortOrder: 0,
}

const emptyParam: TemplateParam = {
  paramKey: '',
  paramType: 'string',
  description: '',
  required: false,
  sortOrder: 0,
}

export function EditTemplateDialog({
  open,
  onOpenChange,
  template,
  onSuccess,
}: EditTemplateDialogProps) {
  const [loading, setLoading] = useState(false)
  const [fetchingDetail, setFetchingDetail] = useState(false)
  const [templateDetail, setTemplateDetail] = useState<TemplateDetailVO | null>(null)

  const [formData, setFormData] = useState<UpdateTemplateDTO>({
    name: '',
    parentType: 'INBOX',
    titleTemplate: '',
    contentTemplate: '',
    params: [],
    buttons: [],
    expireDays: 0,
    status: true,
    dataVersion: 0,
  })

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
        const detail = res.data.data
        setTemplateDetail(detail)
        setFormData({
          name: detail.name,
          parentType: detail.parentType,
          titleTemplate: detail.titleTemplate,
          contentTemplate: detail.contentTemplate,
          params: detail.params || [],
          buttons: detail.buttons || [],
          expireDays: detail.expireDays,
          status: detail.status,
          dataVersion: detail.dataVersion,
        })
      } else {
        toast.error('获取模板详情失败')
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Fetch template detail error:', error)
      toast.error('获取模板详情失败')
      onOpenChange(false)
    } finally {
      setFetchingDetail(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      parentType: 'INBOX',
      titleTemplate: '',
      contentTemplate: '',
      params: [],
      buttons: [],
      expireDays: 0,
      status: true,
      dataVersion: 0,
    })
    setTemplateDetail(null)
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const handleAddButton = () => {
    setFormData((prev) => ({
      ...prev,
      buttons: [...(prev.buttons || []), { ...emptyButton, sortOrder: (prev.buttons?.length || 0) }],
    }))
  }

  const handleRemoveButton = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      buttons: prev.buttons?.filter((_, i) => i !== index),
    }))
  }

  const handleUpdateButton = (index: number, field: keyof TemplateButton, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      buttons: prev.buttons?.map((button, i) =>
        i === index ? { ...button, [field]: value } : button
      ),
    }))
  }

  const handleAddParam = () => {
    setFormData((prev) => ({
      ...prev,
      params: [...(prev.params || []), { ...emptyParam, sortOrder: (prev.params?.length || 0) }],
    }))
  }

  const handleRemoveParam = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      params: prev.params?.filter((_, i) => i !== index),
    }))
  }

  const handleUpdateParam = (index: number, field: keyof TemplateParam, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      params: prev.params?.map((param, i) =>
        i === index ? { ...param, [field]: value } : param
      ),
    }))
  }

  const handleSubmit = async () => {
    if (!template) return

    if (!formData.name?.trim()) {
      toast.error('请输入模板名称')
      return
    }
    if (!formData.titleTemplate?.trim()) {
      toast.error('请输入标题模板')
      return
    }
    if (!formData.contentTemplate?.trim()) {
      toast.error('请输入内容模板')
      return
    }

    setLoading(true)
    try {
      const res = await updateTemplate(template.id, {
        ...formData,
        name: formData.name?.trim(),
        titleTemplate: formData.titleTemplate?.trim(),
        contentTemplate: formData.contentTemplate?.trim(),
      })

      if (res.data.code === 'SUCCESS') {
        toast.success('模板更新成功')
        handleClose(false)
        onSuccess()
      } else {
        toast.error(res.data.message || '更新失败')
      }
    } catch (error) {
      console.error('Update template error:', error)
      toast.error('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑通知模板</DialogTitle>
          <DialogDescription>
            {templateDetail ? (
              <>
                编码：<span className="font-mono">{templateDetail.code}</span> | 分类：{templateDetail.parentTypeDesc}
              </>
            ) : (
              '修改模板信息'
            )}
          </DialogDescription>
        </DialogHeader>

        {fetchingDetail ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
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

                <div className="flex flex-col gap-2">
                  <Label htmlFor="parentType">大分类</Label>
                  <Select
                    value={formData.parentType}
                    onValueChange={(value: ParentType) =>
                      setFormData((prev) => ({ ...prev, parentType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择大分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {PARENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="expireDays">过期天数</Label>
                  <Input
                    id="expireDays"
                    type="number"
                    placeholder="0 表示永不过期"
                    value={formData.expireDays || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        expireDays: parseInt(e.target.value) || 0,
                      }))
                    }
                    min={0}
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    id="status"
                    checked={formData.status}
                    onCheckedChange={(checked: boolean) =>
                      setFormData((prev) => ({ ...prev, status: checked }))
                    }
                  />
                  <Label htmlFor="status">启用模板</Label>
                </div>
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, contentTemplate: e.target.value }))
                  }
                  rows={4}
                />
              </div>

              <Accordion type="multiple" className="w-full">
                {/* 参数定义 */}
                <AccordionItem value="params">
                  <AccordionTrigger>参数定义</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-3">
                      {formData.params?.map((param, index) => (
                        <div key={index} className="grid gap-2 rounded-lg border p-3">
                          <div className="grid gap-2 sm:grid-cols-3">
                            <Input
                              placeholder="参数键名"
                              value={param.paramKey}
                              onChange={(e) => handleUpdateParam(index, 'paramKey', e.target.value)}
                            />
                            <Select
                              value={param.paramType}
                              onValueChange={(value) => handleUpdateParam(index, 'paramType', value)}
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
                                onCheckedChange={(checked) => handleUpdateParam(index, 'required', checked)}
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
                            value={param.description}
                            onChange={(e) => handleUpdateParam(index, 'description', e.target.value)}
                          />
                          <Input
                            placeholder="默认值（可选）"
                            value={param.defaultValue || ''}
                            onChange={(e) => handleUpdateParam(index, 'defaultValue', e.target.value)}
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

                {/* 按钮配置 */}
                <AccordionItem value="buttons">
                  <AccordionTrigger>按钮配置</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-3">
                      {formData.buttons?.map((button, index) => (
                        <div key={index} className="flex flex-col gap-2 rounded-lg border p-3">
                          <div className="grid gap-2 sm:grid-cols-3">
                            <Input
                              placeholder="按钮标识"
                              value={button.buttonKey}
                              onChange={(e) => handleUpdateButton(index, 'buttonKey', e.target.value)}
                            />
                            <Input
                              placeholder="按钮文本"
                              value={button.label}
                              onChange={(e) => handleUpdateButton(index, 'label', e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                              <Select
                                value={button.style}
                                onValueChange={(value: ButtonStyle) => handleUpdateButton(index, 'style', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {BUTTON_STYLES.map((style) => (
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
                                onClick={() => handleRemoveButton(index)}
                              >
                                <Trash2Icon className="size-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Select
                              value={button.actionType}
                              onValueChange={(value: ButtonActionType) => handleUpdateButton(index, 'actionType', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {BUTTON_ACTION_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder="排序"
                              value={button.sortOrder}
                              onChange={(e) => handleUpdateButton(index, 'sortOrder', parseInt(e.target.value) || 0)}
                              min={0}
                            />
                          </div>
                          <Input
                            placeholder="显示条件表达式（SpEL，可选）"
                            value={button.conditionExpr || ''}
                            onChange={(e) => handleUpdateButton(index, 'conditionExpr', e.target.value)}
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddButton}
                      >
                        <PlusIcon className="mr-2 size-4" />
                        添加按钮
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
                保存
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
