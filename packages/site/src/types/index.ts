export type Author = {
  id: string;
  name: string;
  icon?: string;
  isCommunity?: boolean;
};

export type Category = {
  id: string;
  name: string;
  icon?: string;
};

export type PluginMetadata = {
  title: string;
  description?: string;
};

export type PluginStats = {
  stars?: number;
  downloads?: number;
};

export type Type = {
  id: string;
  name: string;
};

export type PluginsFile = PluginMetadata[];

export const locales = ["en", "ru"] as const;

export type Locale = (typeof locales)[number];

export type SortKey = "github" | "npm" | null;
export type SortDir = "asc" | "desc";

export type FilterState = {
  q: string;
  category: string;
  authors: string[];
  community: string[];
};

// Allow for both predefined and dynamic author IDs
export type AuthorId = string;

export interface ILinks {
  npm?: string;
  repository?: string;
  telegramLink?: string;
  discordLink?: string;
  docsLink?: string;
}

export interface IFilterable extends ILinks {
  category: string;
  label: string;
  shortDescription: string;
  description: string;
  slug: string;
  author: AuthorId;
}

export interface ISortable {
  stars?: number;
  downloads?: number;
}

export interface Plugin extends IFilterable {
  icon?: string;
  stars?: number;
  downloads?: number;
  version?: string;
  lastPublish?: string;
  categoryLocalized?: string;
  authorLocalized?: string;
}

export interface SortablePlugin extends Plugin, ISortable {}
