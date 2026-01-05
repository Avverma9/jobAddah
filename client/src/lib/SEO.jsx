"use client";
// src/util/SEO.jsx - Comprehensive SEO Component for Google Rankings
import Head from 'next/head'
import { usePathname } from "next/navigation";

// Master keyword list optimized for sarkari job searches
const MASTER_KEYWORDS =
  "sarkari result, sarkari result 2025, sarkari result 2026, sarkari naukri, sarkari naukri 2025, government jobs, govt jobs 2025, latest govt jobs, central govt jobs, state govt jobs, free job alert, rojgar samachar, bharti 2025, ssc jobs, ssc cgl, ssc chsl, ssc mts, ssc gd, railway jobs, rrb ntpc, rrb group d, bank jobs, ibps po, ibps clerk, sbi po, upsc, upsc cds, upsc nda, bpsc, uppsc, mppsc, police bharti, teacher recruitment, ctet, admit card, result, answer key, online form, syllabus, private jobs, it jobs, work from home, latest sarkari result, rojgar result 2025, rojgar news today, sarkari exam admit card 2025, sarkari result apply online, free job alert latest, govt vacancy 2025, railway vacancy 2025, bank job notification 2025, ssc notification 2025, ssc cgl result date, ssc chsl admit card download, ssc mts result 2025, ssc gd recruitment, rrb ntpc result 2025, rrb group d result, railway bharti 2025 latest, railway apprentice 2025, indian railways jobs 2025, rrb technician jobs, rrb paramedical 2025, rrb je recruitment, rrb alp jobs 2025, ibps so recruitment, ibps clerk 2025, ibps po result, ibps rrb exam 2025, ibps admit card link, sbi clerk exam 2025, sbi so recruitment, sbi apprentice jobs, sbi result 2025, pnb bank jobs, canara bank recruitment, bank jobs for graduates, government accountant jobs, upsc exam calendar 2025, upsc prelims admit card, upsc mains result, upsc civil services cutoff, upsc cds result, upsc nda admit card, bpsc admit card download, bpsc mains result, bpsc online form 2025, bpsc new vacancy 2025, uppsc ro aro exam, uppsc notification pdf, uppsc result 2025, uppsc cutoff list, mp police result 2025, mppsc admit card 2025, mppeb recruitment 2025, cgpsc vacancy 2025, jpsc recruitment, bssc inter level 2025, bssc graduate level exam, bihar police admit card, bihar teacher vacancy 2025, bihar board result 2025, bihar sarkari result latest, bihar panchayat jobs, delhi police bharti 2025, delhi metro jobs 2025, dmrc recruitment 2025, haryana hssc exam 2025, hssc result 2025, punjab teacher recruitment, punjab police si bharti, rajasthan rpsc jobs 2025, rpsc admit card 2025, rpsc teacher recruitment 2025, rpsc si jobs 2025, rpsc junior accountant jobs, rpsc ldc vacancy, gujarat govt jobs alert, maharashtra mpsc exam 2025, mpsc answer key pdf, tnpsc exam 2025, tnpsc group 2 notification, karnataka kpsc result, kerala psc jobs 2025, ap police jobs 2025, tspsc notification 2025, telangana job alert, odisha ossc exam, osssc nursing officer result, wbpsc recruitment 2025, wb police jobs, tripura tpsc jobs, assam police jobs, assam psc notification, jkpsc result 2025, jkssb admit card, army bharti 2025, indian army rally 2025, army agniveer result, navy ssr 2025, navy mr recruitment, airforce agniveer admit card, crpf recruitment 2025, bsf constable jobs, cisf fireman vacancy, itbp head constable, ssb driver jobs, indian coast guard 2025, defence exams 2025, paramilitary jobs 2025, post office vacancy 2025, gds result 2025, postal assistant jobs 2025, staff nurse recruitment, nursing officer jobs 2025, pharmacist govt vacancy, lab technician jobs 2025, aiims recruitment 2025, medical officer vacancy, health department jobs, paramedical bharti 2025, anganwadi supervisor jobs, gram panchayat jobs, village development officer 2025, block development jobs, municipal corporation jobs, smart city project jobs, clerk recruitment 2025, stenographer vacancy 2025, typist govt jobs, computer operator job 2025, junior assistant recruitment, senior clerk jobs, office assistant government job, multitasking staff mts result, administrative officer vacancy, accountant jobs 2025, driver vacancy 2025, peon job 2025, helper job govt, teacher eligibility test 2025, tet exam 2025, ctet result 2025, primary teacher recruitment, tgt pgt teacher jobs, assistant professor jobs 2025, professor recruitment govt, lecturer recruitment 2025, guest teacher vacancy, non teaching jobs in universities, university recruitment cell, phd admission 2025, ugc net june 2025, ugc net december 2025, gate exam 2025, jee main result 2025, neet ug result 2025, cuet result 2025, cat exam 2025, xat result date, snap cutoff 2025, mat result declared, public service commission jobs, psc notification 2025, psu jobs 2025, bhel recruitment 2025, ntpc jobs 2025, sail jobs 2025, gail recruitment 2025, ongc job alert, isro recruitment 2025, drdo vacancies, barc recruitment 2025, csir jobs 2025, bel jobs 2025, npc il recruitment 2025, ecil jobs 2025, power grid recruitment, coal india jobs 2025, nhpc recruitment, iocl recruitment 2025, government engineer jobs, junior engineer vacancy, assistant engineer recruitment, civil engineer govt jobs, mechanical engineer jobs, electrical engineer govt jobs, computer engineer jobs, it officer recruitment, data entry operator jobs, digital marketing govt jobs, software developer govt jobs, web developer jobs govt, ui ux designer vacancy, data scientist government jobs, cyber security officer jobs, ai ml engineer govt jobs, seo jobs 2025 govt, content writer vacancy government, graphic designer govt job, translator govt jobs 2025, journalist recruitment govt, media officer jobs, social media manager govt, photographer recruitment, videographer jobs government, press information bureau jobs, news reporter govt jobs, tourism department jobs, archaeology recruitment 2025, museum curator jobs, librarian govt jobs 2025, teacher librarian recruitment, office superintendent vacancy, exam board jobs, public sector trainee jobs, apprentice 2025 govt, internship govt jobs, summer internship india govt, youth sports officer jobs 2025, coach recruitment govt, referee vacancy 2025, sports officer recruitment 2025, environment department jobs, forest officer vacancy 2025, forest guard result, forest ranger recruitment, wildlife jobs 2025, park ranger govt vacancy, meteorologist jobs, gis officer govt jobs, surveyor recruitment 2025, mining officer jobs, geologist jobs govt, agriculture officer jobs, horticulture vacancies 2025, fisheries inspector government, animal husbandry jobs, veterinary officer recruitment, irrigation department jobs, pwd engineer jobs 2025, road transport department jobs, transport officer vacancy, road safety officer 2025, aviation department jobs, air india jobs 2025, airport ground staff jobs, air traffic controller jobs, airport authority recruitment, metro jobs 2025, delhi metro station controller jobs, lucknow metro vacancy, bangalore metro jobs, chennai metro recruitment, kolkata metro vacancy, railway ticket collector jobs, railway driver jobs 2025, station master recruitment, loco pilot recruitment 2025, train clerk vacancy, energy department jobs, electricity board 2025, state power grid jobs, telecom department jobs, bsnl job 2025, india post telecommunication jobs, national informatics centre jobs, nic scientist recruitment 2025, digital india recruitment 2025, skill india vacancy, startup india careers 2025, make in india jobs, rural development officer jobs, district collector jobs, tahsildar recruitment, revenue officer jobs, patwari exam 2025, land record officer vacancy, court jobs 2025, junior clerk district court, stenographer court jobs, peon district court jobs, legal officer jobs 2025, assistant public prosecutor jobs, law officer recruitment 2025, government scholarship scheme, education department jobs 2025, university non teaching posts, open university jobs 2025, ignou assistant recruitment, kvs recruitment 2025, nvs recruitment 2025, army school teacher jobs, sainik school recruitment, cpsc jobs 2025, latest employment news 2025, today job update govt, daily sarkari update 2025, today admit card released, result declared today 2025, job notification pdf 2025, latest vacancy link, govt form last date 2025, sarkari result portal 2025, employment news pdf 2025, opportunity in government sector 2025, govt recruitment drive 2025, new vacancy notification 2025, apply online now 2025 , jeevika ka answer key 2025, cc jeevika ka answer key 2025";

