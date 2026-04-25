import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';
import { getPublishedPosts } from '@/server/services/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    {
      url: `${SITE.url}/vendas-sem-segredos`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    { url: `${SITE.url}/advisory`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE.url}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    {
      url: `${SITE.url}/diagnostico`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    { url: `${SITE.url}/privacidade`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE.url}/termos`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const posts = await getPublishedPosts().catch(() => []);
  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE.url}/blog/${p.slug}`,
    lastModified: p.updated_at || p.published_at || now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...postPages];
}
