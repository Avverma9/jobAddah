const PLACEHOLDER_RE =
  /^(?:na|n\/a|null|undefined|notify later|will be updated|notified soon|available soon|check notification)$/i;

const asString = (value) => String(value ?? "").trim();

const isNonEmpty = (value) => {
  const v = asString(value);
  if (!v) return false;
  if (v === "-" || v === "0") return false;
  if (PLACEHOLDER_RE.test(v)) return false;
  return true;
};

const toOrganizationName = (organization) => {
  if (!organization) return "";
  if (typeof organization === "string") return asString(organization);
  if (typeof organization === "object") {
    return asString(organization.name || organization.shortName || "");
  }
  return "";
};

const toWebsite = (organization) => {
  if (!organization || typeof organization !== "object") return "";
  return asString(organization.website || organization.officialWebsite || "");
};

const normalizeDateEntries = (dates) => {
  if (!dates || typeof dates !== "object") return [];
  const out = [];
  Object.values(dates).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (isNonEmpty(item)) out.push(String(item));
      });
      return;
    }
    if (value && typeof value === "object") {
      Object.values(value).forEach((nested) => {
        if (isNonEmpty(nested)) out.push(String(nested));
      });
      return;
    }
    if (isNonEmpty(value)) out.push(String(value));
  });
  return out;
};

const normalizeEligibility = (eligibility) => {
  if (!eligibility) return [];
  if (Array.isArray(eligibility)) return eligibility.filter(Boolean);
  if (typeof eligibility === "string") return isNonEmpty(eligibility) ? [eligibility] : [];
  if (typeof eligibility === "object") {
    const values = Object.values(eligibility).flatMap((value) => {
      if (Array.isArray(value)) return value;
      return [value];
    });
    return values.filter((value) => isNonEmpty(value));
  }
  return [];
};

const normalizeSelection = (selectionProcess) => {
  if (!Array.isArray(selectionProcess)) return [];
  return selectionProcess.filter((item) => {
    if (typeof item === "string") return isNonEmpty(item);
    if (item && typeof item === "object") {
      return isNonEmpty(item.text || item.name || item.label || item.stage || "");
    }
    return false;
  });
};

const normalizeDocuments = (docs) => {
  if (!Array.isArray(docs)) return [];
  return docs.filter((item) => {
    if (typeof item === "string") return isNonEmpty(item);
    if (item && typeof item === "object") {
      return isNonEmpty(item.name || item.type || item.label || item.text || "");
    }
    return false;
  });
};

const normalizePositions = (vacancyDetails) => {
  if (!vacancyDetails || typeof vacancyDetails !== "object") return [];
  if (!Array.isArray(vacancyDetails.positions)) return [];
  return vacancyDetails.positions.filter(Boolean);
};

const pushLinkCandidate = (bucket, value) => {
  if (!value) return;
  if (typeof value === "string") {
    const url = asString(value);
    if (url) bucket.push({ url, isActive: true });
    return;
  }
  if (value && typeof value === "object") {
    const url = asString(value.url || value.link || value.href || "");
    if (!url) return;
    bucket.push({
      url,
      isActive: value.isActive ?? true,
    });
  }
};

const normalizeImportantLinks = (importantLinks) => {
  if (!importantLinks || typeof importantLinks !== "object") return [];
  const links = [];
  Object.values(importantLinks).forEach((value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (value.url || value.link || value.href) {
        pushLinkCandidate(links, value);
        return;
      }
      Object.values(value).forEach((nested) => pushLinkCandidate(links, nested));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => pushLinkCandidate(links, item));
      return;
    }
    pushLinkCandidate(links, value);
  });
  return links;
};

const normalizeGenericLinks = (links) => {
  if (!Array.isArray(links)) return [];
  const out = [];
  links.forEach((item) => pushLinkCandidate(out, item));
  return out;
};

export const buildRecruitmentQualityDetail = (raw) => {
  const payload = raw?.data || raw || {};
  const rec = payload.recruitment || payload || {};

  const organization = toOrganizationName(rec.organization);
  const dates = normalizeDateEntries(rec.importantDates);
  const positions = normalizePositions(rec.vacancyDetails);
  const eligibility = normalizeEligibility(rec.eligibility);
  const selection = normalizeSelection(rec.selectionProcess);
  const documentation = normalizeDocuments(rec.documentation);
  const importantLinks = normalizeImportantLinks(rec.importantLinks);
  const genericLinks = normalizeGenericLinks(rec.links || payload.links || []);
  const links = [...importantLinks, ...genericLinks];

  return {
    title: asString(rec.title || payload.title || ""),
    organization,
    sourceUrl: asString(rec.sourceUrl || payload.sourceUrl || payload.url || ""),
    website: asString(toWebsite(rec.organization) || rec.website || ""),
    shortDescription: asString(rec.shortDescription || ""),
    additionalInfo: asString(
      rec.additionalInfo ||
        rec.additionalDetails?.additionalInfo ||
        rec.additionalDetails?.noteToCandidates ||
        "",
    ),
    content: {
      originalSummary: asString(rec.content?.originalSummary || ""),
    },
    dates,
    vacancy: {
      positions,
    },
    eligibility,
    selection,
    documentation,
    links,
  };
};
