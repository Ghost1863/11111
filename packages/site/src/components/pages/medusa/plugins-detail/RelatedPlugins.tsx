import { ArrowRight } from "@medusajs/icons";
import { useTranslations } from "next-intl";
import { PluginCard } from "@/components/pages/medusa";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Plugin } from "@/types";

type RelatedPluginsProps = {
  plugins: Plugin[];
  category?: string;
  author?: string;
  title: string;
};

export default function RelatedPlugins({
  plugins,
  title,
  category,
  author,
}: RelatedPluginsProps) {
  const t = useTranslations("MedusaPluginsDetailPage");

  if (!plugins || plugins.length === 0) {
    return null;
  }

  let url = "/medusa/plugins";

  const params = new URLSearchParams();

  if (category) params.set("category", category);
  if (author) params.set("author", author);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between pt-16 pb-6 ">
        <h3 className="text-2xl lg:text-4xl text-ui-fg-subtle">{title}</h3>
        <Button
          size="large"
          variant="secondary"
          className="text-nowrap"
          asChild
        >
          <Link href={url}>
            {t("viewAll")} <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
        {plugins.map((plugin) => (
          <PluginCard
            key={plugin.slug}
            plugin={plugin}
            className="ring ring-ui-border-base"
          />
        ))}
      </div>
    </div>
  );
}
