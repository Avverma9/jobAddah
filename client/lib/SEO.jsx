"use client";

import Head from "next/head";
import {
  ABSOLUTE_URL_PATTERN,
  PUBLIC_SITE,
  buildKeywordString,
  resolveAbsoluteUrl,
} from "@/lib/seo-utils";

const DEFAULT_TITLE = "JobsAddah - Govt & Private Job Portal 2026 | Latest Govt Jobs, Admit Card";
const DEFAULT_DESCRIPTION =
  "JobsAddah is the fastest portal for Sarkari results, government jobs, admit cards, and exam updates in 2026.";
const DEFAULT_KEYWORDS = "government jobs, sarkari result, admit card, ssc, bank, railway, jobsaddah, 2026";
const DEFAULT_SOCIAL_IMAGE = `${PUBLIC_SITE}/logo.png`;

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
  const resolvedKeywords = buildKeywordString(keywords) || DEFAULT_KEYWORDS;
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

