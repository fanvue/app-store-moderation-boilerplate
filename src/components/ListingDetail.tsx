import type { ReactNode } from 'react'

import {
  Avatar,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@fanvue/ui'

import { isFullListing, type StoredListing } from '@/lib/moderation/store'

import { FindingsList } from './FindingsList'
import Link from 'next/link'

const PLAN_COLUMNS = ['name', 'description', 'billingType', 'interval', 'price', 'currency', 'status', 'highlights']

/**
 * One stored listing: its findings first, then the fields the rules work with.
 * Until the job has made the listing's detail call, only the summary fields
 * are stored.
 */
export function ListingDetail({ stored }: { stored: StoredListing }) {
  const { listing, review } = stored
  const full = isFullListing(listing) ? listing : null

  return (
    <article className='flex flex-col gap-6 typography-body-small-14px-regular'>
      <Breadcrumb>
        <BreadcrumbList size='14px'>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/'>Review queue</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>{listing.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className='flex items-start gap-4'>
        <Avatar
          size={64}
          src={listing.logoUrl}
          alt=''
          fallback={listing.name.slice(0, 2).toUpperCase()}
        />
        <div className='flex flex-col gap-1'>
          <h1 className='typography-header-heading-md'>{listing.name}</h1>
          <p>{listing.tagline}</p>
          <p className='text-content-secondary'>
            {listing.developer.name ?? 'Unknown developer'}
            {listing.developer.handle ? ` (@${listing.developer.handle})` : ''} · {listing.pricingType} · rating{' '}
            {listing.rating.average ?? '-'} ({listing.rating.count ?? 0})
          </p>
        </div>
      </header>

      <section className='flex flex-col gap-3'>
        <h2 className='typography-header-heading-xs'>Findings</h2>
        <FindingsList review={review} />
      </section>

      <Section title='Copy'>
        <FieldList>
          <Field
            label='description'
            value={listing.description}
          />
          {full ? (
            <>
              <Field
                label='descriptionTitle'
                value={full.descriptionTitle}
              />
              <Field
                label='descriptionBody'
                value={full.descriptionBody}
              />
              <Field
                label='highlights'
                value={full.highlights.length ? full.highlights.join(' | ') : '(none)'}
              />
            </>
          ) : null}
        </FieldList>
      </Section>

      <Section title='Integration'>
        <FieldList>
          <Field
            label='appUrl'
            value={listing.appUrl ?? '(null)'}
          />
          <Field
            label='uuid'
            value={listing.uuid}
          />
          <Field
            label='logoUrl'
            value={listing.logoUrl}
          />
        </FieldList>
      </Section>

      {full ? (
        <>
          <Section title='Images'>
            <FieldList>
              <Field
                label='heroImageUrl'
                value={full.heroImageUrl}
              />
              <Field
                label='previewImageUrls'
                value={`${full.previewImageUrls.length}: ${full.previewImageUrls.join(' ')}`}
              />
              <Field
                label='galleryImageUrls'
                value={`${full.galleryImageUrls.length}: ${full.galleryImageUrls.join(' ')}`}
              />
            </FieldList>
          </Section>

          <Section title='Pricing plans'>
            {full.pricingPlans.length === 0 ? (
              <p className='text-content-secondary'>(no plans)</p>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {PLAN_COLUMNS.map(column => (
                        <TableHead
                          key={column}
                          className='typography-body-small-14px-semibold'
                        >
                          {column}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {full.pricingPlans.map(plan => (
                      <TableRow key={plan.uuid}>
                        <TableCell>{plan.name}</TableCell>
                        <TableCell>{plan.description}</TableCell>
                        <TableCell>{plan.billingType}</TableCell>
                        <TableCell>{plan.interval ?? '(null)'}</TableCell>
                        <TableCell>{plan.price}</TableCell>
                        <TableCell>{plan.currencyCode}</TableCell>
                        <TableCell>{plan.status}</TableCell>
                        <TableCell>{plan.highlights.join(' | ')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Section>
        </>
      ) : (
        <p className='text-content-tertiary italic'>The job has not fetched the details of this listing yet.</p>
      )}
    </article>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card
      type='container'
      className='flex flex-col gap-3'
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function FieldList({ children }: { children: ReactNode }) {
  return <dl className='grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2'>{children}</dl>
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className='font-mono text-xs text-content-secondary'>{label}</dt>
      <dd className='m-0 break-words'>{value}</dd>
    </>
  )
}
