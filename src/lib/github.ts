export interface CommitSummary {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

/**
 * Vytiahne commity z GitHubu pre dané repo ("owner/repo") za posledných `days` dní.
 * Vyžaduje GITHUB_TOKEN v env (Personal Access Token, repo read scope).
 */
export async function fetchRecentCommits(repo: string, days = 7): Promise<CommitSummary[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN nie je nastavené');

  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const res = await fetch(
    `https://api.github.com/repos/${repo}/commits?since=${since}&per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as Array<{
    sha: string;
    html_url: string;
    commit: { message: string; author: { name?: string; date?: string } | null };
  }>;

  return data.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split('\n')[0],
    author: c.commit.author?.name ?? 'unknown',
    date: c.commit.author?.date ?? '',
    url: c.html_url,
  }));
}
