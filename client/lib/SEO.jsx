"use client";

import Head from "next/head";
import { buildCanonicalPath } from "@/lib/job-url";

const PUBLIC_SITE = "https://jobsaddah.com";
const DEFAULT_TITLE = "JobsAddah - Sarkari Result 2026 | Latest Govt Jobs, Admit Card";
const DEFAULT_DESCRIPTION =
  "JobsAddah is the fastest portal for Sarkari results, government jobs, admit cards, and exam updates in 2026.";
const DEFAULT_KEYWORDS = "government jobs, sarkari result, admit card, ssc, bank, railway, jobsaddah, 2026";
const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const DEFAULT_SOCIAL_IMAGE = `${PUBLIC_SITE}/logo.png`;

const normalizeUrlValue = (value) => {
  if (!value) return "/";
  const trimmed = value.toString().trim();
  if (!trimmed) return "/";
  try {
    const parsed = new URL(trimmed, PUBLIC_SITE);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }
};

const resolveCanonicalPath = (value) => {
  const normalized = normalizeUrlValue(value);
  const canonicalPath = buildCanonicalPath(normalized);
  return canonicalPath || normalized || "/";
};

const resolveAbsoluteUrl = (value) => {
  const canonicalPath = resolveCanonicalPath(value);
  return ABSOLUTE_URL_PATTERN.test(canonicalPath)
    ? canonicalPath
    : `${PUBLIC_SITE}${canonicalPath}`;
};

const buildKeywordString = (keywords) => {
  if (!keywords) return DEFAULT_KEYWORDS;
  if (Array.isArray(keywords)) {
    return keywords.join(", ");
  }
  return keywords;
};

export default function SEO({
  title,
  description,
  path = "/",
  canonical,
  keywords,
  robots,
} = {}) {
  const resolvedTitle = title || DEFAULT_TITLE;
  const resolvedDescription = description || DEFAULT_DESCRIPTION;
  const resolvedKeywords = buildKeywordString(keywords);
  const canonicalUrl = canonical
    ? ABSOLUTE_URL_PATTERN.test(canonical)
      ? canonical
      : resolveAbsoluteUrl(canonical)
    : resolveAbsoluteUrl(path);
  const robotsContent = robots || "index,follow";

  return (
    <Head>
      {resolvedTitle && <title>{resolvedTitle}</title>}
      <meta name="description" content={resolvedDescription} />
      <meta name="keywords" content={resolvedKeywords} />
      <meta
        name="google-site-verification"
        content="pHJE47RJ0hoH0RC_KkdTem_-ECsDDjNEA296FWOdObY"
      />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="JobsAddah" />
      <meta property="og:image" content={DEFAULT_SOCIAL_IMAGE} />
      <meta name="twitter:image" content={DEFAULT_SOCIAL_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="robots" content={robotsContent} />
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

  const canonicalPath = resolveCanonicalPath(link);
  const absoluteUrl = ABSOLUTE_URL_PATTERN.test(canonicalPath)
    ? canonicalPath
    : `${PUBLIC_SITE}${canonicalPath}`;

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description:
      description ||
      `Apply for ${title} recruitment. Check eligibility, vacancy details, and apply online.`,
    hiringOrganization: {
      "@type": "Organization",
      name: organization,
      sameAs: PUBLIC_SITE,
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
    datePosted: applicationStartDate || "2026-01-01",
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
    url: absoluteUrl,
    identifier: {
      "@type": "PropertyValue",
      name: "JobsAddah",
      value: canonicalPath || title,
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
  if (!items || !items.length) return null;
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
