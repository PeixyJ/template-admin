import { useEffect, useState } from 'react'
import {
  CalendarIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon,
  CodeIcon,
  FileTextIcon,
  ClockIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

import { getTemplateDetail } from '@/services/notification-template'
import type { TemplateVO, TemplateDetailVO } from '@/types/notification-template.types'
import { cn } from '@/lib/utils'

interface TemplateDetailSheetProps {
  template: TemplateVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateDetailSheet({
  template,
  open,
  onOpenChange,
}: TemplateDetailSheetProps) {
  const [loading, setLoading] = useState(false)
  const [templateDetail, setTemplateDetail] = useState<TemplateDetailVO | null>(null)

  useEffect(() => {
    if (open && template) {
      fetchTemplateDetail(template.id)
    }
  }, [open, template])

  const fetchTemplateDetail = async (id: number) => {
    setLoading(true)
    try {
      const res = await getTemplateDetail(id)
      if (res.data.code === 'SUCCESS') {
        setTemplateDetail(res.data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const getButtonVariant = (style: string) => {
    switch (style) {
      case 'PRIMARY':
        return 'default'
      case 'DANGER':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getActionTypeLabel = (actionType: string) => {
    switch (actionType) {
      case 'API':
        return '调接口'
      case 'REDIRECT':
        return '跳转'
      case 'BEAN':
        return 'Bean调用'
      default:
        return actionType
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>模板详情</SheetTitle>
          <SheetDescription>查看通知模板的详细信息</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : templateDetail ? (
          <div className="flex flex-col gap-6 px-4">
            {/* 基本信息 */}
            <div className="flex flex-col gap-2">
              <span className="text-lg font-semibold">{templateDetail.name}</span>
              <CopyableText
                label="编码"
                value={templateDetail.code}
                className="font-mono text-sm text-muted-foreground"
              />
              <div className="flex items-center gap-2">
                <Badge variant="outline">{templateDetail.parentTypeDesc}</Badge>
                <Badge
                  variant={templateDetail.status ? 'default' : 'destructive'}
                >
                  {templateDetail.statusDesc || (templateDetail.status ? '启用' : '禁用')}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ClockIcon className="size-4" />
                <span>
                  {templateDetail.expireDays === 0
                    ? '永不过期'
                    : `${templateDetail.expireDays} 天后过期`}
                </span>
              </div>
            </div>

            <Separator />

            {/* 模板内容 */}
            <div className="flex flex-col gap-4">
              <h4 className="font-medium">模板内容</h4>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileTextIcon className="size-4" />
                  标题模板
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <code className="text-sm">{templateDetail.titleTemplate}</code>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CodeIcon className="size-4" />
                  内容模板
                </div>
                <div className="max-h-[200px] overflow-y-auto rounded-lg border bg-muted/30 p-3">
                  <pre className="whitespace-pre-wrap text-sm">{templateDetail.contentTemplate}</pre>
                </div>
              </div>
            </div>

            {/* 参数定义 */}
            {templateDetail.params && templateDetail.params.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h4 className="font-medium">参数定义</h4>
                  <div className="flex flex-col gap-2">
                    {templateDetail.params.map((param, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between rounded-lg border p-3"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-medium">{param.paramKey}</code>
                            <Badge variant="outline" className="text-xs">
                              {param.paramType}
                            </Badge>
                            {param.required && (
                              <Badge variant="destructive" className="text-xs">
                                必填
                              </Badge>
                            )}
                          </div>
                          {param.description && (
                            <span className="text-xs text-muted-foreground">{param.description}</span>
                          )}
                          {param.defaultValue && (
                            <span className="text-xs text-muted-foreground">
                              默认值: {param.defaultValue}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 按钮配置 */}
            {templateDetail.buttons && templateDetail.buttons.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h4 className="font-medium">按钮配置</h4>
                  <div className="flex flex-col gap-2">
                    {templateDetail.buttons.map((button, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-2 rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Button
                            variant={getButtonVariant(button.style)}
                            size="sm"
                          >
                            {button.label}
                          </Button>
                          <Badge variant="outline" className="text-xs">
                            {getActionTypeLabel(button.actionType)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-mono">标识: {button.buttonKey}</span>
                        </div>
                        {button.conditionExpr && (
                          <div className="text-xs text-muted-foreground">
                            条件: {button.conditionExpr}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* 时间信息 */}
            <div className="grid gap-4">
              <DetailItem
                icon={<CalendarIcon className="size-4" />}
                label="创建时间"
                value={templateDetail.createTime}
              />
              <DetailItem
                icon={<CalendarIcon className="size-4" />}
                label="更新时间"
                value={templateDetail.updateTime}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center py-12 text-muted-foreground">
            暂无数据
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function CopyableText({
  value,
  label,
  className,
  children,
}: {
  value: string
  label?: string
  className?: string
  children?: React.ReactNode
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`${label || '内容'}已复制`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'group inline-flex items-center gap-1.5 text-left transition-colors hover:text-primary',
        className
      )}
      title="点击复制"
    >
      {children || value}
      {copied ? (
        <CheckIcon className="size-3.5 text-green-500" />
      ) : (
        <CopyIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  )
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm">{value}</span>
      </div>
    </div>
  )
}
