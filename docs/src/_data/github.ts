// Build-time GitHub data. The site is static, so the star count is read once while the pages
// build; when the request fails or is rate limited, the count is null and the pages show a plain
// GitHub link instead. Set GITHUB_TOKEN in the build environment to raise the rate limit.

const starRequests = new Map<string, Promise<number | null>>();

async function fetchStarCount(repository: string): Promise<number | null> {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'user-agent': 'peacock-docs-build',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`https://api.github.com/repos/${repository}`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.warn(`[github] Star count for ${repository} unavailable (HTTP ${response.status}).`);
      return null;
    }
    const data = (await response.json()) as { stargazers_count?: unknown };
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
  } catch {
    console.warn(`[github] Star count for ${repository} unavailable (request failed).`);
    return null;
  }
}

/** The repository's star count, fetched once per build, or null when GitHub did not answer. */
export function getStarCount(repository: string): Promise<number | null> {
  let request = starRequests.get(repository);
  if (!request) {
    request = fetchStarCount(repository);
    starRequests.set(repository, request);
  }
  return request;
}

/** A short count for a label: 64, 1.2K, 12K. */
export function formatStarCount(count: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(count);
}
