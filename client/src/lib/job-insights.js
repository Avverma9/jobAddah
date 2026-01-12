const SHORT_MONTH_OPTIONS = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

const CATEGORY_COLORS = {
  Govt: { bg: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  Bank: { bg: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  Railway: { bg: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  Police: { bg: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
  Defence: { bg: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  SSC: { bg: "bg-slate-100 text-slate-700", dot: "bg-slate-500" },
};

export function parseDate(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const direct = Date.parse(trimmed);
  if (!Number.isNaN(direct)) return new Date(direct);

  const normalized = trimmed.replace(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/,
    (_, d, m, y) => {
      const year = y.length === 2 ? `20${y}` : y.padStart(4, "0");
      return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  );

  if (normalized !== trimmed) {
    const alt = Date.parse(normalized);
    if (!Number.isNaN(alt)) return new Date(alt);
  }

  return null;
}

export function pickLastDate(post) {
  const d = post?.recruitment?.importantDates || {};
  return (
    d.applicationLastDate ||
    d.applicationEndDate ||
    d.lastDateToApplyOnline ||
    d.onlineApplyLastDate ||
    d.lastDateOfRegistration ||
    d.lastDate ||
    ""
  );
}

export function formatDate(value, options = SHORT_MONTH_OPTIONS) {
  const parsed = parseDate(value);
  if (parsed) return parsed.toLocaleDateString(undefined, options);
  if (!value) return "–";
  return typeof value === "string" ? value.trim() : String(value);
}

export function calculateDaysLeft(value) {
  const parsed = parseDate(value);
  if (!parsed) return null;
  const now = new Date();
  parsed.setHours(23, 59, 59, 999);
  return Math.ceil((parsed - now) / (1000 * 60 * 60 * 24));
}

export function formatVacancy(count) {
  if (!count || Number(count) <= 0) return "N/A";
  return new Intl.NumberFormat("en-IN").format(count);
}

export function getVacancyCount(post) {
  const vacancy = post?.recruitment?.vacancyDetails || {};
  return (
    vacancy.totalPosts ||
    vacancy.total ||
    vacancy.totalVacancy ||
    post?.recruitment?.totalPosts ||
    post?.totalPosts ||
    post?.posts ||
    0
  );
}

export function deriveCategory(title = "") {
  const normalized = title.toLowerCase();
  if (normalized.includes("police")) return "Police";
  if (normalized.includes("railway") || normalized.includes("rrb")) return "Railway";
  if (normalized.includes("bank") || normalized.includes("sbi") || normalized.includes("ibps")) return "Bank";
  if (normalized.includes("defence") || normalized.includes("army") || normalized.includes("navy") || normalized.includes("air force")) return "Defence";
  if (normalized.includes("teacher") || normalized.includes("ssc")) return "SSC";
  return "Govt";
}

export function getOrganization(post) {
  return (
    post?.recruitment?.organization?.name ||
    post?.recruitment?.organization ||
    post?.organization ||
    "Multiple Departments"
  );
}

export function getCategoryColors(category = "Govt") {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Govt;
}

export function deriveCompetition(daysLeft, vacancyCount) {
  const count = Number(String(vacancyCount).replace(/,/g, "")) || 0;
  if (daysLeft == null) return "Moderate Competition";
  if (daysLeft <= 1 && count < 500) return "High Competition";
  if (daysLeft <= 3 && count < 1000) return "High Competition";
  if (count > 5000) return "Low Competition";
  return daysLeft <= 5 ? "Medium Competition" : "Low Competition";
}

export function estimateAppliedCount({ vacancyCount, daysLeft }) {
  const base = Number(String(vacancyCount).replace(/,/g, "")) || 800;
  const urgencyBoost = daysLeft != null && daysLeft <= 2 ? 1.8 : 1;
  const randomJitter = 0.8 + Math.random() * 0.4;
  const estimated = Math.round(base * urgencyBoost * randomJitter);
  const formatter = new Intl.NumberFormat("en-IN");
  return formatter.format(Math.max(estimated, 1200));
}

export function isBeginnerFriendly(title = "") {
  const normalized = title.toLowerCase();
  return ["assistant", "apprentice", "clerical", "clerk", "helper", "operator", "executive"].some((token) =>
    normalized.includes(token)
  );
}
