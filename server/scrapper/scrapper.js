
const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

const cleanText = (text) => {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
};

const ensureProtocol = (inputUrl) => {
  if (!inputUrl) return null;
  let clean = inputUrl.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  return clean;
};

// ========== SMART API: Raw Extract → Intelligent Formatting ==========


const scrapper =async (req, res) => {
  try {
    const jobUrl = req.body.url;
    if (!jobUrl) return res.status(400).json({ error: "URL is required" });

    const response = await axios.get(jobUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 20000
    });

    const $ = cheerio.load(response.data);
    
    const scrapedData = {
      url: jobUrl,
      title: $('title').text().trim(),
      meta: {
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content') || '',
        author: $('meta[name="author"]').attr('content') || ''
      },
      headings: {
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: []
      },
      links: [],
      images: [],
      tables: [],
      lists: {
        ul: [],
        ol: []
      },
      paragraphs: [],
      sections: [],
      divs: [],
      forms: [],
      buttons: [],
      allText: []
    };

    // ========== Extract ALL Headings ==========
    $('h1').each((i, el) => {
      scrapedData.headings.h1.push({
        text: cleanText($(el).text()),
        html: $(el).html(),
        index: i
      });
    });

    $('h2').each((i, el) => {
      scrapedData.headings.h2.push({
        text: cleanText($(el).text()),
        html: $(el).html(),
        index: i
      });
    });

    $('h3').each((i, el) => {
      scrapedData.headings.h3.push({
        text: cleanText($(el).text()),
        html: $(el).html(),
        index: i
      });
    });

    $('h4').each((i, el) => {
      scrapedData.headings.h4.push({
        text: cleanText($(el).text()),
        html: $(el).html(),
        index: i
      });
    });

    $('h5').each((i, el) => {
      scrapedData.headings.h5.push({
        text: cleanText($(el).text()),
        html: $(el).html(),
        index: i
      });
    });

    $('h6').each((i, el) => {
      scrapedData.headings.h6.push({
        text: cleanText($(el).text()),
        html: $(el).html(),
        index: i
      });
    });

    // ========== Extract ALL Links ==========
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = cleanText($(el).text());
      
      if (href) {
        try {
          const fullUrl = new url.URL(href, jobUrl).href;
          scrapedData.links.push({
            text: text,
            href: href,
            fullUrl: fullUrl,
            title: $(el).attr('title') || '',
            target: $(el).attr('target') || '',
            class: $(el).attr('class') || '',
            id: $(el).attr('id') || '',
            parent: $(el).parent().prop('tagName'),
            index: i
          });
        } catch (err) {
          scrapedData.links.push({
            text: text,
            href: href,
            fullUrl: href,
            error: 'Invalid URL',
            index: i
          });
        }
      }
    });

    // ========== Extract ALL Images ==========
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        try {
          const fullUrl = new url.URL(src, jobUrl).href;
          scrapedData.images.push({
            src: src,
            fullUrl: fullUrl,
            alt: $(el).attr('alt') || '',
            title: $(el).attr('title') || '',
            width: $(el).attr('width') || '',
            height: $(el).attr('height') || '',
            class: $(el).attr('class') || '',
            index: i
          });
        } catch (err) {
          scrapedData.images.push({
            src: src,
            alt: $(el).attr('alt') || '',
            error: 'Invalid URL',
            index: i
          });
        }
      }
    });

    // ========== Extract ALL Tables (Complete Structure) ==========
    $('table').each((tableIndex, table) => {
      const tableData = {
        index: tableIndex,
        class: $(table).attr('class') || '',
        id: $(table).attr('id') || '',
        rows: [],
        rawHTML: $(table).html()
      };

      $(table).find('tr').each((rowIndex, row) => {
        const rowData = {
          index: rowIndex,
          cells: []
        };

        $(row).find('td, th').each((cellIndex, cell) => {
          const $cell = $(cell);
          const cellData = {
            index: cellIndex,
            tag: cell.tagName.toLowerCase(),
            text: cleanText($cell.text()),
            html: $cell.html(),
            colspan: $cell.attr('colspan') || '1',
            rowspan: $cell.attr('rowspan') || '1',
            class: $cell.attr('class') || '',
            style: $cell.attr('style') || ''
          };

          // Extract links inside cell
          const cellLinks = [];
          $cell.find('a').each((linkIndex, link) => {
            const href = $(link).attr('href');
            if (href) {
              try {
                cellLinks.push({
                  text: cleanText($(link).text()),
                  href: href,
                  fullUrl: new url.URL(href, jobUrl).href
                });
              } catch (err) {
                cellLinks.push({ text: cleanText($(link).text()), href: href });
              }
            }
          });
          if (cellLinks.length > 0) cellData.links = cellLinks;

          // Extract lists inside cell
          const cellLists = [];
          $cell.find('ul, ol').each((listIndex, list) => {
            const listItems = [];
            $(list).find('li').each((liIndex, li) => {
              listItems.push(cleanText($(li).text()));
            });
            cellLists.push({
              type: list.tagName.toLowerCase(),
              items: listItems
            });
          });
          if (cellLists.length > 0) cellData.lists = cellLists;

          rowData.cells.push(cellData);
        });

        tableData.rows.push(rowData);
      });

      scrapedData.tables.push(tableData);
    });

    // ========== Extract ALL Unordered Lists ==========
    $('ul').each((ulIndex, ul) => {
      const listData = {
        index: ulIndex,
        class: $(ul).attr('class') || '',
        id: $(ul).attr('id') || '',
        items: []
      };

      $(ul).children('li').each((liIndex, li) => {
        const $li = $(li);
        const itemData = {
          index: liIndex,
          text: cleanText($li.text()),
          html: $li.html()
        };

        // Check if li contains links
        const liLinks = [];
        $li.find('a').each((linkIndex, link) => {
          const href = $(link).attr('href');
          if (href) {
            try {
              liLinks.push({
                text: cleanText($(link).text()),
                href: href,
                fullUrl: new url.URL(href, jobUrl).href
              });
            } catch (err) {
              liLinks.push({ text: cleanText($(link).text()), href: href });
            }
          }
        });
        if (liLinks.length > 0) itemData.links = liLinks;

        listData.items.push(itemData);
      });

      scrapedData.lists.ul.push(listData);
    });

    // ========== Extract ALL Ordered Lists ==========
    $('ol').each((olIndex, ol) => {
      const listData = {
        index: olIndex,
        class: $(ol).attr('class') || '',
        id: $(ol).attr('id') || '',
        items: []
      };

      $(ol).children('li').each((liIndex, li) => {
        const $li = $(li);
        const itemData = {
          index: liIndex,
          text: cleanText($li.text()),
          html: $li.html()
        };

        const liLinks = [];
        $li.find('a').each((linkIndex, link) => {
          const href = $(link).attr('href');
          if (href) {
            try {
              liLinks.push({
                text: cleanText($(link).text()),
                href: href,
                fullUrl: new url.URL(href, jobUrl).href
              });
            } catch (err) {
              liLinks.push({ text: cleanText($(link).text()), href: href });
            }
          }
        });
        if (liLinks.length > 0) itemData.links = liLinks;

        listData.items.push(itemData);
      });

      scrapedData.lists.ol.push(listData);
    });

    // ========== Extract ALL Paragraphs ==========
    $('p').each((pIndex, p) => {
      const text = cleanText($(p).text());
      if (text && text.length > 0) {
        scrapedData.paragraphs.push({
          index: pIndex,
          text: text,
          html: $(p).html(),
          class: $(p).attr('class') || '',
          style: $(p).attr('style') || ''
        });
      }
    });

    // ========== Extract ALL Sections ==========
    $('section').each((sectionIndex, section) => {
      scrapedData.sections.push({
        index: sectionIndex,
        id: $(section).attr('id') || '',
        class: $(section).attr('class') || '',
        text: cleanText($(section).text()),
        html: $(section).html()
      });
    });

    // ========== Extract ALL Divs with Content ==========
    $('div').each((divIndex, div) => {
      const $div = $(div);
      const text = cleanText($div.text());
      
      // Only store divs with meaningful content (not just whitespace)
      if (text && text.length > 10 && text.length < 5000) {
        scrapedData.divs.push({
          index: divIndex,
          id: $div.attr('id') || '',
          class: $div.attr('class') || '',
          text: text,
          dataAttributes: Object.keys($div[0].attribs || {})
            .filter(key => key.startsWith('data-'))
            .reduce((obj, key) => {
              obj[key] = $div.attr(key);
              return obj;
            }, {})
        });
      }
    });

    // ========== Extract ALL Forms ==========
    $('form').each((formIndex, form) => {
      const $form = $(form);
      const formData = {
        index: formIndex,
        action: $form.attr('action') || '',
        method: $form.attr('method') || '',
        id: $form.attr('id') || '',
        class: $form.attr('class') || '',
        inputs: []
      };

      $form.find('input, textarea, select').each((inputIndex, input) => {
        const $input = $(input);
        formData.inputs.push({
          type: $input.attr('type') || input.tagName.toLowerCase(),
          name: $input.attr('name') || '',
          id: $input.attr('id') || '',
          placeholder: $input.attr('placeholder') || '',
          value: $input.attr('value') || '',
          required: $input.attr('required') !== undefined
        });
      });

      scrapedData.forms.push(formData);
    });

    // ========== Extract ALL Buttons ==========
    $('button, input[type="button"], input[type="submit"]').each((btnIndex, btn) => {
      scrapedData.buttons.push({
        index: btnIndex,
        text: cleanText($(btn).text()) || $(btn).attr('value') || '',
        type: $(btn).attr('type') || '',
        class: $(btn).attr('class') || '',
        id: $(btn).attr('id') || ''
      });
    });

    // ========== Extract ALL Text Content (Sequential) ==========
    $('body *').each((i, el) => {
      const tagName = el.tagName?.toLowerCase();
      const text = $(el).clone().children().remove().end().text().trim();
      
      if (text && text.length > 0 && 
          ['p', 'span', 'div', 'li', 'td', 'th', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'i', 'em'].includes(tagName)) {
        scrapedData.allText.push({
          tag: tagName,
          text: cleanText(text),
          class: $(el).attr('class') || '',
          style: $(el).attr('style') || ''
        });
      }
    });

    res.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      data: scrapedData 
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
}

