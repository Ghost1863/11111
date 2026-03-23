import { TriangleRightMini } from "@medusajs/icons";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import PluginAvatar from "@/components/plugin-avatar";
import Section from "@/components/section";
import type { Plugin } from "@/types";
import PluginReadme from "./plugins-detail/PluginReadme";
import PluginSidebar from "./plugins-detail/PluginSidebar";
import RelatedPlugins from "./plugins-detail/RelatedPlugins";

type Props = {
  plugin: Plugin;
  relatedByCategory: Plugin[];
  relatedByAuthor: Plugin[];
  locale: string;
};

const PluginTemplate = async ({
  plugin,
  relatedByAuthor,
  relatedByCategory,
  locale,
}: Props) => {
  const t = await getTranslations({
    locale,
    namespace: "MedusaPluginsDetailPage",
  });

  if (!plugin || !plugin.slug) {
    return notFound();
  }

  return (
    <main>
      <div className="lg:hidden sticky top-14 z-10 py-3 px-6 border-b flex flex-row items-center gap-3 bg-ui-bg-component backdrop-blur supports-backdrop-filter:bg-ui-bg-component/60 justify-between">
        <div className="flex items-center gap-2 txt-compact-small-plus text-ui-fg-muted">
          <Link className="hover:text-ui-fg-subtle" href={"/medusa"}>
            {t("medusa")}
          </Link>
          <TriangleRightMini />
          <Link className="hover:text-ui-fg-subtle" href={"/medusa/plugins"}>
            {t("plugins")}
          </Link>
          <TriangleRightMini />
          {plugin.label}
        </div>
      </div>
      <Section
        className="flex flex-col items-center gap-6 py-16 pt-20 border-none relative"
        containerClassName="border-none"
      >
        {/*<Button
          variant="transparent"
          className="left-4 top-4 absolute text-ui-fg-subtle"
          asChild
        >
          <Link href={"/medusa/plugins"}>
            <ArrowDownLeftMini />
            {t("goBack")}
          </Link>
        </Button>*/}
        <div className="container mx-auto w-full">
          <div className="flex flex-col items-center text-center gap-6 px-4">
            <PluginAvatar plugin={plugin} size={96} className="w-24 h-24" />
            <div className="flex flex-col items-center max-lg:max-w-md max-w-2xl space-y-3">
              <h1 className="text-[40px] text-ui-fg-base">{plugin.label}</h1>
              <p className="txt-xlarge text-ui-fg-subtle max-w-md">
                {plugin.description}
              </p>
            </div>
          </div>
        </div>
      </Section>
      <Section className="relative grid lg:grid-cols-[430px_1fr] grid-cols-1  mx-auto">
        <PluginSidebar plugin={plugin} />
        <div>
          <div className="hidden lg:flex items-center gap-2 txt-compact-small-plus text-ui-fg-muted p-6 sm:p-8">
            <Link className="hover:text-ui-fg-subtle" href={"/medusa"}>
              {t("medusa")}
            </Link>
            <TriangleRightMini />
            <Link className="hover:text-ui-fg-subtle" href={"/medusa/plugins"}>
              {t("plugins")}
            </Link>
            <TriangleRightMini />
            {plugin.label}
          </div>
          <PluginReadme path={plugin.slug} locale={locale} />
        </div>
      </Section>
      <Section className="pb-12 px-6 sm:px-8 lg:px-0 sm:border-x-0">
        <RelatedPlugins
          category={plugin.category}
          plugins={relatedByCategory}
          title={t("moreInThisCategory")}
        />
      </Section>
      <Section className="pb-12 px-6 sm:px-8 lg:px-0 sm:border-x-0">
        <RelatedPlugins
          author={plugin.author}
          plugins={relatedByAuthor}
          title={t("moreByThisAuthor")}
        />
      </Section>
    </main>
  );
};

export default PluginTemplate;
