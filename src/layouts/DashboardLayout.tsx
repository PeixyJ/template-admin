import { useEffect, useState, useCallback, useRef } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { AppSidebar } from '@/components/sidebar'
import { SafeVerifyDialog } from '@/components/SafeVerifyDialog'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchCurrentUser, clearUser } from '@/store/slices/userSlice'
import { setSafeVerifyCallback, TOKEN_KEY } from '@/services/api'
import { logout } from '@/services/auth'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export function DashboardLayout() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentUser } = useAppSelector((state) => state.user)
  const [safeDialogOpen, setSafeDialogOpen] = useState(false)
  const resolveRef = useRef<(() => void) | null>(null)

  // Handle safe verify callback
  const handleSafeVerify = useCallback(() => {
    return new Promise<void>((resolve) => {
      resolveRef.current = resolve
      setSafeDialogOpen(true)
    })
  }, [])

  const handleSafeVerifySuccess = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current()
      resolveRef.current = null
    }
  }, [])

  // Register safe verify callback
  useEffect(() => {
    setSafeVerifyCallback(handleSafeVerify)
    return () => {
      setSafeVerifyCallback(null)
    }
  }, [handleSafeVerify])

  useEffect(() => {
    if (!currentUser) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, currentUser])

  const user = {
    name: currentUser?.nickname || '加载中...',
    email: currentUser?.inviteCode || '',
    avatar: currentUser?.avatarUrl || '',
  }

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      dispatch(clearUser())
      navigate('/auth/login')
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} onLogout={handleLogout} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
      <SafeVerifyDialog
        open={safeDialogOpen}
        onOpenChange={setSafeDialogOpen}
        onSuccess={handleSafeVerifySuccess}
      />
    </SidebarProvider>
  )
}
