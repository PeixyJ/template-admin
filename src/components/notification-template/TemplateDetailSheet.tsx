import { useEffect, useState } from 'react'
import {
  CalendarIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon,
  CodeIcon,
  FileTextIcon,
  LockIcon,
  PlayIcon,
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
import type { TemplateListVO, TemplateDetailVO } from '@/types/notification-template.types'
import { cn } from '@/lib/utils'

interface TemplateDetailSheetProps {
  template: TemplateListVO | null
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
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{templateDetail.name}</span>
                {templateDetail.isSystem && (
                  <Badge variant="secondary">
                    <LockIcon className="mr-1 size-3" />
                    系统
                  </Badge>
                )}
              </div>
              <CopyableText
                label="编码"
                value={templateDetail.code}
                className="font-mono text-sm text-muted-foreground"
              />
              <div className="flex items-center gap-2">
                <Badge variant="outline">{templateDetail.typeName}</Badge>
                <Badge
                  variant={templateDetail.status === 'active' ? 'default' : 'destructive'}
                >
                  {templateDetail.status === 'active' ? '启用' : '禁用'}
                </Badge>
              </div>
              {templateDetail.description && (
                <p className="text-sm text-muted-foreground">{templateDetail.description}</p>
              )}
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

            {/* 参数说明 */}
            {templateDetail.paramSchema && templateDetail.paramSchema.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h4 className="font-medium">参数说明</h4>
                  <div className="flex flex-col gap-2">
                    {templateDetail.paramSchema.map((param, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between rounded-lg border p-3"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-medium">{param.name}</code>
                            <Badge variant="outline" className="text-xs">
                              {param.type}
                            </Badge>
                            {param.required && (
                              <Badge variant="destructive" className="text-xs">
                                必填
                              </Badge>
                            )}
                          </div>
                          {param.desc && (
                            <span className="text-xs text-muted-foreground">{param.desc}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 操作按钮 */}
            {templateDetail.defaultActions && templateDetail.defaultActions.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h4 className="font-medium">操作按钮</h4>
                  <div className="flex flex-col gap-2">
                    {templateDetail.defaultActions.map((action, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-2 rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Button
                            variant={
                              action.style === 'primary' ? 'default' :
                              action.style === 'danger' ? 'destructive' :
                              action.style === 'success' ? 'default' : 'secondary'
                            }
                            size="sm"
                            className={cn(
                              action.style === 'success' && 'bg-green-600 hover:bg-green-700'
                            )}
                          >
                            <PlayIcon className="mr-1 size-3" />
                            {action.label}
                          </Button>
                          <Badge variant="outline" className="text-xs">
                            {action.actionType === 'endpoint' ? '调接口' : '跳转'}
                          </Badge>
                          {action.confirmRequired && (
                            <Badge variant="secondary" className="text-xs">
                              需确认
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-mono">
                            {action.actionType === 'endpoint'
                              ? `${action.endpointMethod || 'POST'} ${action.endpointUrlPattern}`
                              : action.redirectUrlPattern}
                          </span>
                        </div>
                        {action.confirmRequired && action.confirmMessage && (
                          <div className="text-xs text-muted-foreground">
                            确认：{action.confirmTitle} - {action.confirmMessage}
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
      className={`group inline-flex items-center gap-1.5 text-left transition-colors hover:text-primary ${className || ''}`}
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
