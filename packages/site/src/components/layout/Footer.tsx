"use client";

import { SiGithub, SiTelegram } from "@icons-pack/react-simple-icons";
import { useTranslations } from "next-intl";
import Section from "@/components/section";
import useGorgoDocsLink from "@/hooks/useGorgoHomeLink";
import { Link } from "@/i18n/navigation";
import GorgoWordmark from "@/svg/icons/gorgo-wordmark.svg";
import ContactSection from "./ContactSection";

export default function Footer() {
  const tNav = useTranslations("Navigation");
  const tFooter = useTranslations("Footer");
  const tLinks = useTranslations("Links");
  const gorgoDocsLink = useGorgoDocsLink();

  return (
    <footer id="contact-us">
      <ContactSection />
      <Section className="grid grid-cols-1 lg:grid-cols-2 sm:border-x-0">
        <div className="space-y-2 h-full flex flex-col items-start justify-start px-6 py-12 lg:pl-24 lg:py-16 border-b lg:border-r lg:border-b-0 text-ui-fg-base">
          <GorgoWordmark className="h-6" />
          <div className="space-y-2 pt-4 text-sm">
            <p className="text-ui-fg-subtle">{tFooter("about1")}</p>
            <p className="text-ui-fg-subtle">{tFooter("about2")}</p>
          </div>
        </div>
        <div className="space-y-2 p-6 lg:pl-24 lg:py-16 flex gap-16 text-sm">
          <ul className="text-ui-fg-subtle space-y-4 ">
            <li className="text-ui-fg-base font-medium">
              {tFooter("menuResourses")}
            </li>
            <li>
              <Link
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="/medusa/plugins"
              >
                {tNav("medusa-plugins")}
              </Link>
            </li>
            <li>
              <Link
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="/#community"
              >
                {tNav("community")}
              </Link>
            </li>
            <li>
              <Link
                target="_blank"
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href={tLinks("items.medusaChat.url")}
              >
                {tLinks("items.medusaChat.menuTitle")}
              </Link>
            </li>
            <li>
              <Link
                target="_blank"
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href={tLinks("items.medusaNews.url")}
              >
                {tLinks("items.medusaNews.menuTitle")}
              </Link>
            </li>
            <li>
              <Link
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href={gorgoDocsLink}
              >
                {tNav("docs")}
              </Link>
            </li>
            {/* <li>
              <Link
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="/faqtips"
              >
                {navT('faq')}
              </Link>
            </li>
            <li>
              <Link
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="/plugins"
              >
                Cloud
              </Link>
            </li> */}
          </ul>
          <ul className="text-ui-fg-subtle space-y-4">
            <li className="text-ui-fg-base font-medium">
              {tFooter("menuGorgo")}
            </li>
            <li>
              <Link
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="mailto:head@gorgojs.com"
              >
                head@gorgojs.com
              </Link>
            </li>
            <li className="flex gap-3 h-6 [&_svg]:size-5">
              <Link
                target="_blank"
                rel="noreferrer"
                href="https://t.me/gorgojs_bot"
              >
                <SiTelegram className="rounded-full" />
              </Link>
              <Link
                target="_blank"
                rel="noreferrer"
                href="https://github.com/gorgojs/medusa-plugins"
              >
                <SiGithub className="rounded-full" />
              </Link>
            </li>
          </ul>
        </div>
      </Section>
    </footer>
  );
}
