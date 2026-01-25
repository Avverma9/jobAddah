import {
  ABSOLUTE_URL_PATTERN,
  PUBLIC_SITE,
  resolveCanonicalPath,
} from "@/lib/seo-utils";

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
