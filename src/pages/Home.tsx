import { TooltipProvider } from '@/components/ui/tooltip'
import { Header, HeroSection } from '@/components/blocks'
import type { NavigationSection } from '@/components/blocks/navigation'

const navigationData: NavigationSection[] = [
  {
    title: '功能',
    items: [
      { title: '数据分析', href: '#analytics' },
      { title: '报表', href: '#reports' },
      { title: '集成', href: '#integrations' }
    ]
  },
  {
    title: '解决方案',
    items: [
      { title: '企业版', href: '#enterprise' },
      { title: '创业公司', href: '#startups' },
      { title: '代理商', href: '#agencies' }
    ]
  },
  { title: '价格', href: '#pricing' },
  { title: '关于我们', href: '#about' }
]

export default function Home() {
  return (
    <TooltipProvider>
      <div className='relative min-h-screen bg-black'>
        <Header navigationData={navigationData} />
        <HeroSection />
      </div>
    </TooltipProvider>
  )
}
