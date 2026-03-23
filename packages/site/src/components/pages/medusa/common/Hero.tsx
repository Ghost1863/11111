import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Search } from "@/components/pages/medusa";
import { TabButton } from "@/components/ui/tab-button";

export default async function Hero({
  page,
}: {
  page: "discover" | "plugins";
}) {
  const t = await getTranslations("Medusa.hero");

  return (
    <div className="py-16 flex flex-col text-center items-center mx-auto px-2 sm:px-6 w-full">
      <h1 className="text-4xl xl:text-6xl text-ui-fg-base whitespace-pre-line mb-[18px]">
        {t(`${page}.title`)}
      </h1>
      <p className="text-ui-fg-subtle txt-small max-w-md mb-6">
        {t(`${page}.subtitle`)}
      </p>

      <div className="flex gap-3">
        <div className="flex gap-2">
          {/*<TabButton
            className="h-[36px]"
            isActive={page === "discover"}
            asChild
          >
            <Link href={"/medusa-discover"}>{t("discover.tab")}</Link>
          </TabButton>*/}
          <TabButton className="h-[36px]" isActive={page === "plugins"} asChild>
            <Link href={"/medusa/plugins"}>{t("plugins.tab")}</Link>
          </TabButton>
        </div>

        <div className="hidden lg:flex items-center">
          <div className="h-full w-px bg-ui-border-base mr-7" />
          <Search placeholder={t("searchPlaceholder")} />
        </div>
      </div>
    </div>
  );
}
