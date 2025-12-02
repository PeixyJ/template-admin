import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ForgetPasswordFormProps extends React.ComponentPropsWithoutRef<'form'> {
  className?: string
}

export function ForgetPasswordForm({ className, ...props }: ForgetPasswordFormProps) {
  return (
    <form className={cn('flex flex-col gap-6', className)} {...props}>
      <div className='flex flex-col items-center gap-2 text-center'>
        <h1 className='text-2xl font-bold'>忘记密码？</h1>
        <p className='text-muted-foreground text-balance text-sm'>
          请输入您的邮箱地址，我们将向您发送重置密码的链接
        </p>
      </div>
      <div className='grid gap-6'>
        <div className='grid gap-2'>
          <Label htmlFor='email'>邮箱</Label>
          <Input id='email' type='email' placeholder='example@email.com' required />
        </div>
        <Button type='submit' className='w-full'>
          发送重置链接
        </Button>
      </div>
      <div className='text-center text-sm'>
        想起密码了？{' '}
        <a href='/auth/login' className='underline underline-offset-4'>
          返回登录
        </a>
      </div>
    </form>
  )
}
