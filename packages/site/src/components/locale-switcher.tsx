'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { Select } from '@medusajs/ui';
import { routing } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { ChevronDown, Globe } from 'lucide-react';

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = useLocale();

  const switchLocale = (locale: string) => {
    router.push(pathname, { locale });
  };

  return (
    <div className="flex gap-2">
      <Select value={currentLocale} onValueChange={switchLocale}>
        <Select.Trigger className="bg-transparent shadow-none gap-1 [&_svg]:!text-ui-fg-base cursor-pointer [&_svg]:hidden">
          <Globe className="!block size-4" />
          <ChevronDown className="!block size-4" />
        </Select.Trigger>
        <Select.Content>
          {routing.locales.map((locale) => (
            <Select.Item key={locale} value={locale}>
              {locale.toUpperCase()}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
}
