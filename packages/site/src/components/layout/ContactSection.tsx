import { Button } from '@/components/ui/button';
import Section from '@/components/section';
import TelegramBase from '@/svg/icons/telegram-base.svg';
import { MagnifyingGlass } from '@medusajs/icons';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function ContactSection() {
  const t = useTranslations('ContactSection');

  return (
    <Section className="px-6 py-8 flex items-center flex-col lg:flex-row gap-4 bg-pattern animate-slide-bg bg-size-[2000px]">
      <h2 className="xl:text-4xl text-2xl text-center lg:text-left pb-2 lg:py-8 xl:py-16 sm:px-18 z-1 text-ui-fg-base">
        {t('title')}
      </h2>
      <div className="flex-none flex flex-col items-center md:flex-row justify-center gap-3 w-full md:w-auto md:min-w-lg">
        <Button size="large" className="w-full md:w-fit max-w-lg" asChild >
          <Link href="https://t.me/gorgojs_bot" target="_blank">
            <TelegramBase className="opacity-88" />
            <span className="">{t('getInTouch')}</span>
          </Link>
        </Button>
        <Button size="large" className="w-full md:w-fit max-w-lg" asChild variant="accent">
          <Link href="/medusa/plugins">
            <MagnifyingGlass className="opacity-88" />
            <span className="opacity-88">{t('browsePlugins')}</span>
          </Link>
        </Button>
      </div>
    </Section>
  );
}
