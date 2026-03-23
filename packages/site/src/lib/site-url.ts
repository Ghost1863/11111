const DEFAULT_SITE_URL = "https://gorgojs.com";

export function getSiteHost(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  try {
    return new URL(siteUrl).host;
  } catch {
    return new URL(DEFAULT_SITE_URL).host;
  }
}
