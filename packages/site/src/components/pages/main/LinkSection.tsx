'use client'

import { cn } from '@/lib/utils'
import type { ReactNode, HTMLAttributes } from 'react'

type LinkSectionProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
}

export function LinkSection({
  title,
  description,
  children,
  className,
  ...rest
}: LinkSectionProps) {
  return (
    <div
      className={cn(
        'not-last:border-b flex flex-col items-center lg:items-start py-16 lg:py-0 w-full'
      )}
      {...rest}
    >
      <div className="lg:px-24 lg:pt-24">
        <h3 className="text-3xl lg:text-4xl leading-tight font-medium mb-2 lg:mb-4 text-ui-fg-base whitespace-pre-line">
          {title}
        </h3>
        {description && (
          <p className="max-w-none lg:max-w-80 text-ui-fg-subtle">{description}</p>
        )}
      </div>

      <div className={cn('lg:px-24 lg:pb-24 mt-4 lg:mt-8 w-full px-6', className)}>
        {children}
      </div>
    </div>
  )
}