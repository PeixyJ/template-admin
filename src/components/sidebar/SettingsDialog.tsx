"use client"

import * as React from "react"
import {
  Bell,
  Globe,
  Keyboard,
  Loader2,
  Lock,
  Paintbrush,
  Settings,
  Upload,
  User,
} from "lucide-react"
import { toast } from "sonner"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { setUser } from "@/store/slices/userSlice"
import {
  updateCurrentUserNickname,
  uploadAvatar,
  changePassword,
} from "@/services/user"
import { hashPasswordSHA256 } from "@/utils/crypto"

const data = {
  nav: [
    { name: "个人资料", icon: User },
    { name: "通知", icon: Bell },
    { name: "外观", icon: Paintbrush },
    { name: "语言和地区", icon: Globe },
    { name: "辅助功能", icon: Keyboard },
    { name: "隐私与可见性", icon: Lock },
    { name: "高级设置", icon: Settings },
  ],
}

function ChangePasswordDialog() {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast.error("密码长度至少为6位")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("两次输入的密码不一致")
      return
    }

    setLoading(true)
    try {
      const hashedPassword = hashPasswordSHA256(newPassword)
      const response = await changePassword({ newPassword: hashedPassword })
      if (response.data.code === "SUCCESS") {
        toast.success(response.data.message || "密码修改成功")
        setOpen(false)
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(response.data.message || "密码修改失败")
      }
    } catch {
      toast.error("密码修改失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          修改密码
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
          <DialogDescription>
            请输入新密码，密码长度至少为6位。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">新密码</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">确认密码</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入新密码"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ProfileContent() {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((state) => state.user.currentUser)
  const [nickname, setNickname] = React.useState(currentUser?.nickname || "")
  const [isEditingNickname, setIsEditingNickname] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setNickname(currentUser?.nickname || "")
  }, [currentUser?.nickname])

  const handleCancelEdit = () => {
    setNickname(currentUser?.nickname || "")
    setIsEditingNickname(false)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("图片大小不能超过5MB")
      return
    }

    setUploadingAvatar(true)
    try {
      const response = await uploadAvatar(file)
      if (response.data.code === "SUCCESS") {
        dispatch(setUser(response.data.data))
        toast.success(response.data.message || "头像上传成功")
      } else {
        toast.error(response.data.message || "头像上传失败")
      }
    } catch {
      toast.error("头像上传失败")
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      toast.error("昵称不能为空")
      return
    }

    if (nickname.length < 2 || nickname.length > 50) {
      toast.error("昵称长度为2-50个字符")
      return
    }

    if (nickname === currentUser?.nickname) {
      toast.info("昵称未修改")
      return
    }

    setSaving(true)
    try {
      const response = await updateCurrentUserNickname({ nickname })
      if (response.data.code === "SUCCESS") {
        dispatch(setUser(response.data.data))
        toast.success(response.data.message || "昵称修改成功")
        setIsEditingNickname(false)
      } else {
        toast.error(response.data.message || "昵称修改失败")
      }
    } catch {
      toast.error("昵称修改失败")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 头像区域 */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="size-20">
            <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.nickname} />
            <AvatarFallback className="text-lg">
              {currentUser?.nickname?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {uploadingAvatar && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <Loader2 className="size-6 animate-spin text-white" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-medium">{currentUser?.nickname || "访客用户"}</h3>
          <p className="text-sm text-muted-foreground">
            ID: {currentUser?.id || "暂无"}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAvatarClick}
            disabled={uploadingAvatar}
          >
            <Upload className="mr-2 size-4" />
            更换头像
          </Button>
        </div>
      </div>

      <Separator />

      {/* 个人信息表单 */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nickname">昵称</Label>
          <div className="flex gap-2">
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称"
              className="flex-1"
              disabled={!isEditingNickname}
            />
            {isEditingNickname ? (
              <>
                <Button
                  onClick={handleSaveNickname}
                  disabled={saving || nickname === currentUser?.nickname}
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : "保存"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  取消
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsEditingNickname(true)}
              >
                编辑
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">2-50个字符</p>
        </div>

        {/* 密码区域 */}
        <div className="space-y-2">
          <Label>密码</Label>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              修改密码以确保账户安全
            </p>
            <ChangePasswordDialog />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="createTime">注册时间</Label>
          <Input
            id="createTime"
            value={currentUser?.createTime || ""}
            disabled
            className="bg-muted"
          />
        </div>

      </div>

    </div>
  )
}

function SettingsContent({ activeItem }: { activeItem: string }) {
  switch (activeItem) {
    case "个人资料":
      return <ProfileContent />
    default:
      return (
        <div className="flex flex-1 flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted/50 aspect-video max-w-3xl rounded-xl"
            />
          ))}
        </div>
      )
  }
}

export function SettingsDialog() {
  const [open, setOpen] = React.useState(false)
  const [activeItem, setActiveItem] = React.useState("个人资料")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-xs outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 h-7">
          <Settings className="size-4" />
          <span>设置</span>
        </button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 h-[90vh] max-h-[700px] w-[90vw] max-w-[1000px]!">
        <DialogTitle className="sr-only">设置</DialogTitle>
        <DialogDescription className="sr-only">
          在这里自定义您的设置。
        </DialogDescription>
        <SidebarProvider className="items-start h-full w-full">
          <Sidebar collapsible="none" className="hidden md:flex w-[200px] shrink-0">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.name === activeItem}
                          onClick={() => setActiveItem(item.name)}
                        >
                          <a href="#">
                            <item.icon />
                            <span>{item.name}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">设置</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{activeItem}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
              <SettingsContent activeItem={activeItem} />
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
