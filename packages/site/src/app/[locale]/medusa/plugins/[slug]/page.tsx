import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PluginTemplate from "@/components/pages/medusa/PluginTemplate";
import { routing } from "@/i18n/routing";
import { buildAlternates } from "@/lib/alternates";
import {
  getAllPluginSlugs,
  getPluginBySlug,
  getPluginBySlugBase,
  getPluginsByAuthor,
  getPluginsByCategory,
} from "@/lib/plugins";
import { getSiteHost } from "@/lib/site-url";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  const plugin = await getPluginBySlugBase(params.locale)(params.slug);

  if (!plugin) {
    return {} as Metadata;
  }

  const pathname = `/medusa/plugins/${params.slug}`;

  return {
    title: `Medusa - ${plugin.label}`,
    description: plugin.description,
    alternates: buildAlternates(pathname, params.locale, getSiteHost()),
  };
}

export async function generateStaticParams() {
  const slugs = await getAllPluginSlugs();
  const locales = routing.locales;
  const paths = [];

  for (const locale of locales) {
    for (const slug of slugs) {
      paths.push({
        locale,
        slug,
      });
    }
  }

  return paths;
}

export const dynamicParams = false;
export const revalidate = 3600;

export default async function PluginPage(props: Props) {
  const params = await props.params;

  const plugin = await getPluginBySlug(params.locale)(params.slug);

  if (!plugin) {
    notFound();
  }

  const relatedByCategory = await getPluginsByCategory(params.locale)(
    plugin.category,
    plugin.slug,
    3,
  );

  const relatedByAuthor = await getPluginsByAuthor(params.locale)(
    plugin.author,
    plugin.slug,
    3,
  );

  return (
    <PluginTemplate
      plugin={plugin}
      locale={params.locale}
      relatedByCategory={relatedByCategory}
      relatedByAuthor={relatedByAuthor}
    />
  );
}
