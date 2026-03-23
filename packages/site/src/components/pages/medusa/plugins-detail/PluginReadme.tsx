import fs from "fs/promises";
import path from "path";
import { cn } from "@/lib/utils";

const CONTENT_DIR = path.join(process.cwd(), "content", "plugins");

async function loadReadme(slug: string, locale: string) {
  const localePath = path.join(CONTENT_DIR, slug, `${locale}.md`);
  try {
    await fs.access(localePath);
    return await import(`@/content/plugins/${slug}/${locale}.md`);
  } catch {
    return await import(`@/content/plugins/${slug}/en.md`);
  }
}

export default async function PluginReadme({
  path,
  locale,
  className,
}: {
  path: string;
  locale: string;
  className?: string;
}) {
  const { default: Post } = await loadReadme(path, locale);

  return (
    <div className={cn("space-y-5 p-6 sm:p-8 lg:-12", className)}>
      <Post />
    </div>
  );
}
