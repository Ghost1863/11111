import fs from "node:fs";
import path from "node:path";
import {
  extractGitHubRepoPath,
  fetchGitHubStarsBatch,
} from "@/lib/github-utils";
import { loadPluginsBase } from "./content";

const REPO_STARS_TTL_MS = 3600 * 1000;
const REPO_STARS_CACHE_PATH = path.join(
  process.cwd(),
  ".next",
  "cache",
  "plugin-repo-stars.json",
);
const REPO_STARS_LOCK_PATH = path.join(
  process.cwd(),
  ".next",
  "cache",
  "plugin-repo-stars.lock",
);
const REPO_STARS_LOCK_TIMEOUT_MS = 30000;
const REPO_STARS_LOCK_POLL_MS = 250;

type RepoStarsCache = {
  data: Record<string, number>;
  expiresAt: number;
};

let repoStarsCache: RepoStarsCache | null = null;
let repoStarsPromise: Promise<Record<string, number>> | null = null;

async function readRepoStarsCacheFromDisk(): Promise<RepoStarsCache | null> {
  try {
    const raw = await fs.promises.readFile(REPO_STARS_CACHE_PATH, "utf8");
    const parsed = JSON.parse(raw) as RepoStarsCache | null;
    if (
      parsed?.data &&
      typeof parsed.expiresAt === "number" &&
      Date.now() < parsed.expiresAt
    ) {
      return parsed;
    }
  } catch {}
  return null;
}

async function writeRepoStarsCacheToDisk(cache: RepoStarsCache) {
  try {
    await fs.promises.mkdir(path.dirname(REPO_STARS_CACHE_PATH), {
      recursive: true,
    });
    await fs.promises.writeFile(
      REPO_STARS_CACHE_PATH,
      JSON.stringify(cache),
      "utf8",
    );
  } catch {}
}

async function waitForRepoStarsCache(): Promise<RepoStarsCache | null> {
  const start = Date.now();
  while (Date.now() - start < REPO_STARS_LOCK_TIMEOUT_MS) {
    const cached = await readRepoStarsCacheFromDisk();
    if (cached) return cached;
    await new Promise((resolve) =>
      setTimeout(resolve, REPO_STARS_LOCK_POLL_MS),
    );
  }
  return null;
}

export async function getAllRepoStars(): Promise<Record<string, number>> {
  if (repoStarsCache && Date.now() < repoStarsCache.expiresAt) {
    return repoStarsCache.data;
  }

  if (repoStarsPromise) {
    return repoStarsPromise;
  }

  repoStarsPromise = (async () => {
    let lockHandle: fs.promises.FileHandle | null = null;
    try {
      const cached = await readRepoStarsCacheFromDisk();
      if (cached) {
        repoStarsCache = cached;
        return cached.data;
      }

      try {
        lockHandle = await fs.promises.open(REPO_STARS_LOCK_PATH, "wx");
      } catch {
        const waited = await waitForRepoStarsCache();
        if (waited) {
          repoStarsCache = waited;
          return waited.data;
        }
      }

      const rawPlugins = await loadPluginsBase("en");
      const repoPaths = rawPlugins
        .map((plugin) =>
          plugin.repository ? extractGitHubRepoPath(plugin.repository) : null,
        )
        .filter((repoPath): repoPath is string => Boolean(repoPath));
      const starsMap = await fetchGitHubStarsBatch(repoPaths);
      const starsRecord: Record<string, number> = {};
      for (const [key, value] of starsMap.entries()) {
        starsRecord[key] = value;
      }
      const cache = {
        data: starsRecord,
        expiresAt: Date.now() + REPO_STARS_TTL_MS,
      };
      repoStarsCache = cache;
      await writeRepoStarsCacheToDisk(cache);
      return starsRecord;
    } catch {
      return {};
    } finally {
      repoStarsPromise = null;
      if (lockHandle) {
        await lockHandle.close();
        await fs.promises.unlink(REPO_STARS_LOCK_PATH).catch(() => {});
      }
    }
  })();

  return repoStarsPromise;
}
