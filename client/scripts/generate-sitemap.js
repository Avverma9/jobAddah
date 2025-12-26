import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

let apiBaseUrl = 'https://jobsaddah.onrender.com/api/v1'; // Default API
try {
  const mod = await import('../src/util/baseUrl.js');
  if (mod && mod.baseUrl) apiBaseUrl = mod.baseUrl;
} catch (e) {
  console.warn('Could not import baseUrl.js, using default:', apiBaseUrl);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITE_URL = 'https://jobsaddah.com';

async function fetchPosts() {
  try {
    // Construct the endpoint to fetch all posts (adjust limit if necessary)
    const url = `${apiBaseUrl.replace(/\/api\/v1\/?$/, '')}/api/v1/posts`; 
    // Or just use apiBaseUrl if it already includes /api/v1
    const finalUrl = apiBaseUrl.endsWith('/posts') ? apiBaseUrl : `${apiBaseUrl}/posts`;
    
    console.log(`Fetching posts from: ${finalUrl}`);
    const res = await axios.get(finalUrl);
    const data = res.data;

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
  const header = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  const footer = `</urlset>`;
  const body = urls
    .map((u) => `
  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq || 'daily'}</changefreq>
    <priority>${u.priority || '0.5'}</priority>
  </url>`) 
    .join('');
  return header + body + '\n' + footer;
}

async function main() {
  const urls = [
    // Core Pages
    { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_URL}/latest-jobs`, changefreq: 'hourly', priority: '0.9' },
    { loc: `${SITE_URL}/result`, changefreq: 'hourly', priority: '0.9' },
    { loc: `${SITE_URL}/admit-card`, changefreq: 'hourly', priority: '0.9' },
    { loc: `${SITE_URL}/view-all`, changefreq: 'daily', priority: '0.8' },
    { loc: `${SITE_URL}/private-jobs`, changefreq: 'daily', priority: '0.8' },
    
    // Info Pages
    { loc: `${SITE_URL}/about-us`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${SITE_URL}/contact-us`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${SITE_URL}/privacy-policy`, changefreq: 'yearly', priority: '0.3' },
    { loc: `${SITE_URL}/terms`, changefreq: 'yearly', priority: '0.3' },

    // Tools
    { loc: `${SITE_URL}/jobsaddah-image-tools`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_URL}/jobsaddah-typing-tools`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_URL}/jobsaddah-pdf-tools`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_URL}/jobsaddah-resume-tools`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_URL}/jobsaddah-quiz-tools`, changefreq: 'monthly', priority: '0.6' },
  ];

  const posts = await fetchPosts();
  console.log(`Found ${posts.length} posts.`);

  for (const p of posts) {
    // Prefer SEO-friendly 'url' slug if available, otherwise fall back to _id
    // URL param format expected by PostDetails: /post?url=... or /post?id=...
    let queryParam = '';
    if (p.url) {
      // Ensure the url is properly encoded if it contains special chars (though it should be a slug)
      queryParam = `url=${encodeURIComponent(p.url)}`;
    } else if (p._id || p.id) {
      queryParam = `id=${p._id || p.id}`;
    }

    if (!queryParam) continue;

    urls.push({ 
      loc: `${SITE_URL}/post?${queryParam}`, 
      changefreq: 'weekly', 
      priority: '0.8' 
    });
  }

  const sitemap = buildSitemap(urls);
  const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, sitemap, 'utf8');
  console.log('✅ Sitemap written to', outPath);
}

main();
