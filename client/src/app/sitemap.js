import connect from '@/lib/mongodb';
import Post from '@/lib/models/gov/job';

export default async function sitemap() {
  const baseUrl = process.env.SITE_ORIGIN || 'https://jobsaddah.com';

  // Static routes
  const routes = [
    '',
    '/about',
    '/contact',
    '/fav-jobs',
    '/image-tool',
    '/pdf-tool',
    '/policy',
    '/private-jobs',
    '/quiz-and-earn',
    '/resume-maker',
    '/terms',
    '/typing-test',
    '/view-all',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  let posts = [];
  try {
    await connect();
    
    // Fetch posts. Limit to 10k to prevent timeouts/memory issues during build
    // In a real large scale app, generateSitemaps (plural) would be used.
    const allPosts = await Post.find({}, 'url updatedAt createdAt')
      .sort({ createdAt: -1 })
      .limit(10000)
      .lean();

    posts = allPosts.map((post) => {
      let cleanUrl = post.url || '';
      // Normalize the URL path stored in DB
      if (cleanUrl.startsWith('http')) {
        try {
           const u = new URL(cleanUrl);
           cleanUrl = u.pathname + u.search + u.hash;
        } catch(e) {
           // fallback
        }
      } else if (!cleanUrl.startsWith('/')) {
        cleanUrl = '/' + cleanUrl;
      }

      return {
        url: `${baseUrl}/post?url=${encodeURIComponent(cleanUrl)}`,
        lastModified: post.updatedAt || post.createdAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      };
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  return [...routes, ...posts];
}
