import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Hero, PluginsClientPage } from "@/components/pages/medusa";
import { buildAlternates } from "@/lib/alternates";
import { getAllPlugins, getAuthors, getCategories } from "@/lib/plugins";
import { getSiteHost } from "@/lib/site-url";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "MedusaPluginsPage.metadata",
  });

  const pathname = "/medusa/plugins";

  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(pathname, locale, getSiteHost()),
  } as Metadata;
}

export default async function MedusaPlugins(props: Props) {
  const params = await props.params;
  const [pluginsData, authorsData, categoriesData] = await Promise.all([
    getAllPlugins(params.locale)(),
    getAuthors(params.locale)(),
    getCategories(params.locale)(),
  ]);

  return (
    <main>
      <Hero page="plugins" />
      <Suspense fallback={<div />}>
        <PluginsClientPage
          initialPlugins={pluginsData}
          authors={authorsData}
          categories={categoriesData}
        />
      </Suspense>
    </main>
  );
}
