import { Geist_Mono, Inter } from "next/font/google";
import "../globals.css";
import { TooltipProvider } from "@medusajs/ui";
import { GoogleAnalytics } from "@next/third-parties/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Footer, Header } from "@/components/layout";
import MobileNav from "@/components/mobile-nav";
import { RefContextProvider } from "@/components/ref-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          geistMono.variable,
          "antialiased bg-ui-bg-subtle min-h-screen",
        )}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <RefContextProvider>
                <Header />
                {children}
              </RefContextProvider>
              <Footer />
              <MobileNav />
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
      <GoogleAnalytics
        gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""}
      />
    </html>
  );
}
