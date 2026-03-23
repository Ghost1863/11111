import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Tooltip } from '@medusajs/ui';

export interface AvatarItem {
  name?: string;
  image?: string | React.ComponentType<{ className?: string }>;
  url?: string;
}

interface AvatarProps extends AvatarItem {
  style?: React.CSSProperties;
  className?: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses: Record<AvatarProps['size'], string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export const AvatarWrapper = ({
  name,
  url,
  children
}: {
  name?: string;
  url?: string;
  children: React.ReactNode
}) => {
  const content = url ? (
    <Link href={url}>
      {children}
    </Link>
  ) : (
    <div>{children}</div>
  );
  if (!name) return content;
  return <Tooltip content={name}>{content}</Tooltip>;
};

const Avatar = ({ name, url, className, image: ImageIcon, size, style }: AvatarProps) => {
  return (
    <AvatarWrapper name={name} url={url}>
      <div className="relative group shrink-0">
        <div
          className={cn(
            'object-cover rounded-full! border-2 transition duration-300 p-1.5 bg-ui-bg-base relative border-ui-border-base hover:border-ui-fg-base',
            sizeClasses[size],
            className
          )}
          style={style}
        >
          {typeof ImageIcon === 'string' ? (
            <Image height={100} width={100} src={ImageIcon} alt={name ?? 'avatar'} />
          ) : (
            ImageIcon && <ImageIcon className="size-full rounded-full" />
          )}
        </div>
      </div>
    </AvatarWrapper>
  );
};

export default Avatar;
