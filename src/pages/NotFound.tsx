import Error02Illustration from '@/assets/svg/error-02-illustration'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-12 px-8 py-8 sm:py-16 lg:py-24'>
      <Error02Illustration className='h-[clamp(300px,50vh,500px)] max-sm:h-75' />

      <div className='text-center'>
        <h3 className='mb-6 text-5xl font-semibold'>404</h3>
        <h4 className='mb-1.5 text-3xl font-semibold'>页面未找到</h4>
        <p className='text-muted-foreground mb-6'>抱歉，您访问的页面不存在，建议返回首页</p>
        <Button size='lg' className='rounded-lg text-base' asChild>
          <a href='/'>返回首页</a>
        </Button>
      </div>
    </div>
  )
}
