'use client';

import * as React from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { navLinks } from '@/lib/nav-links';

export function MainNavigationMenu() {
  const t = useTranslations('Navigation');

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {navLinks.map((link) => (
          <NavigationMenuItem key={link.localizationKey}>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle({ className: 'text-ui-fg-subtle font-normal' })}
            >
              <Link href={link.href}>{t(link.localizationKey)}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