const getCategories = async (req, res) => {
  try {
    // const rawUrl = req.body.siteUrl;
    const rawUrl = "sarkariresult.com.cm";

    const targetUrl = ensureProtocol(rawUrl);

    if (!targetUrl) return res.status(400).json({ error: "Invalid URL" });

    const response = await axios.get(targetUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    let categories = [];
    const menuSelectors = 'nav a, .menu a, ul.navigation a, .nav-menu a, #primary-menu a, .header-menu a, .menubar a';

    $(menuSelectors).each((index, element) => {
      const name = cleanText($(element).text());
      let href = $(element).attr('href');

      if (!name || !href || href === '#' || href === '/') return;

      const fullLink = new url.URL(href, targetUrl).href;
      const ignoreList = ['Home', 'Contact Us', 'Privacy Policy', 'Disclaimer', 'More', 'About Us', 'Sitemap'];
      
      if (!ignoreList.includes(name)) {
        categories.push({
          name: name,
          link: fullLink
        });
      }
    });

    const uniqueCategories = [...new Map(categories.map(item => [item['link'], item])).values()];

    res.json({
      success: true,
      count: uniqueCategories.length,
      categories: uniqueCategories
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

const scrapeCategory =async (req, res) => {
  try {
    const categoryUrl = req.body.url;
    
    if (!categoryUrl) return res.status(400).json({ error: "Category URL is required" });

    const response = await axios.get(categoryUrl, {
        headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
        }
    });

    const $ = cheerio.load(response.data);
    const postSelectors = '.post-link, .entry-title a, .post h2 a, ul li a, table tr td a, .content a';
    
    let jobs = [];

    $(postSelectors).each((index, element) => {
        const title = cleanText($(element).text());
        let link = $(element).attr('href');

        if (title && title.length > 10 && link) {
             const fullLink = new url.URL(link, categoryUrl).href;
             jobs.push({ title, link: fullLink });
        }
    });

    const uniqueJobs = [...new Map(jobs.map(item => [item['link'], item])).values()];

    res.json({ success: true, count: uniqueJobs.length, jobs: uniqueJobs });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { scrapper, getCategories, scrapeCategory };