import {
  SiDiscord,
  SiDiscordHex,
  SiGithub,
  SiNpm,
  SiNpmHex,
  SiTelegram,
  SiTelegramHex,
} from "@icons-pack/react-simple-icons";
import { ArrowDownTray, DocumentText, Star } from "@medusajs/icons";
import { Copy } from "@medusajs/ui";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { Plugin } from "@/types";

function Stat({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-ui-fg-subtle">{label}</div>
      <div className="flex gap-2 items-center text-ui-fg-base">{value}</div>
    </div>
  );
}

export default function PluginInfo({ plugin }: { plugin: Plugin }) {
  const t = useTranslations("MedusaPluginsDetailPage");
  const formatter = useFormatter();
  const npmCommand = `npm install ${plugin.npm}`;

  return (
    <div className="flex flex-col p-6 sm:p-8  border-collapse gap-8 bg-ui-bg-base-pressed">
      <div className="text-sm font-mono flex items-center justify-between w-full border whitespace-break-spaces text-code-label rounded-md p-2 px-4 border-ui-tag-neutral-border bg-ui-bg-base">
        {npmCommand} <Copy className="cursor-pointer" content={npmCommand} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Stat
          label={t("category")}
          value={plugin.categoryLocalized || plugin.category}
        />
        <Stat
          label={t("builtBy")}
          value={plugin.authorLocalized || plugin.author}
        />
        <Stat label={t("version")} value={plugin.version || "unknown"} />
        {plugin.lastPublish && (
          <Stat
            label={t("lastUpdated")}
            value={formatter.relativeTime(
              new Date(plugin.lastPublish),
              new Date(),
            )}
          />
        )}
        {typeof plugin.downloads === "number" && (
          <Stat
            label={t("monthlyDownloads")}
            value={
              <>
                <ArrowDownTray />
                {plugin.downloads}
              </>
            }
          />
        )}
        {typeof plugin.stars === "number" && (
          <Stat
            label={t("githubStars")}
            value={
              <>
                <Star />
                {plugin.stars}
              </>
            }
          />
        )}
      </div>
      <div className="space-y-2">
        {!!plugin.npm && (
          <Button size="large" variant="secondary" className="w-full" asChild>
            <Link
              href={`https://www.npmjs.com/package/${plugin.npm}`}
              target="_blank"
              rel="noreferrer"
            >
              <SiNpm
                style={{
                  color: SiNpmHex,
                }}
              />
              {t("npm")}
            </Link>
          </Button>
        )}
        {!!plugin.repository && (
          <Button size="large" variant="secondary" className="w-full" asChild>
            <Link href={plugin.repository} target="_blank" rel="noreferrer">
              <SiGithub />
              {t("github")}
            </Link>
          </Button>
        )}
        {!!plugin.telegramLink && (
          <Button size="large" variant="secondary" className="w-full" asChild>
            <Link href={plugin.telegramLink} target="_blank" rel="noreferrer">
              <SiTelegram
                style={{
                  color: SiTelegramHex,
                }}
              />
              {t("telegram")}
            </Link>
          </Button>
        )}
        {!!plugin.discordLink && (
          <Button size="large" variant="secondary" className="w-full" asChild>
            <Link href={plugin.discordLink} target="_blank" rel="noreferrer">
              <SiDiscord
                style={{
                  color: SiDiscordHex,
                }}
              />
              {t("discord")}
            </Link>
          </Button>
        )}
        {!!plugin.docsLink && (
          <Button size="large" variant="secondary" className="w-full" asChild>
            <Link href={plugin.docsLink} target="_blank" rel="noreferrer">
              <DocumentText />
              {t("docs")}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
