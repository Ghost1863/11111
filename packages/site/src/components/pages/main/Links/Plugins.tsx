'use client';

import Yookassa from '@/svg/icons/yookassa-icon.svg';
import Tbank from '@/svg/icons/tbank-icon.svg';
import Robokassa from '@/svg/icons/robokassa-icon.svg';
import Onec from '@/svg/icons/1c-icon.svg';
import Apiship from '@/svg/icons/apiship-icon.svg';
import Yandex from '@/svg/icons/yandex-en-icon.svg';
import { MagnifyingGlass } from '@medusajs/icons';
import { Button } from '@/components/ui/button';
import AvatarGroup from '@/components/ui/avatar-group';
import { LinkSection } from '../LinkSection';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import React from 'react';

export default function LinksPlugins() {
  const t = useTranslations('Links');

  const items = [
    {
      name: 'YooKassa payment provider',
      image: Yookassa,
      url: '/medusa/plugins/medusa-payment-yookassa'
    },
    {
      name: 'T-Kassa payment provider',
      image: Tbank,
      url: '/medusa/plugins/gorgo-medusa-payment-tkassa'
    },
    {
      name: 'Robokassa payment provider',
      image: Robokassa,
      url: '/medusa/plugins/gorgo-medusa-payment-robokassa'
    },
    {
      name: 'ApiShip fulfillment provider',
      image: Apiship,
      url: '/medusa/plugins/gorgo-medusa-fulfillment-apiship'
    },
    {
      name: '1C:Enterprise integration',
      image: Onec,
      url: '/medusa/plugins/gorgo-medusa-1c'
    },
    {
      name: 'Yandex Market YML feed generator',
      image: Yandex,
      url: '/medusa/plugins/gorgo-medusa-feed-yandex'
    },
  ];

  // const items = [
  //   {
  //     name: {
  //       en: 'YooKassa payment provider',
  //       ru: 'Платежный провайдер ЮKassa',
  //     },
  //     image: Yookassa,
  //     url: '/medusa/plugins/medusa-payment-yookassa'
  //   },
  //   {
  //     name: {
  //       en: 'T-Kassa payment provider',
  //       ru: 'Платежный провайдер Т-Касса',
  //     },
  //     image: Tbank,
  //     url: '/medusa/plugins/gorgo-medusa-payment-tkassa'
  //   },
  //   {
  //     name: {
  //       en: 'Robokassa payment provider',
  //       ru: 'Платежный провайдер Робокасса',
  //     },
  //     image: Robokassa,
  //     url: '/medusa/plugins/gorgo-medusa-payment-robokassa'
  //   },
  //   {
  //     name: {
  //       en: '1C:Enterprise integration',
  //       ru: 'Интеграция с 1С:Предприятие',
  //     },
  //     image: Onec,
  //     url: '/medusa/plugins/gorgo-medusa-1c'
  //   },
  //   {
  //      name: {
  //       en: 'Yandex Market YML feed generator',
  //       ru: 'Генератор YML-фида в формате Яндекс Маркет',
  //     },
  //     image: Yandex,
  //     url: '/medusa/plugins/gorgo-medusa-feed-yandex'
  //   },
  // ];

  return (
    <LinkSection
      title={t('plugins')}
      description={t('pluginsDescription')}
    >
      <div className="flex flex-col items-center lg:items-start">
        <div className="flex items-center gap-4">
          <AvatarGroup items={items} maxVisible={6} size="lg" />
        </div>
        <Button size="large" asChild className="mt-4 lg:mt-8 w-full lg:w-fit max-w-md" variant="accent">
          <Link href="/medusa/plugins?author=gorgo">
            <MagnifyingGlass className="opacity-88" />
            {t('browsePlugins')}
          </Link>
        </Button>
      </div>
    </LinkSection>
  );
}
