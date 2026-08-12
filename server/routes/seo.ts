import { Router, Request, Response } from 'express';
import { SAMPLE_MOVIES } from '../../src/data/movies.js';

const router = Router();

/**
 * GET /sitemap.xml - Dynamic XML Sitemap for Google Search Indexing
 */
router.get('/sitemap.xml', (req: Request, res: Response) => {
  const baseUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
  const currentDate = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '?tab=movies', priority: '0.9', changefreq: 'daily' },
    { url: '?tab=series', priority: '0.9', changefreq: 'daily' },
    { url: '?tab=anime', priority: '0.9', changefreq: 'daily' },
    { url: '?tab=games', priority: '0.7', changefreq: 'weekly' },
  ];

  const movieUrls = SAMPLE_MOVIES.map((movie) => ({
    url: `?movie=${movie.id}`,
    priority: movie.featured ? '0.9' : '0.8',
    changefreq: 'weekly',
    title: `${movie.titleMongolian} (${movie.title})`,
    image: movie.poster,
  }));

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // Add static pages
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/${page.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Add dynamic movie pages with image extension
  for (const movie of movieUrls) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/${movie.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${movie.changefreq}</changefreq>\n`;
    xml += `    <priority>${movie.priority}</priority>\n`;
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${movie.image}</image:loc>\n`;
    xml += `      <image:title>${escapeXml(movie.title)}</image:title>\n`;
    xml += `    </image:image>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

/**
 * GET /robots.txt - Search Engine Crawler Guidance
 */
router.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
  const content = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(content);
});

/**
 * GET /api/seo/meta - API for checking active metadata
 */
router.get('/api/seo/meta', (req: Request, res: Response) => {
  res.json({
    siteName: 'IOIO TV',
    defaultTitle: 'IOIO TV - Монгол хадмал, дуу оруулгатай онлайн кино театр',
    sitemapUrl: `${req.protocol}://${req.get('host')}/sitemap.xml`,
    robotsUrl: `${req.protocol}://${req.get('host')}/robots.txt`,
    indexedCount: SAMPLE_MOVIES.length + 5,
    schemaTypes: ['WebSite', 'Movie', 'TVSeries', 'BreadcrumbList'],
  });
});

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export default router;
