import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { baseUrl } from '../util/baseUrl.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchPosts() {
  try {
    const res = await fetch(`${baseUrl.replace(/\/api\/v1$/, '')}/posts`);
    if (!res.ok) {
      console.error('Failed to fetch posts:', res.status, res.statusText);
      return [];
    }
    const data = await res.json();
    // try common shapes
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.posts)) return data.posts;
    return [];
  } catch (err) {
    console.error('Error fetching posts for sitemap:', err.message);
    return [];
  }
}

function buildSitemap(urls) {
  const header = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  const footer = `</urlset>`;
  const body = urls
    .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq || 'daily'}</changefreq>\n    <priority>${u.priority || '0.5'}</priority>\n  </url>`) 
    .join('\n');
  return header + body + '\n' + footer;
}

async function main() {
  const domain = (baseUrl.includes('http') ? baseUrl.replace(/\/api\/v1$/, '') : 'https://yourdomain.com');
  const urls = [
    { loc: `${domain}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${domain}/govt-jobs`, changefreq: 'daily', priority: '0.9' },
    { loc: `${domain}/private-jobs`, changefreq: 'daily', priority: '0.9' }
  ];

  const posts = await fetchPosts();
  for (const p of posts) {
    const id = p._id || p.id;
    if (!id) continue;
    urls.push({ loc: `${domain}/post?_id=${id}`, changefreq: 'weekly', priority: '0.8' });
  }

  const sitemap = buildSitemap(urls);
  const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, sitemap, 'utf8');
  console.log('Sitemap written to', outPath);
}

main();
