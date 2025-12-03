import { useState } from 'react'
import {
  Loader2Icon,
  RefreshCwIcon,
  CopyIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
} from 'lucide-react'
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

import { createAdmin } from '@/services/admin'

interface CreateAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function generatePassword(length = 12): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export function CreateAdminDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAdminDialogProps) {
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [resultPassword, setResultPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
    remark: '',
  })

  const resetForm = () => {
    setFormData({
      nickname: '',
      email: '',
      password: '',
      remark: '',
    })
    setShowResult(false)
    setResultPassword('')
    setCopied(false)
    setShowPassword(false)
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword()
    setFormData((prev) => ({ ...prev, password: newPassword }))
    setShowPassword(true)
  }

  const handleSubmit = async () => {
    if (!formData.nickname.trim()) {
      toast.error('请输入管理员昵称')
      return
    }
    if (!formData.email.trim()) {
      toast.error('请输入邮箱')
      return
    }
    if (!formData.password.trim()) {
      toast.error('请输入密码')
      return
    }

    setLoading(true)
    try {
      const res = await createAdmin({
        nickname: formData.nickname.trim(),
        email: formData.email.trim(),
        password: formData.password,
        remark: formData.remark.trim() || undefined,
      })

      if (res.data.code === 'SUCCESS') {
        setResultPassword(formData.password)
        setShowResult(true)
        toast.success('管理员创建成功')
        onSuccess()
      } else {
        toast.error(res.data.message || '创建失败')
      }
    } catch (error) {
      console.error('Create admin error:', error)
      toast.error('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(resultPassword)
      setCopied(true)
      toast.success('密码已复制')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{showResult ? '创建成功' : '创建管理员'}</DialogTitle>
          <DialogDescription>
            {showResult
              ? '请保存以下密码，关闭后将无法再次查看'
              : '填写管理员信息，密码可以自动生成'}
          </DialogDescription>
        </DialogHeader>

        {showResult ? (
          <div className="flex flex-col gap-4 py-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="mb-2 text-sm text-muted-foreground">初始密码</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-background px-2 py-1 font-mono text-sm">
                  {resultPassword}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPassword}
                >
                  {copied ? (
                    <CheckIcon className="size-4 text-green-500" />
                  ) : (
                    <CopyIcon className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nickname">
                昵称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nickname"
                placeholder="请输入管理员昵称"
                value={formData.nickname}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nickname: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">
                邮箱 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">
                密码 <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4 text-muted-foreground" />
                    ) : (
                      <EyeIcon className="size-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleGeneratePassword}
                  title="自动生成密码"
                >
                  <RefreshCwIcon className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="remark">备注</Label>
              <Input
                id="remark"
                placeholder="请输入备注（可选）"
                value={formData.remark}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, remark: e.target.value }))
                }
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {showResult ? (
            <Button onClick={() => handleClose(false)}>关闭</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleClose(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
                创建
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
