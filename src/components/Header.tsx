import { Badge, Logo } from '@fanvue/ui'

import Link from 'next/link'

export function Header() {
  return (
    <header className='border-b border-border-primary bg-background-secondary'>
      <div className='mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6'>
        <Link
          href='/'
          className='flex items-center gap-3 no-underline'
        >
          <Logo
            variant='icon'
            size='32'
            aria-label='Fanvue'
          />
          <span className='typography-header-heading-xs text-content-primary'>App Store moderation</span>
        </Link>
        <Badge variant='info'>Mock API · fixtures</Badge>
      </div>
    </header>
  )
}
