"use client";

import { Funnel } from "@medusajs/icons";
import type { ReactNode } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMedusaFilters } from "@/hooks/use-medusa-filters";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "./drawer";

type SidebarElementProps = {
  children: ReactNode;
  title?: string;
  triggerLabel?: string;
};

export default function SidebarElement({ children }: SidebarElementProps) {
  const { authors, category, community } = useMedusaFilters();

  const isDesktop = useMediaQuery("(min-width: 1024px)", {
    defaultValue: true,
    initializeWithValue: false,
  });

  if (isDesktop) {
    return <aside className="lg:col-span-1">{children}</aside>;
  }

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button className="shrink-0 p-1" variant="transparent" size="small">
          <Funnel
            className={cn(
              "block!",
              (authors?.length > 0 ||
                category !== "all" ||
                community?.length > 0) &&
                "text-ui-fg-interactive",
            )}
          />
        </Button>
      </DrawerTrigger>
      <DrawerTitle className="sr-only">Sidebar</DrawerTitle>
      <DrawerContent className="h-full max-h-none inset-y-0 right-0 w-80 max-w-md p-0 ">
        <div className="p-4 h-full flex flex-col">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
