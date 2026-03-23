"use client";

import { TriangleRightMini } from "@medusajs/icons";
import transliterate from "@sindresorhus/transliterate";
import Fuse from "fuse.js";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import {
  Filter,
  Pagination,
  PluginsList,
  Search,
  SortRow,
  SortSelect,
} from "@/components/pages/medusa";
import Section from "@/components/section";
import SidebarElement from "@/components/ui/sidebar-element";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMedusaFilters } from "@/hooks/use-medusa-filters";
import type { Plugin } from "@/types";

const PER_PAGE = 30;

type Props = {
  initialPlugins: Plugin[];
  authors: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; icon?: string }>;
};

export default function PluginsClientPage({
  initialPlugins,
  authors: authorsList,
  categories: categoriesList,
}: Props) {
  const { q, category, authors, community, page, sortBy, sortDir } =
    useMedusaFilters();
  const isDesktop = useMediaQuery("(min-width: 1024px)", {
    defaultValue: true,
    initializeWithValue: false,
  });

  const searchItems = useMemo(
    () =>
      initialPlugins.map((plugin) => ({
        plugin,
        label: plugin.label,
        description: plugin.description || "",
        labelTranslit: transliterate(plugin.label),
        descriptionTranslit: transliterate(plugin.description || ""),
      })),
    [initialPlugins],
  );

  const fuse = useMemo(
    () =>
      new Fuse(searchItems, {
        keys: [
          { name: "label", weight: 0.6 },
          { name: "description", weight: 0.4 },
          { name: "labelTranslit", weight: 0.6 },
          { name: "descriptionTranslit", weight: 0.4 },
        ],
        includeScore: false,
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [searchItems],
  );

  const searchedPlugins = useMemo(() => {
    if (!q) return initialPlugins;

    const trimmedQuery = q.trim();
    if (!trimmedQuery) return initialPlugins;

    const queryTranslit = transliterate(trimmedQuery);
    const results = fuse.search(trimmedQuery);
    const translitResults =
      queryTranslit !== trimmedQuery ? fuse.search(queryTranslit) : [];

    const unique = new Map<string, Plugin>();
    results.forEach((result) => {
      unique.set(result.item.plugin.slug, result.item.plugin);
    });
    translitResults.forEach((result) => {
      unique.set(result.item.plugin.slug, result.item.plugin);
    });

    return Array.from(unique.values());
  }, [fuse, initialPlugins, q]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const processedPlugins = useMemo(() => {
    const result = searchedPlugins.filter((plugin) => {
      if (category !== "all" && plugin.category !== category) {
        return false;
      }

      if (authors.length > 0 && !authors.includes(plugin.author)) {
        return false;
      }

      if (community.length > 0) {
        const hasAllSupport = community.every((type) => {
          switch (type.trim()) {
            case "telegram":
              return !!plugin.telegramLink;
            case "discord":
              return !!plugin.discordLink;
            case "documentation":
              return !!plugin.docsLink;
            default:
              return true;
          }
        });
        if (!hasAllSupport) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      if (!sortBy) {
        const isAOfficial = a.author === "gorgo";
        const isBOfficial = b.author === "gorgo";

        if (isAOfficial && !isBOfficial) return -1;
        if (isBOfficial && !isAOfficial) return 1;

        return (b.downloads || 0) - (a.downloads || 0);
      }

      if (sortBy === "github") {
        const starsA = a.stars || 0;
        const starsB = b.stars || 0;
        return starsB - starsA;
      } else if (sortBy === "npm") {
        const downloadsA = a.downloads || 0;
        const downloadsB = b.downloads || 0;
        return downloadsB - downloadsA;
      } else if (sortBy === "name") {
        if (sortDir === "ascending") {
          return a.label.localeCompare(b.label);
        } else {
          return b.label.localeCompare(a.label);
        }
      }

      return 0;
    });

    return result;
  }, [searchedPlugins, category, authors, community, sortBy, sortDir]);

  const totalItems = processedPlugins.length;
  const totalPages = Math.ceil(totalItems / PER_PAGE);
  const validPage = Math.min(Math.max(1, page), Math.max(1, totalPages));

  const paginatedPlugins = processedPlugins.slice(
    (validPage - 1) * PER_PAGE,
    validPage * PER_PAGE,
  );

  const t = useTranslations("Medusa.sort");

  if (isDesktop) {
    return (
      <Section>
        <div className=" grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12 px-6 xl:px-12 pt-14 pb-16">
          <SidebarElement>
            <Filter authors={authorsList} categories={categoriesList} />
          </SidebarElement>
          <div className="flex flex-col">
            <SortRow className="mb-4 flex-row" />
            <PluginsList plugins={paginatedPlugins} />
            <Pagination
              page={validPage}
              totalPages={totalPages}
              className="mt-16"
            />
          </div>
        </div>
      </Section>
    );
  } else {
    return (
      <Section>
        <div className="lg:pt-14 pb-4">
          <div className="sticky top-14 z-10 py-3 px-6 border-b flex flex-row items-center bg-ui-bg-component backdrop-blur supports-backdrop-filter:bg-ui-bg-component/60 justify-between">
            <div className="relative w-full flex justify-between gap-3">
              <div className="flex items-center gap-2 txt-compact-small-plus text-ui-fg-muted">
                <Link className="hover:text-ui-fg-subtle" href={"/medusa"}>
                  {t("medusa")}
                </Link>
                <TriangleRightMini />
                <Link
                  className="hover:text-ui-fg-subtle"
                  href={"/medusa/plugins"}
                >
                  {t("plugins")}
                </Link>
              </div>

              <div className="flex items-center gap-2 h-6">
                <Search
                  className="min-w-15 rounded-md h-6.5 z-10"
                  placeholder="Search..."
                  isMobile
                />

                <SidebarElement>
                  <Filter authors={authorsList} categories={categoriesList} />
                </SidebarElement>

                <SortSelect isMobile />
              </div>
            </div>
          </div>

          <PluginsList className="mt-4 px-4" plugins={paginatedPlugins} />
          <div className="overflow-x-auto pb-2 px-6 ">
            <Pagination
              page={validPage}
              totalPages={totalPages}
              className="my-16 min-w-max"
            />
          </div>
        </div>
      </Section>
    );
  }
}
