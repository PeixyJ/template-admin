import { useEffect, useState } from 'react'

import { LogInIcon, MenuIcon, UserPlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { MenuDropdown, MenuNavigation } from '@/components/blocks/navigation'
import type { NavigationSection } from '@/components/blocks/navigation'

import { cn } from '@/lib/utils'

import { Logo } from '@/components/common'

type HeaderProps = {
  navigationData: NavigationSection[]
  className?: string
}

const Header = ({ navigationData, className }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-16 w-full transition-all duration-300',
        {
          'shadow-md backdrop-blur': isScrolled
        },
        className
      )}
    >
      <div className='mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8'>
        {/* Logo */}
        <a href='#'>
          <Logo className='gap-3 text-white [&_line]:stroke-black [&_path]:stroke-black [&_rect]:fill-white' />
        </a>

        {/* Navigation */}
        <MenuNavigation
          navigationData={navigationData}
          className='max-lg:hidden [&_[data-slot=navigation-menu-link]]:text-white/80! [&_[data-slot=navigation-menu-link]]:hover:bg-transparent! [&_[data-slot=navigation-menu-link]]:hover:text-white!'
        />

        {/* Actions */}
        <div className='flex justify-end gap-6'>
          <Button variant='secondary' className='rounded-full max-sm:hidden' asChild>
            <a href='/auth/login'>Login</a>
          </Button>
          <Button variant='secondary' className='rounded-full max-sm:hidden' asChild>
            <a href='#'>Free Trial</a>
          </Button>

          {/* Navigation for small screens */}
          <div className='flex gap-3 lg:hidden'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size='icon' variant='outline' className='rounded-full sm:hidden' asChild>
                  <a href='/auth/login'>
                    <LogInIcon />
                    <span className='sr-only'>Login</span>
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Login</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size='icon' variant='outline' className='rounded-full sm:hidden' asChild>
                  <a href='#'>
                    <UserPlusIcon />
                    <span className='sr-only'>Free Trial</span>
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Free Trial</TooltipContent>
            </Tooltip>
            <MenuDropdown
              align='end'
              navigationData={navigationData}
              trigger={
                <Button variant='outline' size='icon'>
                  <MenuIcon />
                  <span className='sr-only'>Menu</span>
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