export default function SEO({
  title = "JobsAddah - JobsAddah 2026 | Latest Govt Jobs, Admit Card, Results",
  description = "JobsAddah is India's #1 sarkari result portal for latest government jobs 2025, sarkari naukri notifications, admit cards, exam results. Get SSC, Railway, Bank, UPSC job alerts.",
  keywords = MASTER_KEYWORDS,
  canonical = null,
  ogImage = "/og-image.png",
  ogType = "website",
  author = "JobsAddah",
  publishedTime = null,
  modifiedTime = null,
  section = null,
  noindex = false,
  jsonLd = null,
  hasHindi = false,
}) {
  const siteUrl = process.env.SITE_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || "https://jobsaddah.com";
  const siteName = "JobsAddah";
  const twitterHandle = "@jobsaddah";
  const pathname = usePathname();
  const canonicalSource = canonical ?? pathname ?? "/";
  const canonicalPath = canonicalSource.startsWith("http")
    ? canonicalSource
    : canonicalSource.startsWith("/")
      ? siteUrl + canonicalSource
      : `${siteUrl}/${canonicalSource}`;

  const fullCanonical = canonicalPath;
  const fullOgImage = ogImage.startsWith("http")
    ? ogImage
    : ogImage.startsWith("/")
      ? `${siteUrl}${ogImage}`
      : `${siteUrl}/${ogImage}`;

  // Determine whether site provides Hindi localized pages. Can be enabled per-page
  // via `hasHindi` prop or globally with NEXT_PUBLIC_HAS_HI=true
  const globalHasHi = typeof process !== "undefined" && (process.env.NEXT_PUBLIC_HAS_HI === "1" || process.env.NEXT_PUBLIC_HAS_HI === "true");
  const includeHindi = hasHindi || globalHasHi;
  // compute Hindi alternate URL by prefixing /hi to the path portion when available
  const computeHiHref = () => {
    try {
      const full = new URL(fullCanonical);
      const path = full.pathname === "/" ? "/" : full.pathname.replace(/\/$/, "");
      const hiPath = path.startsWith("/hi") ? path : `/hi${path}`;
      return `${full.origin}${hiPath}${full.search || ""}${full.hash || ""}`;
    } catch (e) {
      // fallback: use siteUrl + /hi + canonical
      const c = canonical.startsWith("/") ? canonical : `/${canonical}`;
      const hi = c.startsWith("/hi") ? c : `/hi${c}`;
      return siteUrl + hi;
    }
  };

  const defaultJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": fullCanonical,
        url: fullCanonical,
        name: title,
        description: description,
        isPartOf: { "@id": siteUrl + "/#website" },
        datePublished: publishedTime || new Date().toISOString(),
        dateModified: modifiedTime || new Date().toISOString(),
        inLanguage: "en-IN",
      },
      {
        "@type": "WebSite",
        "@id": siteUrl + "/#website",
        url: siteUrl,
        name: siteName,
        description:
          "India's leading job portal for government jobs and private jobs, admit cards, and exam results",
        publisher: { "@id": siteUrl + "/#organization" },
        inLanguage: "en-IN",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: siteUrl + "/?search={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": siteUrl + "/#organization",
        name: siteName,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: siteUrl + "/logo.png",
          width: 512,
          height: 512,
        },
        description:
          "JobsAddah provides latest sarkari jobs private jobs, government job notifications, admit cards, and exam results.",
        sameAs: [
          "https://www.facebook.com/jobsaddah",
          "https://twitter.com/jobsaddah",
          "https://t.me/jobsaddah",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "support@jobsaddah.com",
          availableLanguage: ["English", "Hindi"],
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": fullCanonical + "#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          ...(section
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: section,
                  item: fullCanonical,
                },
              ]
            : []),
        ],
      },
    ],
  };

  const structuredData = jsonLd || defaultJsonLd;

  return (
    <Head>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="copyright" content={siteName} />
      <meta
        name="robots"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        }
      />
      <meta
        name="googlebot"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        }
      />
      <meta
        name="bingbot"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />
      <link rel="canonical" href={fullCanonical} />
      {/* RSS feed and sitemap discovery */}
      <link rel="alternate" type="application/rss+xml" title={`${siteName} - Latest Jobs`} href={`${siteUrl}/feed.xml`} />
      <link rel="sitemap" type="application/xml" title="Sitemap" href={`${siteUrl}/sitemap.xml`} />
      <meta httpEquiv="content-language" content="en-IN" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="India" />
      <link rel="alternate" hrefLang="en-IN" href={fullCanonical} />
      {includeHindi && <link rel="alternate" hrefLang="hi-IN" href={computeHiHref()} />}
      <link rel="alternate" hrefLang="x-default" href={fullCanonical} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="application-name" content={siteName} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content={siteName + " - Sarkari Result Portal"}
      />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_IN" />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {section && <meta property="article:section" content={section} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta
        name="twitter:image:alt"
        content={siteName + " - Sarkari Result Portal"}
      />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="revisit-after" content="1 day" />
      <meta name="coverage" content="India" />
      <meta name="target" content="all" />
      <meta name="HandheldFriendly" content="True" />
      <meta
        name="news_keywords"
        content="sarkari result, govt jobs, sarkari naukri, admit card, exam result, online form"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
}

