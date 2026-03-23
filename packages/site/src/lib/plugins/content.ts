import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import type { Author, AuthorId, Category, Plugin } from "@/types";

const CONTENT_DIR = path.join(process.cwd(), "content");

type RawPlugin = {
  slug: string;
  name?: Record<
    string,
    { label?: string; shortDescription?: string; description?: string }
  >;
  category: string;
  author: AuthorId;
  npm?: string;
  repository?: string;
  telegramLink?: string;
  discordLink?: string;
  docsLink?: string;
  icon?: string;
  lastPublish?: string;
};

type RawAuthor = {
  id: string;
  name?: Record<string, string>;
  isCommunity?: boolean;
};

type RawCategory = {
  id: string;
  name?: Record<string, string>;
  icon?: string;
};

async function readYaml<T>(fileName: string): Promise<T> {
  const filePath = path.join(CONTENT_DIR, fileName);
  const content = await fs.promises.readFile(filePath, "utf8");
  return yaml.load(content) as T;
}

function getLocalizedName(
  names: Record<string, string> | undefined,
  locale: string,
  fallback: string,
): string {
  return names?.[locale] || names?.["en"] || fallback;
}

async function getPluginIcon(slug: string): Promise<string | undefined> {
  const pluginDir = path.join(CONTENT_DIR, "plugins", slug);
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];

  for (const ext of imageExtensions) {
    const iconPath = path.join(pluginDir, `icon${ext}`);
    try {
      await fs.promises.access(iconPath, fs.constants.F_OK);
      return `/api/plugin-icon?slug=${encodeURIComponent(slug)}`;
    } catch {}
  }

  return undefined;
}

export async function loadPluginsBase(
  locale: string = "en",
): Promise<Plugin[]> {
  const [pluginsData, authorsData, categoriesData] = await Promise.all([
    readYaml<RawPlugin[]>("plugins.yml"),
    readYaml<RawAuthor[]>("authors.yml"),
    readYaml<RawCategory[]>("categories.yml"),
  ]);

  const authorMap = new Map<string, string>();
  authorsData.forEach((author) => {
    authorMap.set(author.id, getLocalizedName(author.name, locale, author.id));
  });

  const categoryMap = new Map<string, string>();
  categoriesData.forEach((category) => {
    categoryMap.set(
      category.id,
      getLocalizedName(category.name, locale, category.id),
    );
  });

  const plugins = pluginsData.map((plugin) => {
    const localizedData = plugin.name?.[locale] || plugin.name?.["en"] || {};
    return {
      slug: plugin.slug,
      label: localizedData.label || "",
      category: plugin.category,
      categoryLocalized: categoryMap.get(plugin.category) || plugin.category,
      author: plugin.author,
      authorLocalized: authorMap.get(plugin.author) || plugin.author,
      shortDescription: localizedData.shortDescription || "",
      description: localizedData.description || "",
      npm: plugin.npm,
      repository: plugin.repository,
      telegramLink: plugin.telegramLink,
      discordLink: plugin.discordLink,
      docsLink: plugin.docsLink,
      icon: plugin.icon,
      lastPublish: plugin.lastPublish,
    };
  });

  const pluginsWithIcons = await Promise.all(
    plugins.map(async (plugin) => {
      const icon = await getPluginIcon(plugin.slug);
      return {
        ...plugin,
        icon,
      };
    }),
  );

  return pluginsWithIcons;
}

export async function loadPluginSlugs(): Promise<string[]> {
  const pluginsData = await readYaml<RawPlugin[]>("plugins.yml");
  return pluginsData.map((plugin) => plugin.slug);
}

export async function loadAuthors(locale: string = "en"): Promise<Author[]> {
  const authorsData = await readYaml<RawAuthor[]>("authors.yml");
  return authorsData.map((author) => ({
    id: author.id,
    name: getLocalizedName(author.name, locale, author.id),
    icon: `/api/author-icon?id=${encodeURIComponent(author.id)}`,
    isCommunity: author.isCommunity || false,
  }));
}

export async function loadCategories(
  locale: string = "en",
): Promise<Category[]> {
  const categoriesData = await readYaml<RawCategory[]>("categories.yml");
  return categoriesData.map((category) => ({
    id: category.id,
    name: getLocalizedName(category.name, locale, category.id),
    icon: category.icon || "",
  }));
}
