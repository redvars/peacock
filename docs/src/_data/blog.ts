// Build-time data for the blog. Each post in pages/blog/posts/ exports its
// metadata from the frontmatter; this module collects them, newest first.

export interface BlogPostMeta {
  title: string;
  description: string;
  /** ISO date, YYYY-MM-DD. */
  publishedDate: string;
  author?: string;
  tags?: string[];
}

export interface BlogPost extends BlogPostMeta {
  href: string;
}

interface PostModule extends BlogPostMeta {
  url?: string;
}

const modules = import.meta.glob<PostModule>('../pages/blog/posts/*.astro', { eager: true });

export function getPosts(): BlogPost[] {
  return Object.values(modules)
    .filter((post): post is PostModule & { url: string } => typeof post.url === 'string')
    .map(post => ({
      title: post.title,
      description: post.description,
      publishedDate: post.publishedDate,
      author: post.author,
      tags: post.tags,
      href: post.url.endsWith('/') ? post.url : `${post.url}/`,
    }))
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
}

export function formatPostDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
