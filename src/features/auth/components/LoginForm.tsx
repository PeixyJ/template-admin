import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/services/auth'
import { TOKEN_KEY } from '@/services/api'
import { hashPasswordSHA256 } from '@/utils/crypto'

interface LocationState {
  email?: string
}

interface LoginFormProps extends React.ComponentPropsWithoutRef<'form'> {
  className?: string
}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null
  const [email, setEmail] = useState(state?.email || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const hashedPassword = hashPasswordSHA256(password)
      const response = await login({
        accountType: 'ADMIN_EMAIL',
        credential: email,
        secret: hashedPassword,
      })

      if (response.data.code === 'SUCCESS') {
        const { tokenValue } = response.data.data
        localStorage.setItem(TOKEN_KEY, tokenValue)
        navigate('/dashboard')
      } else {
        setError(response.data.message || '登录失败')
      }
    } catch {
      setError('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn('flex flex-col gap-6', className)} onSubmit={handleSubmit} {...props}>
      <div className='flex flex-col items-center gap-2 text-center'>
        <h1 className='text-2xl font-bold'>登录账户</h1>
        <p className='text-muted-foreground text-balance text-sm'>请输入您的邮箱和密码登录</p>
      </div>
      {error && (
        <div className='bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm'>{error}</div>
      )}
      <div className='grid gap-6'>
        <div className='grid gap-2'>
          <Label htmlFor='email'>邮箱</Label>
          <Input
            id='email'
            type='email'
            placeholder='example@email.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='grid gap-2'>
          <div className='flex items-center'>
            <Label htmlFor='password'>密码</Label>
            <a href='/auth/forget-password' className='ml-auto text-sm underline-offset-4 hover:underline'>
              忘记密码？
            </a>
          </div>
          <Input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type='submit' className='w-full' disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </Button>
        <div className='after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t'>
          <span className='bg-background text-muted-foreground relative z-10 px-2'>或通过以下方式登录</span>
        </div>
        <Button variant='outline' className='w-full'>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
            <path
              d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
              fill='currentColor'
            />
          </svg>
          使用 GitHub 登录
        </Button>
      </div>
      <div className='text-center text-sm'>
        还没有账户？{' '}
        <a href='/auth/register' className='underline underline-offset-4'>
          立即注册
        </a>
      </div>
    </form>
  )
}
