// src/util/SEO.jsx - Comprehensive SEO Component for Google Rankings
import { Helmet } from "react-helmet-async";

// Master keyword list optimized for sarkari job searches
const MASTER_KEYWORDS = "sarkari result, sarkari result 2025, sarkari result 2026, sarkari naukri, sarkari naukri 2025, government jobs, govt jobs 2025, latest govt jobs, central govt jobs, state govt jobs, free job alert, rojgar samachar, bharti 2025, ssc jobs, ssc cgl, ssc chsl, ssc mts, ssc gd, railway jobs, rrb ntpc, rrb group d, bank jobs, ibps po, ibps clerk, sbi po, upsc, upsc cds, upsc nda, bpsc, uppsc, mppsc, police bharti, teacher recruitment, ctet, admit card, result, answer key, online form, syllabus, private jobs, it jobs, work from home";

export default function SEO({
  title = "JobsAddah - Sarkari Result 2025 | Latest Govt Jobs, Admit Card, Results",
  description = "JobsAddah is India's #1 sarkari result portal for latest government jobs 2025, sarkari naukri notifications, admit cards, exam results. Get SSC, Railway, Bank, UPSC job alerts.",
  keywords = MASTER_KEYWORDS,
  canonical = "/",
  ogImage = "/og-image.png",
  ogType = "website",
  author = "JobsAddah",
  publishedTime = null,
  modifiedTime = null,
  section = null,
  noindex = false,
  jsonLd = null,
}) {
  const siteUrl = "https://jobsaddah.com";
  const siteName = "JobsAddah";
  const twitterHandle = "@jobsaddah";
  const fullCanonical = canonical.startsWith("http") ? canonical : siteUrl + canonical;
  const fullOgImage = ogImage.startsWith("http") ? ogImage : siteUrl + ogImage;

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
        description: "India's leading sarkari result portal for government jobs, admit cards, and exam results",
        publisher: { "@id": siteUrl + "/#organization" },
        inLanguage: "en-IN",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: siteUrl + "/?search={search_term_string}" },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": siteUrl + "/#organization",
        name: siteName,
        url: siteUrl,
        logo: { "@type": "ImageObject", url: siteUrl + "/logo.png", width: 512, height: 512 },
        description: "JobsAddah provides latest sarkari result, government job notifications, admit cards, and exam results.",
        sameAs: ["https://www.facebook.com/jobsaddah", "https://twitter.com/jobsaddah", "https://t.me/jobsaddah"],
        contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "support@jobsaddah.com", availableLanguage: ["English", "Hindi"] },
      },
      {
        "@type": "BreadcrumbList",
        "@id": fullCanonical + "#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          ...(section ? [{ "@type": "ListItem", position: 2, name: section, item: fullCanonical }] : []),
        ],
      },
    ],
  };

  const structuredData = jsonLd || defaultJsonLd;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="copyright" content={siteName} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="bingbot" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={fullCanonical} />
      <meta httpEquiv="content-language" content="en-IN" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="India" />
      <link rel="alternate" hrefLang="en-IN" href={fullCanonical} />
      <link rel="alternate" hrefLang="hi-IN" href={fullCanonical} />
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
      <meta property="og:image:alt" content={siteName + " - Sarkari Result Portal"} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_IN" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={siteName + " - Sarkari Result Portal"} />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="revisit-after" content="1 day" />
      <meta name="coverage" content="India" />
      <meta name="target" content="all" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="news_keywords" content="sarkari result, govt jobs, sarkari naukri, admit card, exam result, online form" />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
}

export function generateJobPostingSchema(job) {
  if (!job) return null;
  const { title = "Government Job Vacancy", organization = "Government of India", description = "", applicationStartDate, applicationLastDate, vacancies, salary, location = "India", qualification, link } = job;
  
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
    description: description || "Apply for " + title + " recruitment. Check eligibility, vacancy details, and apply online.",
    hiringOrganization: { "@type": "Organization", name: organization, sameAs: "https://jobsaddah.com" },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressCountry: "IN", addressRegion: typeof location === "string" ? location : "India" } },
    employmentType: "FULL_TIME",
    datePosted: applicationStartDate || new Date().toISOString().split("T")[0],
    validThrough: applicationLastDate || undefined,
    ...(vacancies && { totalJobOpenings: String(vacancies) }),
    ...(salary && { baseSalary: { "@type": "MonetaryAmount", currency: "INR", value: { "@type": "QuantitativeValue", value: salary, unitText: "MONTH" } } }),
    ...(qualification && { qualifications: qualification }),
    url: urlPath ? "https://jobsaddah.com/post?url=" + encodeURIComponent(urlPath) : "https://jobsaddah.com",
    identifier: { "@type": "PropertyValue", name: "JobsAddah", value: urlPath || title },
  };
}

export function generateFAQSchema(faqs) {
  if (!faqs || !faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  };
}

export function generateBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })),
  };
}
