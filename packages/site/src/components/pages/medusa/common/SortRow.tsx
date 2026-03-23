"use client";

import { TriangleRightMini } from "@medusajs/icons";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SortSelect } from "..";

export default function SortRow({ className }: { className?: string }) {
  const t = useTranslations("Medusa.sort");

  return (
    <div className={cn("flex justify-between items-center", className)}>
      <div className="flex items-center gap-2 txt-compact-small-plus text-ui-fg-muted">
        <Link className="hover:text-ui-fg-subtle" href={"/medusa"}>
          {t("medusa")}
        </Link>
        <TriangleRightMini />
        <Link className="hover:text-ui-fg-subtle" href={"/medusa/plugins"}>
          {t("plugins")}
        </Link>
      </div>

      <div className="flex items-center gap-2 text-ui-fg-muted">
        <div className="txt-compact-small text-nowrap mr-3">{t("orderBy")}</div>
        <div className="flex gap-1.5 items-center">
          <SortSelect />
        </div>
      </div>
    </div>
  );
}
