import { githubClient } from "./github";
import { fetchJson } from "./http";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";
const GRAPHQL_BATCH_SIZE = 50;

export function extractGitHubRepoPath(githubUrl: string): string | null {
  const patterns = [
    /github\.com\/([^/]+\/[^/]+)/i,
    /github\.com\/([^/]+\/[^/]+)\.git/i,
    /github\.com\/([^/]+\/[^/]+)\/$/i,
  ];

  for (const pattern of patterns) {
    const match = githubUrl.match(pattern);
    if (match) {
      return match[1].replace(".git", "");
    }
  }

  return null;
}

type RepoOwnerName = {
  owner: string;
  name: string;
};

function splitRepoPath(repoPath: string): RepoOwnerName | null {
  const [owner, name] = repoPath.split("/");
  if (!owner || !name) return null;
  return { owner, name };
}

function logRateLimitInfo(headers: Record<string, string | undefined>) {
  const RATE_LIMIT_HEADERS = [
    "x-ratelimit-limit",
    "x-ratelimit-remaining",
    "x-ratelimit-reset",
    "x-ratelimit-resource",
    "x-ratelimit-used",
  ] as const;

  const rateLimitInfo = Object.fromEntries(
    RATE_LIMIT_HEADERS.map((key) => [key, headers?.[key]]).filter(
      ([, value]) => value !== undefined,
    ),
  );
  console.info("GitHub rate limit:", rateLimitInfo);
}

async function fetchGraphqlStarsBatch(
  repos: RepoOwnerName[],
  revalidateSeconds: number,
): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  if (repos.length === 0) return results;

  const queries = repos.map(({ owner, name }, index) => {
    const alias = `r${index}`;
    return `${alias}: repository(owner: "${owner}", name: "${name}") { stargazerCount }`;
  });
  console.info("Fetching stats for", queries.length, "GitHub repositories");
  const query = `query { ${queries.join(" ")} }`;

  try {
    if (githubClient) {
      const response = await githubClient.request("POST /graphql", { query });
      logRateLimitInfo(response.headers as Record<string, string | undefined>);
      const payload = response.data as {
        data?: Record<string, { stargazerCount?: number } | null>;
      };
      const data =
        payload?.data ??
        (response.data as Record<string, { stargazerCount?: number } | null>);
      repos.forEach(({ owner, name }, index) => {
        const key = `${owner}/${name}`;
        const repo = data?.[`r${index}`];
        results.set(key, repo?.stargazerCount || 0);
      });
      return results;
    }

    const token =
      process.env.STATS_GITHUB_TOKEN ||
      process.env.GITHUB_TOKEN ||
      process.env.NEXT_PUBLIC_GITHUB_TOKEN;

    if (!token) return results;

    const payload = await fetchJson<{
      data?: Record<string, { stargazerCount?: number } | null>;
    }>(GITHUB_GRAPHQL_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "gorgo-site",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      next: { revalidate: revalidateSeconds },
    });
    const data =
      payload?.data ??
      (payload as unknown as Record<
        string,
        { stargazerCount?: number } | null
      >);

    repos.forEach(({ owner, name }, index) => {
      const key = `${owner}/${name}`;
      const repo = data?.[`r${index}`];
      results.set(key, repo?.stargazerCount || 0);
    });
  } catch {
    return results;
  }

  return results;
}

export async function fetchGitHubStarsBatch(
  repoPaths: string[],
  revalidateSeconds: number = 3600 * 24,
): Promise<Map<string, number>> {
  const uniquePaths = Array.from(new Set(repoPaths));
  const repoEntries = uniquePaths
    .map((repoPath) => splitRepoPath(repoPath))
    .filter((repo): repo is RepoOwnerName => Boolean(repo));

  const results = new Map<string, number>();

  for (let i = 0; i < repoEntries.length; i += GRAPHQL_BATCH_SIZE) {
    const batch = repoEntries.slice(i, i + GRAPHQL_BATCH_SIZE);
    const batchResults = await fetchGraphqlStarsBatch(batch, revalidateSeconds);
    for (const [key, value] of batchResults.entries()) {
      results.set(key, value);
    }
  }

  return results;
}

export async function fetchGitHubStars(
  githubUrl?: string,
  timeoutMs: number = 8000,
  revalidateSeconds: number = 3600 * 24,
): Promise<number> {
  if (!githubUrl) return 0;

  const repoPath = extractGitHubRepoPath(githubUrl);
  if (!repoPath) return 0;

  try {
    if (githubClient) {
      const { data } = await githubClient.request(`GET /repos/${repoPath}`);
      return data.stargazers_count || 0;
    }

    const data = await fetchJson<{ stargazers_count?: number }>(
      `${GITHUB_API_BASE}/repos/${repoPath}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "gorgo-site",
        },
        timeoutMs,
        next: { revalidate: revalidateSeconds },
      },
    );

    return data.stargazers_count || 0;
  } catch {
    return 0;
  }
}
