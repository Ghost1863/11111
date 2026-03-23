"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { MainNavigationMenu } from "@/components/layout/MainNavigationMenu";
import LocaleSwitcher from "@/components/locale-switcher";
import { ModeToggle } from "@/components/mode-toggle";
import { useRefContext } from "@/components/ref-provider";
import useGorgoDocsLink from "@/hooks/useGorgoHomeLink";
import Gorgo from "@/svg/icons/gorgo.svg";
import { Button } from "../ui/button";

export default function Header() {
  const t = useTranslations("Header");
  const headerRef = useRef<HTMLElement>(null);
  const { headerLogoRef, afterHeroSectionRef } = useRefContext();
  const pathname = usePathname();
  const locale = useLocale();
  const gorgoDocsLink = useGorgoDocsLink();

  const isHome = useCallback(() => {
    return pathname === `/${locale}` || pathname === `/`;
  }, [pathname, locale]);

  const [withBorder, setWithBorder] = useState(!isHome());

  useEffect(() => {
    if (!isHome()) {
      setWithBorder(true);
      return;
    }
    if (!afterHeroSectionRef.current || !headerRef.current) return;

    const onScroll = () => {
      const afterHeroSectionRect =
        afterHeroSectionRef.current!.getBoundingClientRect();
      const headerRect = headerRef.current!.getBoundingClientRect();
      if (window.innerWidth < 1024) {
        // because afterHeroSection border-top is absent on mobile
        setWithBorder(afterHeroSectionRect.bottom < headerRect.height + 1);
      } else {
        setWithBorder(afterHeroSectionRect.top < headerRect.height + 1);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname, locale, afterHeroSectionRef, isHome]);

  return (
    <header
      ref={headerRef}
      className={`w-full gap-0 px-0 py-0 bg-ui-bg-component backdrop-blur supports-[backdrop-filter]:bg-ui-bg-component/60 sticky top-0 z-40  ${withBorder ? "border-b border-ui-border-base" : ""}`}
    >
      <div className="h-14 flex items-center justify-between container mx-auto px-6">
        <div className="flex-1">
          <Link
            href="/"
            ref={headerLogoRef}
            className={`flex items-center gap-2 select-none size-fit text-dark dark:text-white ${!isHome() ? "opacity-100" : ""}`}
          >
            <Gorgo className={`size-4`} />
          </Link>
        </div>
        <div className="hidden sm:block justify-center items-center flex-1 ">
          <MainNavigationMenu />
        </div>
        <div className="flex justify-end items-center flex-1">
          <Button variant="secondary" className="mr-2" asChild>
            <Link href={gorgoDocsLink}> {t("docsButton")}</Link>
          </Button>
          <LocaleSwitcher />
          <div className="hidden sm:block">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
