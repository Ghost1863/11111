import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Plugin } from "@/types";
import PluginCard from "./PluginCard";

export default function PluginsList({
  plugins,
  className,
}: {
  plugins: Plugin[];
  className?: string;
}) {
  const t = useTranslations("MedusaPluginsPage");

  if (plugins.length > 0)
    return (
      <div
        className={cn(
          className,
          "grid px-6 lg:px-0 grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6",
        )}
      >
        {plugins.map((plugin, index) => (
          <PluginCard key={index} plugin={plugin} />
        ))}{" "}
      </div>
    );
  else {
    return (
      <div
        className={cn(
          className,
          "flex items-center justify-center w-full h-full text-center text-xl py-16 px-6 text-ui-fg-subtle",
        )}
      >
        {t("noPlugins")}
      </div>
    );
  }
}
