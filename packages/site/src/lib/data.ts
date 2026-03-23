import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unstable_cache } from "next/cache";
import type { Plugin } from "@/types";

const CONTENT_DIR = path.join(process.cwd(), "content");

export const getAllPlugins = unstable_cache(
  async (): Promise<Plugin[]> => {
    const folders = fs.readdirSync(CONTENT_DIR).filter((f) => {
      return fs.statSync(path.join(CONTENT_DIR, f)).isDirectory();
    });

    const plugins: Plugin[] = [];

    for (const slug of folders) {
      const readmePath = path.join(CONTENT_DIR, slug, "readme.md");

      if (fs.existsSync(readmePath)) {
        const fileContent = fs.readFileSync(readmePath, "utf8");
        const { data } = matter(fileContent);

        const pluginData: Plugin = {
          slug: data.slug || slug,
          label: data.label || "Unknown",
          category: data.category || "other",
          author: data.author || "community",
          shortDescription: data.shortDescription || "",
          description: data.description || "",
          npm: data.npm,
          repository: data.repository,
          icon: data.icon,
          telegramLink: data.telegramLink,
          discordLink: data.discordLink,
          docsLink: data.docsLink,
        };

        plugins.push(pluginData);
      }
    }

    return plugins;
  },
  ["all-plugins-files"],
  { revalidate: 3600 },
);
