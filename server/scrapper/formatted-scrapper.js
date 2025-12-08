app.post('/scrape-complete', async (req, res) => {
  try {
    const jobUrl = req.body.url;
    if (!jobUrl) return res.status(400).json({ error: "URL is required" });

    // =============================================
    // PHASE 1: COMPLETE RAW DATA EXTRACTION
    // =============================================
    console.log('📥 Phase 1: Extracting raw data...');
    
    const response = await axios.get(jobUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 20000
    });

    const $ = cheerio.load(response.data);
    
    const rawData = {
      url: jobUrl,
      scrapedAt: new Date().toISOString(),
      title: $('title').text().trim(),
      meta: {
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content') || '',
        author: $('meta[name="author"]').attr('content') || ''
      },
      headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
      links: [],
      images: [],
      tables: [],
      lists: { ul: [], ol: [] },
      paragraphs: [],
      sections: [],
      divs: []
    };

    // Extract ALL Headings
    ['h1','h2','h3','h4','h5','h6'].forEach(tag => {
      $(tag).each((i, el) => {
        rawData.headings[tag].push({
          text: cleanText($(el).text()),
          html: $(el).html(),
          index: i
        });
      });
    });

    // Extract ALL Links
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = cleanText($(el).text());
      
      if (href) {
        try {
          rawData.links.push({
            text: text,
            href: href,
            fullUrl: new url.URL(href, jobUrl).href,
            title: $(el).attr('title') || '',
            target: $(el).attr('target') || '',
            class: $(el).attr('class') || '',
            id: $(el).attr('id') || '',
            parent: $(el).parent().prop('tagName'),
            index: i
          });
        } catch (err) {
          rawData.links.push({
            text: text,
            href: href,
            fullUrl: href,
            error: 'Invalid URL',
            index: i
          });
        }
      }
    });

    // Extract ALL Images
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        try {
          rawData.images.push({
            src: src,
            fullUrl: new url.URL(src, jobUrl).href,
            alt: $(el).attr('alt') || '',
            title: $(el).attr('title') || '',
            width: $(el).attr('width') || '',
            height: $(el).attr('height') || '',
            class: $(el).attr('class') || '',
            index: i
          });
        } catch (err) {
          rawData.images.push({
            src: src,
            alt: $(el).attr('alt') || '',
            error: 'Invalid URL',
            index: i
          });
        }
      }
    });

    // Extract ALL Tables (Complete Structure)
    $('table').each((tableIndex, table) => {
      const tableData = {
        index: tableIndex,
        class: $(table).attr('class') || '',
        id: $(table).attr('id') || '',
        rows: [],
        rawHTML: $(table).html()
      };

      $(table).find('tr').each((rowIndex, row) => {
        const rowData = { index: rowIndex, cells: [] };

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

      rawData.tables.push(tableData);
    });

    // Extract ALL Lists
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

      rawData.lists.ul.push(listData);
    });

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

      rawData.lists.ol.push(listData);
    });

    // Extract ALL Paragraphs
    $('p').each((pIndex, p) => {
      const text = cleanText($(p).text());
      if (text && text.length > 0) {
        rawData.paragraphs.push({
          index: pIndex,
          text: text,
          html: $(p).html(),
          class: $(p).attr('class') || '',
          style: $(p).attr('style') || ''
        });
      }
    });

    // Extract Sections
    $('section').each((sectionIndex, section) => {
      rawData.sections.push({
        index: sectionIndex,
        id: $(section).attr('id') || '',
        class: $(section).attr('class') || '',
        text: cleanText($(section).text()),
        html: $(section).html()
      });
    });

    // Extract meaningful Divs
    $('div').each((divIndex, div) => {
      const $div = $(div);
      const text = cleanText($div.text());
      
      if (text && text.length > 10 && text.length < 5000) {
        rawData.divs.push({
          index: divIndex,
          id: $div.attr('id') || '',
          class: $div.attr('class') || '',
          text: text
        });
      }
    });

    console.log('✅ Phase 1 Complete: Raw data extracted');
    console.log(`   - Tables: ${rawData.tables.length}`);
    console.log(`   - Links: ${rawData.links.length}`);
    console.log(`   - Headings: ${rawData.headings.h1.length + rawData.headings.h2.length}`);

    // =============================================
    // PHASE 2: INTELLIGENT FORMATTING
    // =============================================
    console.log('🧠 Phase 2: Intelligent formatting...');

    const formattedData = {
      slug: '',
      postTitle: '',
      postType: 'JOB',
      organization: '',
      shortInfo: '',
      totalVacancyCount: 0,
      importantDates: [],
      applicationFee: [],
      ageLimit: {},
      vacancyDetails: [],
      districtWiseData: [],
      importantLinks: [],
      isLive: true
    };

    // ========== Smart Title & Meta Extraction ==========
    formattedData.postTitle = rawData.headings.h1?.[0]?.text || rawData.title || 'Untitled';
    formattedData.slug = formattedData.postTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Smart Post Type Detection
    const titleLower = formattedData.postTitle.toLowerCase();
    const postTypePatterns = [
      { pattern: /admit\s*card/i, type: 'ADMIT_CARD' },
      { pattern: /result/i, type: 'RESULT' },
      { pattern: /answer\s*key/i, type: 'ANSWER_KEY' },
      { pattern: /syllabus/i, type: 'SYLLABUS' },
      { pattern: /admission/i, type: 'ADMISSION' },
      { pattern: /scholarship/i, type: 'SCHOLARSHIP' },
      { pattern: /private/i, type: 'PRIVATE_JOB' }
    ];
    
    for (const { pattern, type } of postTypePatterns) {
      if (pattern.test(titleLower)) {
        formattedData.postType = type;
        break;
      }
    }

    // Smart Organization Extraction
    const orgPatterns = [
      /^([A-Z]{2,})/,  // RSSB, SSC, etc.
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/  // Indian Railway, etc.
    ];
    
    for (const pattern of orgPatterns) {
      const match = formattedData.postTitle.match(pattern);
      if (match) {
        formattedData.organization = match[1];
        break;
      }
    }
    
    if (!formattedData.organization) {
      formattedData.organization = 'Various';
    }

    // Smart Short Description
    const meaningfulPara = rawData.paragraphs.find(p => 
      p.text.length > 80 && 
      p.text.length < 500 && 
      !p.text.toLowerCase().includes('copyright') &&
      !p.text.toLowerCase().includes('latest posts') &&
      !p.text.toLowerCase().includes('related posts')
    );
    formattedData.shortInfo = meaningfulPara?.text || '';

    // ========== Smart Table Analysis ==========
    rawData.tables.forEach((table, tableIndex) => {
      const tableHTML = table.rawHTML.toLowerCase();
      const allTableText = table.rows.map(r => 
        r.cells.map(c => c.text.toLowerCase()).join(' ')
      ).join(' ');
      const firstRowText = table.rows[0]?.cells.map(c => c.text.toLowerCase()).join(' ') || '';

      console.log(`   Analyzing Table ${tableIndex}...`);

      // Detect table type with confidence scoring
      const tableTypes = {
        dates: 0,
        fees: 0,
        age: 0,
        vacancy: 0,
        eligibility: 0,
        district: 0,
        links: 0
      };

      // Score detection
      if (tableHTML.includes('important date') || tableHTML.includes('short notice')) tableTypes.dates += 3;
      if (firstRowText.includes('date') || firstRowText.includes('exam') || firstRowText.includes('apply')) tableTypes.dates += 2;
      if (allTableText.includes('last date') || allTableText.includes('exam date')) tableTypes.dates += 1;

      if (tableHTML.includes('application fee') || tableHTML.includes('fee detail')) tableTypes.fees += 3;
      if (allTableText.includes('₹') || allTableText.includes('rs')) tableTypes.fees += 2;
      if (firstRowText.includes('category') && firstRowText.includes('fee')) tableTypes.fees += 2;
      if (allTableText.includes('general') && allTableText.includes('obc') && allTableText.includes('sc')) tableTypes.fees += 1;

      if (tableHTML.includes('age limit') || firstRowText.includes('age')) tableTypes.age += 3;
      if (allTableText.includes('minimum') || allTableText.includes('maximum')) tableTypes.age += 2;
      if (allTableText.includes('years') && allTableText.includes('age')) tableTypes.age += 1;

      if (tableHTML.includes('vacancy') || tableHTML.includes('post detail')) tableTypes.vacancy += 3;
      if (firstRowText.includes('post name') || firstRowText.includes('post') && firstRowText.includes('no.')) tableTypes.vacancy += 2;
      if (allTableText.includes('total post') || allTableText.match(/\d{3,}/)) tableTypes.vacancy += 1;

      if (tableHTML.includes('eligibility') || tableHTML.includes('qualification')) tableTypes.eligibility += 3;
      if (firstRowText.includes('education') || firstRowText.includes('degree')) tableTypes.eligibility += 2;

      if (tableHTML.includes('district') || firstRowText.includes('district')) tableTypes.district += 3;

      if (firstRowText.includes('link') || allTableText.includes('click here')) tableTypes.links += 2;

      // Get highest confidence type
      const detectedType = Object.keys(tableTypes).reduce((a, b) => 
        tableTypes[a] > tableTypes[b] ? a : b
      );
      const confidence = tableTypes[detectedType];

      console.log(`   -> Detected: ${detectedType} (confidence: ${confidence})`);

      // Process based on detected type
      if (detectedType === 'dates' && confidence >= 2) {
        table.rows.forEach((row, rowIdx) => {
          if (row.cells.length >= 2) {
            const label = row.cells[0].text;
            const value = row.cells[1].text;
            
            if (label && value && label.length < 100 && value.length < 100 &&
                !label.toLowerCase().includes('important date') &&
                !label.toLowerCase().includes('link')) {
              
              const isDateRelated = label.toLowerCase().match(/date|start|last|exam|result|admit|apply/);
              
              if (isDateRelated) {
                formattedData.importantDates.push({ label, value });
              }
              
              // Extract links from date table
              if (row.cells[1].links && row.cells[1].links.length > 0) {
                formattedData.importantLinks.push({
                  label: label,
                  url: row.cells[1].links[0].fullUrl,
                  isDeepLink: true
                });
              }
            }
          }
        });
      }

      if (detectedType === 'fees' && confidence >= 2) {
        table.rows.forEach((row, rowIdx) => {
          if (rowIdx === 0) return; // Skip header
          
          if (row.cells.length >= 2) {
            const category = row.cells[0].text;
            const amountText = row.cells[1].text;
            const amountMatch = amountText.match(/\d+/);
            const amount = amountMatch ? parseInt(amountMatch[0]) : 0;
            
            if (category && amount > 0 && !category.toLowerCase().includes('category')) {
              formattedData.applicationFee.push({
                category: category,
                amount: amount,
                note: amountText.includes('Refundable') ? 'Refundable' : ''
              });
            }
          }
        });

        // Check for list-based fees
        table.rows.forEach(row => {
          row.cells.forEach(cell => {
            if (cell.lists) {
              cell.lists.forEach(list => {
                list.items.forEach(item => {
                  const feeMatch = item.match(/For\s+([^:]+)\s*:\s*₹?\s*(\d+)/i);
                  if (feeMatch) {
                    formattedData.applicationFee.push({
                      category: feeMatch[1].trim(),
                      amount: parseInt(feeMatch[2]),
                      note: ''
                    });
                  }
                });
              });
            }
          });
        });
      }

      if (detectedType === 'age' && confidence >= 2) {
        table.rows.forEach(row => {
          if (row.cells.length >= 1) {
            const text = row.cells[0].text;
            const value = row.cells[1]?.text || '';
            const textLower = text.toLowerCase();
            
            if (textLower.includes('minimum') || textLower.includes('min age')) {
              formattedData.ageLimit.minAge = value || text.match(/\d+\s*Years?/i)?.[0];
            } else if (textLower.includes('maximum') || textLower.includes('max age')) {
              formattedData.ageLimit.maxAge = value || text.match(/\d+\s*Years?/i)?.[0];
            } else if (textLower.includes('as on') || text.match(/\d{2}\s+\w+\s+\d{4}/)) {
              formattedData.ageLimit.asOnDate = value || text.match(/\d{2}\s+\w+\s+\d{4}/)?.[0];
            } else if (textLower.includes('relaxation')) {
              formattedData.ageLimit.details = text;
            }
          }
        });
      }

      if (detectedType === 'vacancy' && confidence >= 2) {
        let isHeaderRow = true;
        table.rows.forEach(row => {
          if (isHeaderRow) {
            isHeaderRow = false;
            return;
          }
          
          if (row.cells.length >= 2) {
            const postName = row.cells[0].text;
            let totalPost = '';
            let area = '';
            
            if (row.cells.length === 3) {
              area = row.cells[1].text;
              totalPost = row.cells[2].text;
            } else {
              totalPost = row.cells[1].text;
            }
            
            if (postName && postName.length > 2 && 
                !postName.toLowerCase().includes('post name') &&
                !postName.toLowerCase().includes('vacancy')) {
              
              formattedData.vacancyDetails.push({
                postName: postName,
                totalPost: totalPost,
                eligibility: '',
                payLevel: '',
                categoryBreakdown: area ? { area: area, count: totalPost } : {}
              });
              
              const countMatch = totalPost.match(/\d+/);
              if (countMatch) {
                formattedData.totalVacancyCount += parseInt(countMatch[0]);
              }
            }
          }
        });
      }

      if (detectedType === 'eligibility' && confidence >= 2) {
        table.rows.forEach((row, rowIdx) => {
          if (rowIdx === 0) return;
          
          if (row.cells.length === 2) {
            const postName = row.cells[0].text;
            const eligibility = row.cells[1].text;
            
            if (eligibility && eligibility.length > 30) {
              const existing = formattedData.vacancyDetails.find(v => 
                v.postName.toLowerCase().includes(postName.toLowerCase().split(' ').slice(0, 2).join(' '))
              );
              
              if (existing) {
                existing.eligibility = eligibility;
              } else {
                formattedData.vacancyDetails.push({
                  postName: postName,
                  totalPost: '',
                  eligibility: eligibility,
                  payLevel: '',
                  categoryBreakdown: {}
                });
              }
            }
          }
        });
      }

      if (detectedType === 'district' && confidence >= 2) {
        let isHeaderRow = true;
        table.rows.forEach(row => {
          if (isHeaderRow) {
            isHeaderRow = false;
            return;
          }
          
          if (row.cells.length >= 2) {
            const district = row.cells[0].text;
            const posts = row.cells[1].text;
            const lastDate = row.cells[2]?.text || '';
            const link = row.cells[3]?.links?.[0]?.fullUrl || '';
            
            if (district && posts && !district.toLowerCase().includes('district')) {
              formattedData.districtWiseData.push({
                districtName: district,
                totalPost: posts,
                lastDate: lastDate,
                notificationLink: link
              });
            }
          }
        });
      }
    });

    // ========== Smart Links Extraction ==========
    const linkPatterns = [
      { pattern: /apply\s*online/i, priority: 10 },
      { pattern: /official\s*notification/i, priority: 9 },
      { pattern: /short\s*notice/i, priority: 8 },
      { pattern: /official\s*website/i, priority: 7 },
      { pattern: /syllabus/i, priority: 6 },
      { pattern: /admit\s*card/i, priority: 5 },
      { pattern: /click\s*here/i, priority: 3 }
    ];

    const scoredLinks = rawData.links
      .filter(link => {
        const text = link.text.toLowerCase();
        return link.text.length > 3 && 
               link.text.length < 100 &&
               !text.includes('download sarkari') &&
               !text.includes('app now') &&
               !link.fullUrl.includes('play.google') &&
               !link.fullUrl.includes('#');
      })
      .map(link => {
        let score = 0;
        const text = link.text.toLowerCase();
        
        for (const { pattern, priority } of linkPatterns) {
          if (pattern.test(text)) {
            score = priority;
            break;
          }
        }
        
        return { ...link, score };
      })
      .filter(link => link.score > 0)
      .sort((a, b) => b.score - a.score);

    scoredLinks.forEach(link => {
      if (!formattedData.importantLinks.some(l => l.url === link.fullUrl)) {
        formattedData.importantLinks.push({
          label: link.text,
          url: link.fullUrl,
          isDeepLink: false
        });
      }
    });

    // ========== Extract Total Posts from Headings ==========
    const allHeadings = [
      ...(rawData.headings.h2 || []),
      ...(rawData.headings.h3 || []),
      ...(rawData.headings.h4 || []),
      ...(rawData.headings.h5 || [])
    ];
    
    allHeadings.forEach(heading => {
      const totalPostMatch = heading.text.match(/(?:total\s*post|total\s*vacancy)\s*[:\-]?\s*(\d+)/i);
      if (totalPostMatch) {
        const count = parseInt(totalPostMatch[1]);
        if (count > formattedData.totalVacancyCount) {
          formattedData.totalVacancyCount = count;
        }
      }
    });

    // ========== Fallback: Extract from Lists ==========
    if (!formattedData.ageLimit.minAge || !formattedData.ageLimit.maxAge) {
      rawData.lists.ul.forEach(list => {
        list.items.forEach(item => {
          const text = item.text;
          const textLower = text.toLowerCase();
          
          if (textLower.includes('minimum age')) {
            formattedData.ageLimit.minAge = text.match(/\d+\s*Years?/i)?.[0];
          }
          if (textLower.includes('maximum age')) {
            formattedData.ageLimit.maxAge = text.match(/\d+\s*Years?/i)?.[0];
          }
          const dateMatch = text.match(/\d{2}\s+\w+\s+\d{4}/);
          if (dateMatch && textLower.includes('as on')) {
            formattedData.ageLimit.asOnDate = dateMatch[0];
          }
        });
      });
    }

    console.log('✅ Phase 2 Complete: Formatting done');
    console.log(`   - Dates: ${formattedData.importantDates.length}`);
    console.log(`   - Fees: ${formattedData.applicationFee.length}`);
    console.log(`   - Vacancy Details: ${formattedData.vacancyDetails.length}`);
    console.log(`   - Important Links: ${formattedData.importantLinks.length}`);

    // =============================================
    // FINAL RESPONSE
    // =============================================
    res.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      rawData: rawData,           // Complete original data
      formattedData: formattedData // Schema-formatted data
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});