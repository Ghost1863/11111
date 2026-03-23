"use client";

import { ArrowRight } from "@medusajs/icons";
import { useTranslations } from "next-intl";
import { useRefContext } from "@/components/ref-provider";
import Section from "@/components/section";
import { Button } from "@/components/ui/button";
import useGorgoDocsLink from "@/hooks/useGorgoHomeLink";
import { Link } from "@/i18n/navigation";
import Telegram from "@/svg/icons/telegram.svg";
import LinkCard from "./LinkCard";
import { LinkSection } from "./LinkSection";
import LinksPlugins from "./Links/Plugins";

export default function Links() {
  const t = useTranslations("Links");
  const { afterHeroSectionRef } = useRefContext();
  const gorgoDocsLink = useGorgoDocsLink();

  return (
    <Section
      containerClassName="lg:border-t border-t-0"
      className="flex flex-col items-center text-center lg:text-start lg:grid lg:grid-cols-2 lg:items-stretch"
    >
      <div
        ref={afterHeroSectionRef}
        className="lg:border-r border-b lg:border-b-[0] w-full"
      >
        <div className="sticky top-12 lg:p-24 p-10 pt-0 lg:pt-10">
          <h2 className="text-5xl lg:text-6xl font-medium leading-tight text-ui-fg-base">
            {t("gorgoTitle")}
          </h2>
          <p className="text-ui-fg-subtle pt-4">{t("gorgoSubtitle")}</p>
        </div>
      </div>

      <div className="w-full">
        <LinksPlugins />
        <LinkSection
          id="community"
          title={t("communitySupport")}
          description={t("communitySupportDescription")}
          className="lg:px-0 w-full"
        >
          <div className="flex flex-col gap-px w-full p-0">
            <LinkCard
              title={t("items.medusaChat.title")}
              url={t("items.medusaChat.url")}
              visualUrl={t("items.medusaChat.visualUrl")}
              description={t("items.medusaChat.description")}
              image={Telegram}
              button={t("items.medusaChat.button")}
            />
            <LinkCard
              title={t("items.medusaNews.title")}
              url={t("items.medusaNews.url")}
              visualUrl={t("items.medusaNews.visualUrl")}
              description={t("items.medusaNews.description")}
              image={Telegram}
              button={t("items.medusaNews.button")}
            />
          </div>
        </LinkSection>
        <LinkSection title={t("docs.title")} description={t("docs.subtitle")}>
          <Button asChild size="large">
            <Link href={gorgoDocsLink}>
              {t("docs.button")} <ArrowRight />
            </Link>
          </Button>
        </LinkSection>
      </div>
    </Section>
  );
}