export function generateJobPostingSchema(job) {
  if (!job) return null;
  const {
    title = "Government Job Vacancy",
    organization = "Government of India",
    description = "",
    applicationStartDate,
    applicationLastDate,
    vacancies,
    salary,
    location = "India",
    qualification,
    link,
  } = job;

  // Helper to extract path from URL (remove domain)
  const extractPath = (url) => {
    if (!url) return "";
    try {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        const urlObj = new URL(url);
        return urlObj.pathname;
      }
      return url.startsWith("/") ? url : `/${url}`;
    } catch {
      return url.startsWith("/") ? url : `/${url}`;
    }
  };

  const urlPath = link ? extractPath(link) : "";

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: title,
    description:
      description ||
      "Apply for " +
        title +
        " recruitment. Check eligibility, vacancy details, and apply online.",
    hiringOrganization: {
      "@type": "Organization",
      name: organization,
      sameAs: "https://jobsaddah.com",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
        addressRegion: typeof location === "string" ? location : "India",
      },
    },
    employmentType: "FULL_TIME",
    datePosted: applicationStartDate || new Date().toISOString().split("T")[0],
    validThrough: applicationLastDate || undefined,
    ...(vacancies && { totalJobOpenings: String(vacancies) }),
    ...(salary && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: {
          "@type": "QuantitativeValue",
          value: salary,
          unitText: "MONTH",
        },
      },
    }),
    ...(qualification && { qualifications: qualification }),
    url: urlPath
      ? "https://jobsaddah.com/post?url=" + encodeURIComponent(urlPath)
      : "https://jobsaddah.com",
    identifier: {
      "@type": "PropertyValue",
      name: "JobsAddah",
      value: urlPath || title,
    },
  };
}

export function generateFAQSchema(faqs) {
  if (!faqs || !faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function generateBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
