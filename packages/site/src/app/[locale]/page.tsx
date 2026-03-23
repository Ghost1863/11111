import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AnimatedLogos, Hero, Links } from "@/components/pages/main";
import { buildAlternates } from "@/lib/alternates";
import { getSiteHost } from "@/lib/site-url";
import type { Locale } from "@/types";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage.metadata" });

  const pathname = "/";

  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(pathname, locale, getSiteHost()),
  } as Metadata;
}

export default async function Home() {
  return (
    <main className="flex flex-col row-start-2 w-full">
      <Hero />
      <AnimatedLogos />
      <Links />
    </main>
  );
}
