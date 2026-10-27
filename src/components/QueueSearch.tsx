'use client'

import { useEffect, useState } from 'react'

import { SearchIcon } from '@fanvue/ui'

import { type QueueView, queueHref } from './queueHref'
import { useRouter } from 'next/navigation'

/** How long typing has to pause before the queue reloads, so each keystroke does not query the store. */
const SEARCH_DELAY_MS = 250

/** The first page of the view, searching for `q`, or not searching when it is blank. */
const searchHref = (view: QueueView, q: string) => queueHref({ ...view, page: 1, q: q || undefined })

/**
 * The queue's search field. It searches as the moderator types, after a short
 * pause, and at once on Enter. Each search starts again at page 1 and keeps the
 * moderator's size, sort and severity filter.
 */
export function QueueSearch({ view }: { view: QueueView }) {
  const router = useRouter()
  const [value, setValue] = useState(view.q ?? '')

  useEffect(() => {
    const q = value.trim()
    const timer =
      q === (view.q ?? '') ? undefined : setTimeout(() => router.replace(searchHref(view, q)), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [value, view, router])

  return (
    <form
      action='/'
      method='get'
      role='search'
      className='w-full'
      onSubmit={event => {
        event.preventDefault()
        router.replace(searchHref(view, value.trim()))
      }}
    >
      <label
        htmlFor='queue-search'
        className='sr-only'
      >
        Search app or developer
      </label>
      <div className='flex h-11 items-center gap-2 rounded-full border border-border-strong bg-background-primary px-3.5 focus-within:border-content-primary'>
        <SearchIcon
          size={16}
          className='flex-none text-content-tertiary'
          aria-hidden
        />
        <input
          id='queue-search'
          type='search'
          name='q'
          value={value}
          onChange={event => setValue(event.target.value)}
          placeholder='Search app or developer'
          className='min-w-0 flex-1 border-0 bg-transparent text-sm text-content-primary outline-none placeholder:text-content-tertiary'
        />
      </div>
    </form>
  )
}
