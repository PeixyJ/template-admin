import { SparklesIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Marquee } from '@/components/ui/marquee'
import { cn } from '@/lib/utils'

import { StarsBackground } from '@/components/ui/background-stars'
import { Magnetic } from '@/components/ui/magnet-effect'

const HeroSection = () => {
  return (
    <section className='flex-1 overflow-hidden pt-8 sm:pt-16 lg:pt-24'>
      <StarsBackground className='absolute inset-0 flex items-center justify-center rounded-xl' />
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-8 py-8 sm:gap-16 lg:gap-24'>
        {/* Hero Content */}
        <div className='relative grid gap-24 px-4 sm:px-6 lg:grid-cols-5 lg:px-8'>
          <div className='flex flex-col justify-center gap-8 lg:col-span-3'>
            <MotionPreset
              fade
              slide
              transition={{ duration: 0.5 }}
              className='bg-background flex w-fit items-center gap-2.5 rounded-full border px-2 py-1'
            >
              <span className='bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium'>
                AI 驱动
              </span>
              <span className='text-muted-foreground'>面向客户的企业解决方案</span>
            </MotionPreset>
            <MotionPreset fade slide={{ offset: 50 }} blur transition={{ duration: 0.5 }} delay={0.3}>
              <h1 className='max-w-3xl text-3xl leading-[1.29167] font-bold text-white sm:text-4xl lg:text-5xl'>
                赋能学习者，塑造未来
              </h1>
            </MotionPreset>
            <MotionPreset fade slide={{ offset: 50 }} blur transition={{ duration: 0.5 }} delay={0.5}>
              <p className='text-white/80'>
                在当今快节奏的世界中，保持领先意味着要大胆拓展、创新和引领。我们致力于为您提供正确的策略、洞察和工具，以推动增长并将您的业务目标变为现实。让我们将您的愿景转化为可衡量的成功。
              </p>
            </MotionPreset>
            <MotionPreset
              component='div'
              fade
              slide={{ offset: 50 }}
              blur
              transition={{ duration: 0.5 }}
              delay={0.7}
              className='flex flex-wrap items-center gap-6'
            >
              <div className='bg-background flex h-fit w-full max-w-100 items-center justify-between gap-2.5 rounded-full border px-3.5 py-2'>
                <Label className='sr-only' htmlFor='prompt-space'>
                  输入您的提示词
                </Label>
                <Input
                  type='text'
                  placeholder='输入您的提示词'
                  id='prompt-space'
                  className='placeholder:text-muted-foreground h-6 border-0 bg-transparent p-0 shadow-none focus:border-0 focus:ring-0 focus-visible:ring-0 md:text-base dark:bg-transparent'
                />

                <Button
                  type='submit'
                  className={cn(
                    'group animate-rainbow text-primary-foreground focus-visible:ring-ring/50 relative inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-transparent bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] px-2 py-1 text-xs font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',

                    // before styles
                    'before:animate-rainbow before:absolute before:bottom-[-20%] before:left-0 before:z-0 before:h-1/5 before:w-full before:bg-[linear-gradient(90deg,#ff4242,#a1ff42,#42a1ff,#42d0ff,#a142ff)] before:[filter:blur(calc(0.625*1rem))]',

                    // bg styles
                    'bg-[linear-gradient(var(--primary),var(--primary)),linear-gradient(var(--primary)_30%,rgba(0,0,0,0)),linear-gradient(90deg,#ff4242,#a1ff42,#42a1ff,#42d0ff,#a142ff)]'
                  )}
                >
                  <SparklesIcon />
                  生成
                </Button>
              </div>
            </MotionPreset>
          </div>
          <MotionPreset
            component='div'
            fade
            slide={{ direction: 'right', offset: 50 }}
            blur
            transition={{ duration: 0.5 }}
            delay={0.5}
            className='relative flex items-center justify-center lg:col-span-2'
          >
            <Magnetic strength={1} range={120}>
              <img
                src='/hero-avatar.webp'
                alt='主角头像'
                className='size-full object-contain transition-transform duration-500 hover:-translate-y-1.5 hover:scale-110 md:max-lg:size-3/4'
              />
            </Magnetic>
          </MotionPreset>
        </div>

        {/* List of Companies */}
        <div className='flex flex-col items-center gap-10 p-6 text-center'>
          <MotionPreset
            component='p'
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={0.8}
            transition={{ duration: 0.5 }}
            className='text-white'
          >
            深受众多优秀企业信赖
          </MotionPreset>
          <MotionPreset
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={0.9}
            transition={{ duration: 0.5 }}
            className='relative w-full max-w-4xl'
          >
            <div className='pointer-events-none absolute inset-y-0 left-0 z-1 w-15 bg-gradient-to-r from-black via-85% to-transparent max-sm:w-15' />
            <div className='pointer-events-none absolute inset-y-0 right-0 z-1 w-15 bg-gradient-to-l from-black via-85% to-transparent max-sm:w-15' />
            <Marquee pauseOnHover duration={20} reverse gap={2} className='*:items-center'>
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/um-logo.png'
                alt='University of Mississippi'
                className='h-7.5 w-auto shrink-0 object-contain opacity-80'
              />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/star-helth-logo.png'
                alt='Star Health'
                className='h-9 w-auto shrink-0 object-contain opacity-80'
              />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/dhl-logo.png'
                alt='DHL'
                className='h-4 w-auto shrink-0 object-contain opacity-80'
              />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/sense-arena-logo.png'
                alt='Sense Arena'
                className='h-11 w-auto shrink-0 object-contain opacity-80'
              />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/shemaroo-logo.png'
                alt='Shemaroo'
                className='h-10 w-auto shrink-0 object-contain opacity-80'
              />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/mercedes-benz-logo.png'
                alt='Mercedes Benz'
                className='h-7.5 w-auto shrink-0 object-contain opacity-80'
              />
            </Marquee>
          </MotionPreset>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
