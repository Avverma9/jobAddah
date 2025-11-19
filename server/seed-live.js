const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const ExamPost = require('./models/jobs'); // Path check kar lena
require('dotenv').config();

const TARGET_URL = 'https://www.sarkariexam.com/';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// Helper: Text Clean karne ke liye
const cleanText = (text) => text ? text.replace(/\s+/g, ' ').trim() : '';

// Helper: Category Detect karne ke liye (Strong Matching)
const detectCategory = (headerText) => {
  const text = headerText.toLowerCase();
  if (text.includes('answer key')) return 'Answer Key';
  if (text.includes('syllabus')) return 'Syllabus';
  if (text.includes('admission')) return 'Admission';
  if (text.includes('admit card')) return 'Admit Card';
  if (text.includes('result')) return 'Result';
  if (text.includes('online form') || text.includes('latest job')) return 'Latest Jobs';
  return null;
};

const scrapeAndSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB...");

    console.log(`⏳ Fetching data from ${TARGET_URL}...`);
    const { data } = await axios.get(TARGET_URL, { headers: HEADERS });
    const $ = cheerio.load(data);
    
    let scrapedPosts = [];
    let seenUrls = new Set(); // URL se duplication check karenge (Title se behtar hai)

    // --- STRATEGY: Header Hunting ---
    // Hum specific classes nahi dhundenge, hum HEADERS (h1, h2, div) dhundenge
    // jisme category ka naam likha ho (Jaise screenshot mein "Answer Keys" likha hai)
    
    $('h1, h2, h3, h4, .heading, div').each((i, element) => {
      const headerText = cleanText($(element).text());
      const category = detectCategory(headerText);

      // Agar ye element ek Category Header hai (e.g., "Answer Keys")
      if (category && headerText.length < 30) { // Length check taaki pura paragraph select na ho
        
        console.log(`🔎 Found Section: "${headerText}" -> Detected as: ${category}`);

        // Us header ke PARENT container ko pakdo, taaki uske andar ke saare links mil jayein
        // Usually structure hota hai: <div> <h2>Header</h2> <ul><li>Link</li></ul> </div>
        
        const container = $(element).parent(); 
        
        // Ab us container ke andar saare links ('a' tags) dhundo
        container.find('a').each((j, link) => {
          const title = cleanText($(link).text());
          let url = $(link).attr('href');

          // Garbage Filters
          if (!title || !url) return;
          if (title.toLowerCase().includes('view all')) return; // "View All" button ko skip karo
          if (url.includes('javascript') || url === '#') return;

          // URL Normalize
          if (url.startsWith('/')) url = new URL(url, TARGET_URL).toString();
          if (url.startsWith('//')) url = 'https:' + url;

          // Duplicate URL Check (Script ke dauran)
          if (seenUrls.has(url)) return;
          seenUrls.add(url);

          scrapedPosts.push({
            postName: title,
            category: category, // Header se mila hua category assign karo
            shortInfo: `New update for ${category}: ${title}`,
            updateDate: new Date(),
            importantLinks: [{ label: "Check Details", url: url, isNew: true }]
          });
        });
      }
    });

    // --- FALLBACK: Agar Header method fail ho jaye toh purana selector method ---
    if (scrapedPosts.length < 10) {
        console.log("⚠️ Header hunting yielded low results. Running fallback scan...");
        $('ul li a, .post-box a').each((i, el) => {
            const title = cleanText($(el).text());
            let url = $(el).attr('href');
            if(title && url && !seenUrls.has(url) && !title.includes('View All')) {
                 // Try to guess category from title
                 let cat = detectCategory(title) || 'Latest Jobs';
                 seenUrls.add(url);
                 scrapedPosts.push({
                    postName: title,
                    category: cat,
                    shortInfo: `Update: ${title}`,
                    updateDate: new Date(),
                    importantLinks: [{ label: "Details", url: url, isNew: true }]
                 });
            }
        });
    }

    console.log(`📊 Total Scraped Items found: ${scrapedPosts.length}`);

    // 5. DATABASE DUPLICATE CHECK (Advanced)
    // Title aur URL dono se check karenge
    const bulkOps = [];
    
    // DB se saare existing URLs le aao
    const existingDocs = await ExamPost.find({}, { 'importantLinks.url': 1, postName: 1 });
    
    // Set banao fast lookup ke liye
    const existingUrls = new Set();
    const existingTitles = new Set();

    existingDocs.forEach(doc => {
        existingTitles.add(doc.postName);
        if(doc.importantLinks && doc.importantLinks.length > 0) {
            existingUrls.add(doc.importantLinks[0].url);
        }
    });

    let newCount = 0;
    let skippedCount = 0;

    for (const post of scrapedPosts) {
      const postUrl = post.importantLinks[0].url;

      // Logic: Agar URL exist karta hai -> SKIP
      // OR Agar Title exist karta hai -> SKIP
      if (existingUrls.has(postUrl) || existingTitles.has(post.postName)) {
        skippedCount++;
        continue;
      }

      bulkOps.push({ insertOne: { document: post } });
      newCount++;
    }

    if (bulkOps.length > 0) {
      await ExamPost.bulkWrite(bulkOps);
      console.log(`✅ Database Updated: Added ${newCount} new posts.`);
    } else {
      console.log("✅ Database is up to date. No new unique posts found.");
    }
    console.log(`⏭️ Skipped ${skippedCount} duplicates.`);

    mongoose.connection.close();

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (mongoose.connection.readyState === 1) mongoose.connection.close();
  }
};

scrapeAndSeed();