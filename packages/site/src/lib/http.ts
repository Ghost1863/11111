export type FetchJsonOptions = RequestInit & {
  timeoutMs?: number;
  next?: { revalidate?: number };
};

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const { timeoutMs = 10000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchInBatches<T, R>(
  items: T[],
  batchSize: number,
  handler: (item: T) => Promise<R>,
  delayMs: number = 100,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((item) => handler(item)));
    results.push(...batchResults);

    if (delayMs > 0 && i + batchSize < items.length) {
      await sleep(delayMs);
    }
  }

  return results;
}
