import { appConfig } from '@/config/app'
import { cn } from '@/lib/utils'

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img src={appConfig.icon} alt={appConfig.title} className='size-8.5' />
      <span className='text-xl font-semibold'>{appConfig.title}</span>
    </div>
  )
}

export default Logo
