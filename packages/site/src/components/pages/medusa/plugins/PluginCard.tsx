"use client";

import {
  SiDiscord,
  SiDiscordHex,
  SiGithub,
  SiGithubHex,
  SiNpm,
  SiNpmHex,
  SiTelegram,
  SiTelegramHex,
} from "@icons-pack/react-simple-icons";
import { ArrowDownTray, Star } from "@medusajs/icons";
import Link from "next/link";
import { useTranslations } from "next-intl";
import PluginAvatar from "@/components/plugin-avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Plugin } from "@/types";

function PluginLink(props: {
  href?: string;
  hoverColor: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  if (props.href)
    return (
      <a
        href={props.href}
        target="_blank"
        rel="noopener noreferrer"
        className="border p-1.5 rounded-full hover:text-(--hover-color) transition-colors text-ui-fg-subtle"
        style={
          {
            "--hover-color": props.hoverColor,
          } as React.CSSProperties
        }
      >
        <props.icon className="size-3.5" />
      </a>
    );
}

export default function PluginCard({
  plugin,
  className,
}: {
  plugin: Plugin;
  className?: string;
}) {
  const t = useTranslations("Medusa.card");
  return (
    <div
      key={plugin.slug}
      className={cn(
        "group flex flex-col gap-7 bg-ui-bg-base transition-colors rounded-md shadow-elevation-card-rest",
        className,
      )}
    >
      <div className="flex justify-between items-center pt-6 px-6">
        <div className="txt-xsmall capitalize text-ui-fg-subtle">
          {plugin.categoryLocalized || plugin.category}
        </div>
      </div>
      <Link href={"/medusa/plugins/" + plugin.slug} className="px-6">
        <div className="flex items-center gap-3">
          <PluginAvatar plugin={plugin} size={48} className="w-12 h-12" />
          <div className="flex flex-col gap-1">
            <h4 className="txt-compact-xlarge font-medium group-hover:text-primary transition-colors wrap-break-words line-clamp-2 text-ui-fg-base">
              {plugin.label}
            </h4>
            <div className="text-sm text-ui-fg-muted">
              {t("byAuthor")} {plugin.authorLocalized || plugin.author}
            </div>
          </div>
        </div>
        <p className="text-ui-fg-subtle txt-medium line-clamp-3 mt-2">
          {plugin.description}
        </p>
      </Link>
      <div className="space-y-3 mt-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-ui-fg-subtle">
            {typeof plugin.downloads === "number" && (
              <>
                <ArrowDownTray />
                <div className="text-sm">{plugin.downloads}</div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-ui-fg-subtle">
            {typeof plugin.stars === "number" && (
              <>
                <Star />
                <div className="text-sm">{plugin.stars}</div>
              </>
            )}
          </div>
        </div>
        <Separator />
        <div className="flex gap-2 pb-6">
          <PluginLink
            href={plugin.discordLink}
            icon={SiDiscord}
            hoverColor={SiDiscordHex}
          />
          <PluginLink
            href={plugin.telegramLink}
            icon={SiTelegram}
            hoverColor={SiTelegramHex}
          />
          <PluginLink
            href={plugin.repository}
            icon={SiGithub}
            hoverColor={SiGithubHex}
          />
          <PluginLink
            href={
              plugin.npm ? `https://www.npmjs.com/package/${plugin.npm}` : ""
            }
            icon={SiNpm}
            hoverColor={SiNpmHex}
          />
        </div>
      </div>
      {/*<div className="flex items-center justify-between pb-8 px-8 txt-compact-large-plus">
        500$
        <Button>{t("buy")}</Button>
      </div>*/}
    </div>
  );
}
