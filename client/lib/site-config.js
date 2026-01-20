const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://jobsaddah.com").replace(/\/$/, "");
export const SITE_NAME = "JobsAddah";
export const SITE_BASE_URL = new URL(SITE_URL);
export const DEFAULT_TITLE = "JobsAddah - Sarkari Result 2026 | Latest Govt Jobs";
export const DEFAULT_DESCRIPTION = "JobsAddah is India\'s fastest portal for verified Sarkari Naukri alerts, admit cards, results, and government job vacancies for SSC, Railways, Banks, UPSC, and state exams.";
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
export const DEFAULT_KEYWORDS = [
  "sarkari result",
  "govt jobs",
  "sarkari naukri",
  "latest govt jobs",
  "admit card",
  "job alerts",
  "railway jobs",
  "bank jobs",
  "ssc jobs",
  "upsc exam",
];
