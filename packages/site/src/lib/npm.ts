import { fetchJson } from "./http";

export interface NpmDownloadStats {
  downloads: number;
  period: string;
}

function encodePackageName(packageName: string): string {
  const trimmed = packageName.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("@")) {
    const [scope, ...rest] = trimmed.split("/");
    if (!scope || rest.length === 0) {
      return encodeURIComponent(trimmed);
    }
    return `${encodeURIComponent(scope)}/${rest
      .map((part) => encodeURIComponent(part))
      .join("/")}`;
  }

  return encodeURIComponent(trimmed);
}

export async function fetchNpmDownloads(
  packageName: string,
  period: string = "last-month",
  timeoutMs: number = 10000,
  revalidateSeconds: number = 3600 * 24,
): Promise<NpmDownloadStats> {
  if (!packageName) {
    return { downloads: 0, period };
  }

  try {
    const encodedName = encodePackageName(packageName);
    const data = await fetchJson<{ downloads?: number }>(
      `https://api.npmjs.org/downloads/point/${period}/${encodedName}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "gorgo-site",
        },
        timeoutMs,
        next: { revalidate: revalidateSeconds },
      },
    );

    if (typeof data.downloads !== "number") {
      console.warn("npm downloads missing", {
        packageName,
        period,
        encodedName,
      });
    }

    return {
      downloads: data.downloads || 0,
      period,
    };
  } catch {
    // console.warn("npm downloads request failed", {
    //   packageName,
    //   period,
    //   error: error instanceof Error ? error.message : String(error),
    // });
    return {
      downloads: 0,
      period,
    };
  }
}

export async function fetchNpmLatestVersion(
  packageName?: string,
  timeoutMs: number = 10000,
  revalidateSeconds: number = 3600 * 24,
): Promise<string | undefined> {
  if (!packageName) return undefined;

  try {
    const encodedName = encodePackageName(packageName);
    const data = await fetchJson<{ "dist-tags"?: { latest?: string } }>(
      `https://registry.npmjs.org/${encodedName}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "gorgo-site",
        },
        timeoutMs,
        next: { revalidate: revalidateSeconds },
      },
    );

    if (!data["dist-tags"]?.latest) {
      console.warn("npm latest version missing", {
        packageName,
        encodedName,
      });
    }

    return data["dist-tags"]?.latest;
  } catch (error) {
    console.warn("npm latest version request failed", {
      packageName,
      error: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
}
