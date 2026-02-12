const isExternalHttpUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw || !/^https?:\/\//i.test(raw)) return false;
  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();
    if (host === "jobsaddah.com" || host.endsWith(".jobsaddah.com")) return false;
    return true;
  } catch {
    return false;
  }
};

const hasActiveExternalHttpLink = (link) => {
  if (!link || typeof link !== "object") return false;
  const url = String(link.url || "").trim();
  if (!isExternalHttpUrl(url)) return false;
  if (Object.prototype.hasOwnProperty.call(link, "isActive")) {
    return link.isActive === true;
  }
  return true;
};

export const getIndexabilitySignals = (detail) => {
  if (!detail) {
    return {
      score: 0,
      hasIdentity: false,
      hasActionableInfo: false,
      hasTrustedSource: false,
      hasDates: false,
      hasVacancyRows: false,
      hasEligibility: false,
      hasSelection: false,
      hasDocuments: false,
      hasRichSummary: false,
    };
  }

  const titleLength = String(detail.title || "").trim().length;
  const organizationLength = String(detail.organization || "").trim().length;
  const hasDates = Array.isArray(detail.dates) && detail.dates.length >= 2;
  const hasVacancyRows =
    Array.isArray(detail.vacancy?.positions) && detail.vacancy.positions.length >= 1;
  const hasEligibility =
    Array.isArray(detail.eligibility) && detail.eligibility.length >= 1;
  const hasSelection = Array.isArray(detail.selection) && detail.selection.length >= 1;
  const hasDocuments =
    Array.isArray(detail.documentation) && detail.documentation.length >= 1;
  const hasTrustedSourceLinks =
    Array.isArray(detail.links) &&
    detail.links.some((link) => hasActiveExternalHttpLink(link));
  const hasTrustedSource =
    hasTrustedSourceLinks ||
    isExternalHttpUrl(detail.sourceUrl) ||
    isExternalHttpUrl(detail.website);

  const summaryCandidates = [
    detail.shortDescription,
    detail.additionalInfo,
    detail.content?.originalSummary,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  const hasRichSummary = summaryCandidates.length >= 80;

  const score = [
    hasDates,
    hasVacancyRows,
    hasEligibility,
    hasSelection,
    hasDocuments,
    hasTrustedSource,
    hasRichSummary,
  ].filter(Boolean).length;

  return {
    score,
    hasIdentity: titleLength >= 20 && organizationLength >= 3,
    hasActionableInfo: hasDates || hasVacancyRows || hasEligibility,
    hasTrustedSource,
    hasDates,
    hasVacancyRows,
    hasEligibility,
    hasSelection,
    hasDocuments,
    hasRichSummary,
  };
};

export const isIndexableRecruitmentPage = (detail) => {
  const signals = getIndexabilitySignals(detail);
  return (
    signals.hasIdentity &&
    signals.hasActionableInfo &&
    signals.hasTrustedSource &&
    signals.score >= 4
  );
};

export const getThinReasons = (signals) => {
  const reasons = [];
  if (!signals.hasIdentity) reasons.push("missing_identity");
  if (!signals.hasActionableInfo) reasons.push("missing_actionable_info");
  if (!signals.hasTrustedSource) reasons.push("missing_trusted_source_links");
  if (!signals.hasRichSummary) reasons.push("missing_rich_summary");
  if (!signals.hasSelection) reasons.push("missing_selection_details");
  if (!signals.hasDocuments) reasons.push("missing_documents_list");
  if (signals.score < 4) reasons.push("quality_score_below_threshold");
  return reasons;
};
