'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button';
import Avatar from '@/components/ui/avatar'
import { ArrowRight } from '@medusajs/icons';
import OverflowableText from '@/components/ui/overflowable-text'
import React from 'react'

export default function LinkCard({
  title,
  description,
  image,
  url,
  visualUrl,
  button
}: {
  title: string
  description: string
  image?: string | React.ComponentType<{ className?: string }>
  url: string
  visualUrl: string
  button: string
}) {
  return (
    <div
      className="p-10 lg:px-24 lg:py-10 space-y-3 w-full text-start ring ring-ui-border-base lg:ring-0"
    >
      <div className="flex gap-3 items-center justify-start">
        <Avatar size="lg" image={image} />
        <div className="flex-1 min-w-0 flex flex-col">
          <h4 className="text-lg font-medium leading-5 text-ui-fg-base">{title}</h4>
          <OverflowableText text={visualUrl} className="text-sm text-ui-fg-muted" />
        </div>
      </div>
      <p className="text-sm max-w-none lg:max-w-80 text-ui-fg-subtle">{description}</p>
      <Button asChild size="base" className="mt-2 w-full lg:w-fit max-w-md">
        <Link href={url} target='_blank' rel='noopener noreferrer'>
          {button} <ArrowRight />
        </Link>
      </Button>
    </div>
  )
}