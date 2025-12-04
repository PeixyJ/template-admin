import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '@/components/common'
import { LoginForm } from '@/features/auth'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Magnetic } from '@/components/ui/magnet-effect'
import { StarsBackground } from '@/components/ui/background-stars'
import { isLogin } from '@/services/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    isLogin()
      .then((res) => {
        if (res.data?.code === 'SUCCESS') {
          navigate('/dashboard', { replace: true })
        }
      })
      .catch(() => {
        // 未登录，忽略错误
      })
      .finally(() => {
        setChecking(false)
      })
  }, [navigate])

  if (checking) {
    return null
  }

  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='flex flex-col gap-4 p-6 md:p-10'>
        <div className='flex justify-center gap-2 md:justify-start'>
          <a href='/' className='flex items-center gap-2 font-medium'>
            <Logo />
          </a>
        </div>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-xs'>
            <LoginForm />
          </div>
        </div>
      </div>
      <MotionPreset
        component='div'
        className='relative hidden items-center justify-center overflow-hidden bg-black lg:flex'
      >
        <StarsBackground className='absolute inset-0' />
        <Magnetic strength={1} range={120}>
          <img
            src='/hero-avatar.webp'
            alt='Login background'
            className='relative z-10 max-h-96 w-auto object-contain transition-transform duration-500 hover:-translate-y-1.5 hover:scale-110'
          />
        </Magnetic>
      </MotionPreset>
    </div>
  )
}
