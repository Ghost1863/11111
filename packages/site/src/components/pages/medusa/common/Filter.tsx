"use client";

import { UserGroup, XMark } from "@medusajs/icons";
import { Checkbox, Label, Select } from "@medusajs/ui";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMedusaFilters } from "@/hooks/use-medusa-filters";
import { cn } from "@/lib/utils";
import DiscordIcon from "@/svg/icons/discord.svg";
import DocumentIcon from "@/svg/icons/document.svg";
import TelegramIcon from "@/svg/icons/telegram.svg";
import type { Author, Category } from "@/types";

export default function Filter({
  authors = [],
  categories = [],
  className,
}: {
  authors?: Author[];
  categories?: Category[];
  className?: string;
}) {
  const t = useTranslations("Medusa.filter");
  const isDesktop = useMediaQuery("(min-width: 1024px)", {
    defaultValue: true,
    initializeWithValue: false,
  });

  const [isAuthorsOpen, setIsAuthorsOpen] = useState(true);
  const [isCommunityOpen, setIsCommunityOpen] = useState(true);

  const {
    q,
    category,
    authors: selectedAuthors,
    community: selectedCommunityOptions,
    setCategory,
    toggleAuthor,
    toggleCommunity,
    resetFilters,
  } = useMedusaFilters();

  useEffect(() => {
    setIsAuthorsOpen(isDesktop);
    setIsCommunityOpen(isDesktop);
  }, [isDesktop]);

  const communityOptions = [
    { id: "telegram", icon: TelegramIcon, nameKey: "telegram" },
    { id: "discord", icon: DiscordIcon, nameKey: "discord" },
    { id: "documentation", icon: DocumentIcon, nameKey: "documentation" },
  ];

  const officialAuthors = authors.filter((author) => !author.isCommunity);

  const filteredOfficialAuthors = officialAuthors.map((author) => ({
    ...author,
    icon: ({ className }: { className?: string }) =>
      author.icon ? (
        <Image
          src={author.icon}
          alt={author.name}
          width={16}
          height={16}
          className={cn(className, "rounded-xs")}
          onError={(e) => {
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <UserGroup />
      ),
  }));

  const hasCommunityAuthors = authors.some((author) => author.isCommunity);

  const communityAuthorItem = hasCommunityAuthors
    ? {
        id: "community",
        name: t("author.community"),
        icon: ({ className }: { className?: string }) => (
          <UserGroup className={cn(className)} />
        ),
      }
    : null;

  const hasActiveFilters =
    q ||
    category !== "all" ||
    selectedAuthors.length > 0 ||
    selectedCommunityOptions.length > 0;

  return (
    <div className={cn("flex-1 flex flex-col gap-8", className)}>
      <div className="flex justify-between">
        <h2 className="text-lg text-ui-fg-base">{t("title")}</h2>
        <Button
          variant="transparent"
          className="text-ui-fg-subtle -mr-2 h-9 disabled:pointer-events-none"
          disabled={!hasActiveFilters}
          onClick={resetFilters}
        >
          <XMark />
          {t("clear")}
        </Button>
      </div>

      <div className="space-y-4">
        <Select value={category} onValueChange={setCategory}>
          <Select.Trigger className="w-full text-sm bg-ui-bg-base min-w-fit text-nowrap flex-nowrap whitespace-nowrap space-x-2.5 px-4 h-[36px] cursor-pointer">
            <Select.Value placeholder={t("allCategories")} />
          </Select.Trigger>
          <Select.Content className="z-[110]">
            <Select.Item className="text-sm" value="all">
              {t("allCategories")}
            </Select.Item>
            {categories.map((cat) => (
              <Select.Item key={cat.id} className="text-sm" value={cat.id}>
                {cat.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Collapsible.Root
          open={isAuthorsOpen}
          onOpenChange={setIsAuthorsOpen}
          className="space-y-2"
        >
          <Collapsible.Trigger asChild>
            <Button variant="transparent" className="px-2 txt-compact-xsmall">
              <span>{t("authors")}</span>
              {isAuthorsOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content className="space-y-2 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <ScrollArea showShadows shadowSize="2rem">
              <ScrollBar />
              <div className="max-h-[20rem]">
                <div className="flex flex-col gap-2">
                  {filteredOfficialAuthors.map((author) => (
                    <Label
                      key={author.id}
                      className="border rounded-md cursor-pointer transition-colors bg-ui-bg-base"
                    >
                      <div className="flex items-center">
                        <Checkbox
                          className="size-8 cursor-pointer"
                          checked={selectedAuthors.includes(author.id)}
                          onCheckedChange={() => toggleAuthor(author.id)}
                        />
                        <div className="text-sm truncate text-ui-fg-subtle px-2 flex items-center">
                          {/* <div className="text-ui-fg-base mr-1.5">
                            {author.icon({ className: "size-4" })}
                          </div> */}
                          {author.name}
                        </div>
                      </div>
                    </Label>
                  ))}
                  {communityAuthorItem && (
                    <Label
                      key={communityAuthorItem.id}
                      className="border rounded-md cursor-pointer transition-colors bg-ui-bg-base"
                    >
                      <div className="flex items-center">
                        <Checkbox
                          className="size-8 cursor-pointer"
                          checked={selectedAuthors.some((authorId) =>
                            authors.some(
                              (author) =>
                                author.id === authorId && author.isCommunity,
                            ),
                          )}
                          onCheckedChange={(checked) => {
                            const communityAuthorIds = authors
                              .filter((author) => author.isCommunity)
                              .map((author) => author.id);

                            communityAuthorIds.forEach((authorId) => {
                              if (
                                checked &&
                                !selectedAuthors.includes(authorId)
                              ) {
                                toggleAuthor(authorId);
                              } else if (
                                !checked &&
                                selectedAuthors.includes(authorId)
                              ) {
                                toggleAuthor(authorId);
                              }
                            });
                          }}
                        />
                        <div className="text-sm truncate text-ui-fg-subtle px-2 flex items-center">
                          {/* <div className="text-ui-fg-base mr-1.5">
                            {communityAuthorItem.icon({
                              className: "size-4",
                            })}
                          </div> */}
                          ыва
                          {communityAuthorItem.name}
                        </div>
                      </div>
                    </Label>
                  )}
                </div>
              </div>
            </ScrollArea>
          </Collapsible.Content>
        </Collapsible.Root>

        {/* <Collapsible.Root
          defaultOpen
          open={isCommunityOpen}
          onOpenChange={setIsCommunityOpen}
          className="space-y-2"
        >
          <Collapsible.Trigger asChild>
            <Button variant="transparent" className="px-2 txt-compact-xsmall">
              <span>{t("communities")}</span>
              {isCommunityOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content className="space-y-2 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <div className="flex flex-col gap-2">
              {communityOptions.map((option) => (
                <Label
                  key={option.id}
                  className="border rounded-md cursor-pointer transition-colors bg-ui-bg-base"
                >
                  <div className="flex items-center">
                    <Checkbox
                      className="size-8 cursor-pointer"
                      checked={selectedCommunityOptions.includes(option.id)}
                      onCheckedChange={() => toggleCommunity(option.id)}
                    />
                    <div className="text-sm truncate text-ui-fg-subtle px-2 flex items-center">
                      <div className="text-ui-fg-base mr-1.5">
                        {option.icon({ className: "size-4" })}
                      </div>
                      {t(`community.${option.nameKey}`)}
                    </div>
                  </div>
                </Label>
              ))}
            </div>
          </Collapsible.Content>
        </Collapsible.Root> */}
      </div>
    </div>
  );
}
