const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://jobsaddah.com").replace(/\/$/, "");

export const SITE_NAME = "JobsAddah";
export const SITE_BASE_URL = new URL(SITE_URL);
export const DEFAULT_TITLE =
  "Latest Sarkari Result, Govt Jobs, Admit Card and Answer Key";
export const DEFAULT_DESCRIPTION =
  "JobsAddah publishes verified Sarkari Naukri updates, government exam results, admit cards, answer keys, and official notifications for SSC, Railway, Bank, UPSC, and state exams in India.";
export const DEFAULT_IMAGE = `${SITE_URL}/app-logo.png`;
export const DEFAULT_KEYWORDS = [
  "jobsaddah",
  "jobsaddah.com",
  "jobsaddah latest jobs",
  "sarkari result",
  "latest sarkari result",
  "govt jobs",
  "sarkari naukri",
  "government jobs in india",
  "latest govt jobs",
  "admit card",
  "answer key",
  "job alerts",
  "railway jobs",
  "bank jobs",
  "ssc jobs",
  "upsc exam",
  "state govt jobs",
  "government exam results",
  "sarkari exam",
  "exam date",
  "syllabus",
  "notification",
  "vacancy",
  "application form",
  "eligibility",
];

export const SITE_EMAIL = "support@jobsaddah.com";
