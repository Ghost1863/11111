import { unstable_cache } from "next/cache";
import { extractGitHubRepoPath } from "@/lib/github-utils";
import { fetchInBatches } from "@/lib/http";
import { fetchNpmDownloads, fetchNpmLatestVersion } from "@/lib/npm";
import type { Author, Plugin, SortablePlugin } from "@/types";
import {
  loadAuthors,
  loadCategories,
  loadPluginSlugs,
  loadPluginsBase,
} from "./content";
import { getAllRepoStars } from "./repo-stars";

const REVALIDATE_SECONDS = 3600;

export const getAllPlugins = (locale: string) =>
  unstable_cache(
    async (): Promise<SortablePlugin[]> => {
      const rawPlugins = await loadPluginsBase(locale);
      const starsByRepoPath = await getAllRepoStars();

      const pluginsWithStats = await fetchInBatches(
        rawPlugins,
        10,
        async (plugin) => {
          let downloads = 0;
          let stars = 0;
          if (plugin.repository) {
            const repoPath = extractGitHubRepoPath(plugin.repository);
            if (repoPath) {
              stars = starsByRepoPath[repoPath] || 0;
            }
          }
          if (plugin.npm) {
            const downloadData = await fetchNpmDownloads(plugin.npm);
            downloads = downloadData.downloads;
          }
          return {
            ...plugin,
            stars,
            downloads,
          };
        },
        1000,
      );

      return pluginsWithStats;
    },
    ["all-plugins-data", locale],
    { revalidate: REVALIDATE_SECONDS },
  );

export const getPluginBySlug = (locale: string) =>
  unstable_cache(
    async (slug: string): Promise<SortablePlugin | undefined> => {
      const allPlugins = await loadPluginsBase(locale);
      const plugin = allPlugins.find((p) => p.slug === slug);

      if (!plugin) {
        return undefined;
      }

      const [version, downloadsData] = await Promise.all([
        fetchNpmLatestVersion(plugin.npm),
        plugin.npm
          ? fetchNpmDownloads(plugin.npm)
          : { downloads: 0, period: "last-month" },
      ]);

      let stars = 0;
      if (plugin.repository) {
        const repoPath = extractGitHubRepoPath(plugin.repository);
        if (repoPath) {
          const starsByRepoPath = await getAllRepoStars();
          stars = starsByRepoPath[repoPath] || 0;
        }
      }

      return {
        ...plugin,
        version,
        downloads: downloadsData.downloads,
        stars,
      };
    },
    ["plugin-by-slug", locale],
    { revalidate: REVALIDATE_SECONDS },
  );

export const getPluginBySlugBase = (locale: string) =>
  unstable_cache(
    async (slug: string): Promise<Plugin | undefined> => {
      const allPlugins = await loadPluginsBase(locale);
      return allPlugins.find((p) => p.slug === slug);
    },
    ["plugin-by-slug-base", locale],
    { revalidate: REVALIDATE_SECONDS },
  );

export const getPluginsByCategory = (locale: string) =>
  unstable_cache(
    async (
      category: string,
      excludeSlug?: string,
      limit: number = 3,
    ): Promise<SortablePlugin[]> => {
      const allPlugins = await loadPluginsBase(locale);
      return allPlugins
        .filter(
          (plugin) =>
            plugin.category === category &&
            (!excludeSlug || plugin.slug !== excludeSlug),
        )
        .slice(0, limit);
    },
    ["plugins-by-category", locale],
    { revalidate: REVALIDATE_SECONDS },
  );

export const getPluginsByAuthor = (locale: string) =>
  unstable_cache(
    async (
      author: string,
      excludeSlug?: string,
      limit: number = 3,
    ): Promise<SortablePlugin[]> => {
      const allPlugins = await loadPluginsBase(locale);
      return allPlugins
        .filter(
          (plugin) =>
            plugin.author === author &&
            (!excludeSlug || plugin.slug !== excludeSlug),
        )
        .slice(0, limit);
    },
    ["plugins-by-author", locale],
    { revalidate: REVALIDATE_SECONDS },
  );

export const getAllPluginSlugs = unstable_cache(
  async (): Promise<string[]> => {
    return loadPluginSlugs();
  },
  ["all-plugin-slugs"],
  { revalidate: REVALIDATE_SECONDS },
);

export const getAuthors = (locale: string = "en") =>
  unstable_cache(
    async (): Promise<Author[]> => {
      return loadAuthors(locale);
    },
    ["authors-data", locale],
    { revalidate: REVALIDATE_SECONDS },
  );

export const getCategories = (locale: string = "en") =>
  unstable_cache(
    async () => {
      return loadCategories(locale);
    },
    ["categories-data", locale],
    { revalidate: REVALIDATE_SECONDS },
  );
