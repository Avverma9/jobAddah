import { toTitleCase } from "@/lib/text";

/* ============================================================
   BASIC UTILITIES
============================================================ */
export const extractText = (data) => {
  if (data == null) return "";
  if (typeof data === "string") return data;
  if (typeof data === "number" || typeof data === "boolean") return String(data);

  if (Array.isArray(data))
    return data.map(extractText).filter(Boolean).join(", ");

  if (typeof data === "object") {
    if (data.text) return data.text;
    if (data.label) return data.label;
    if (data.name) return data.name;
    if (data.value) return data.value;
    if (data.criteria) return data.criteria;
    if (data.link) return data.link;
    if (data.url) return data.url;
    if (data.href) return data.href;

    const flat = Object.values(data)
      .filter(
        (v) =>
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "boolean"
      )
      .map(String);

    if (flat.length) return flat.join(", ");

    try {
      return JSON.stringify(data);
    } catch {
      return String(data);
    }
  }

  return String(data);
};

export const isPlaceholderValue = (val) => {
  const s = String(val).toLowerCase().trim();
  return (
    !s ||
    s === "-" ||
    s === "n/a" ||
    s === "na" ||
    s === "null" ||
    s === "0" ||
    s.includes("notify later") ||
    s.includes("will be updated") ||
    s.includes("notified soon") ||
    s.includes("available soon") ||
    s.includes("before exam")
  );
};

/* ============================================================
   MAIN NORMALIZER
============================================================ */
export const extractRecruitmentData = (input) => {
  const payload = input?.data || input || {};
  const rec = payload.recruitment || payload;

  const org = rec.organization || {};
  const additional = rec.additionalDetails || rec.additionalInfo || {};

  return {
    id: payload._id || null,
    fav: Boolean(payload.fav),

    title: rec.title || "Recruitment Notification",

    advertisementNumber: 
      rec.advertisementNumber ||
      additional.advertisementNumber || 
      additional.advertisementNo || 
      null,

    organization:
      org.name ||
      org.shortName ||
      (typeof rec.organization === "string"
        ? rec.organization
        : "Government Organization"),

    organizationType: org.type || null,

    website:
      org.officialWebsite ||
      org.website ||
      payload.sourceUrl ||
      payload.url ||
      "",

    sourceUrl: rec.sourceUrl || payload.sourceUrl || payload.url || null,

    shortDescription:
      rec.shortDescription ||
      rec.eligibility?.educationalQualification ||
      rec.eligibility?.educationQualification ||
      rec.eligibility?.generalRequirement ||
      rec.eligibility?.education ||
      "",

    status: rec.status || "Active",

    importantDates: rec.importantDates || {},
    dates: extractDates(rec.importantDates || {}),

    vacancy: extractVacancy(rec.vacancyDetails || {}),
    fees: extractFees(rec.applicationFee || {}),
    age: extractAge(rec.ageLimit || {}),
    eligibility: extractEligibility(rec.eligibility || {}),
    physicalStandards: extractPhysicalStandards(rec.physicalStandards || {}),
    physicalTest: extractPhysicalTest(rec.physicalEfficiencyTest || {}),
    selection: Array.isArray(rec.selectionProcess)
      ? rec.selectionProcess
      : [],

    links: extractLinks(rec.importantLinks || {}),
    documentation: normalizeDocumentation(rec.documentation || []),
    districtData: normalizeDistricts(rec.vacancyDetails?.districtWise || rec.districtWiseData || []),

    additionalDetails: additional,

    noteToCandidates: 
      additional.noteToCandidates || 
      additional.applicantAdvisory || 
      null,
    confirmationAdvice: additional.confirmationAdvice || null,
    howToApply: 
      additional.howToApplyInstructions || 
      additional.applicationInstructions || 
      additional.applicationProcessNote || 
      null,
    relatedPosts: additional.relatedPosts || [],
    externalLinks: 
      additional.usefulExternalLinks || 
      additional.alternativeDetailsSource || 
      null,

    createdAt: payload.createdAt || null,
    updatedAt: payload.updatedAt || null,

    _raw: payload,
  };
};

/* ============================================================
   IMPORTANT DATES
============================================================ */
export const extractDates = (dates) => {
  if (!dates || typeof dates !== "object") return [];

  const map = [
    ["notificationDate", "Notification Date"],
    ["postDate", "Post Date"],
    ["applicationStartDate", "Application Start"],
    ["applicationLastDate", "Application Deadline"],
    ["feePaymentLastDate", "Fee Payment Deadline"],
    ["correctionDate", "Correction Date"],
    ["preExamDate", "Pre Exam Date"],
    ["mainsExamDate", "Mains Exam Date"],
    ["examDate", "Exam Date"],
    ["admitCardDate", "Admit Card"],
    ["resultDate", "Result Date"],
    ["answerKeyReleaseDate", "Answer Key Release"],
    ["finalAnswerKeyDate", "Final Answer Key"],
    ["meritListDate", "Merit List Date"],
    ["documentVerificationDate", "Document Verification"],
    ["counsellingDate", "Counselling Date"],
  ];

  const result = [];

  map.forEach(([key, label]) => {
    const v = dates[key];
    if (v && !isPlaceholderValue(v)) {
      result.push(`${label}: ${v}`);
    }
  });

  return result;
};

/* ============================================================
   FEES (WITH PAYMENT MODE)
============================================================ */
export const extractFees = (fees) => {
  if (!fees || typeof fees !== "object") return [];

  const result = [];
  const paymentModes = 
    fees.paymentMode || 
    fees.paymentModes || 
    fees.paymentModeOnline;

  const excludeKeys = [
    "paymentMode",
    "paymentModes", 
    "paymentModeOnline",
    "currency",
    "exemptions"
  ];

  Object.entries(fees).forEach(([key, value]) => {
    if (excludeKeys.includes(key)) return;
    if (value == null || value === 0 || isPlaceholderValue(value)) return;

    const label = toTitleCase(
      key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")
    );

    // Handle currency formatting
    const formattedValue = typeof value === "number" && fees.currency
      ? `${value} ${fees.currency}`
      : value;

    result.push({
      type: "normal",
      text: `${label}: ${formattedValue}`,
    });
  });

  // Add exemptions if present
  if (fees.exemptions && !isPlaceholderValue(fees.exemptions)) {
    result.push({
      type: "exemption",
      text: `Exemptions: ${fees.exemptions}`,
    });
  }

  // Add payment modes
  if (Array.isArray(paymentModes) && paymentModes.length) {
    result.push({
      type: "payment",
      text: `Payment Mode: ${paymentModes.join(", ")}`,
    });
  } else if (typeof paymentModes === "string" && paymentModes) {
    result.push({
      type: "payment",
      text: `Payment Mode: ${paymentModes}`,
    });
  }

  return result;
};

/* ============================================================
   AGE LIMIT
============================================================ */
export const extractAge = (age) => {
  if (!age || typeof age !== "object")
    return { text: [], relaxation: "", categoryWise: [] };

  const text = [];
  const categoryWise = [];

  // Minimum age
  if (age.minimumAge || age.minimum) {
    const minAge = age.minimumAge || age.minimum;
    if (!isPlaceholderValue(minAge))
      text.push(`Minimum Age: ${minAge}`);
  }

  // Maximum age
  if (age.maximumAge || age.maximum) {
    const maxAge = age.maximumAge || age.maximum;
    if (!isPlaceholderValue(maxAge))
      text.push(`Maximum Age: ${maxAge}`);
  }

  // Age as on date
  const ageAsOnDate =
    age.ageLimitAsOnDate ||
    age.ageCalculationDate ||
    age.ageCutoffDate ||
    age.asOnDate ||
    age.asOn ||
    age.ageAsOnDate;

  if (ageAsOnDate && !isPlaceholderValue(ageAsOnDate))
    text.push(`Age As On: ${ageAsOnDate}`);

  // Handle specific age fields
  if (age.maximumAgeURMale)
    text.push(`UR Male: ${age.maximumAgeURMale}`);
  if (age.maximumAgeURFemale)
    text.push(`UR Female: ${age.maximumAgeURFemale}`);
  if (age.maximumAgeBCEBCMaleFemale)
    text.push(`BC/EBC: ${age.maximumAgeBCEBCMaleFemale}`);
  if (age.maximumAgeSCSTMaleFemale)
    text.push(`SC/ST: ${age.maximumAgeSCSTMaleFemale}`);

  // Extract age relaxation
  let relaxationText = "";
  if (age.ageRelaxation) {
    if (typeof age.ageRelaxation === "string") {
      relaxationText = age.ageRelaxation;
    } else if (typeof age.ageRelaxation === "object") {
      const relaxations = [];
      Object.entries(age.ageRelaxation).forEach(([key, value]) => {
        if (key === "other" && typeof value === "object") {
          Object.entries(value).forEach(([k, v]) => {
            if (v && !isPlaceholderValue(v) && v !== 0) {
              const label = toTitleCase(
                k.replace(/_/g, " ").replace(/([A-Z])/g, " $1")
              );
              relaxations.push(`${label}: ${v}`);
            }
          });
        } else if (value && !isPlaceholderValue(value) && value !== 0) {
          const label = toTitleCase(
            key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")
          );
          relaxations.push(`${label}: ${value} years`);
        }
      });
      if (relaxations.length) relaxationText = relaxations.join(", ");
    }
  } else {
    relaxationText =
      age.ageRelaxationDetails ||
      age.relaxationDetails ||
      age.relaxation ||
      "";
  }

  // Extract category-wise age limits
  if (age.categoryWise && typeof age.categoryWise === "object") {
    Object.entries(age.categoryWise).forEach(([category, values]) => {
      if (typeof values === "object" && values !== null) {
        Object.entries(values).forEach(([gender, ageLimit]) => {
          if (ageLimit && !isPlaceholderValue(ageLimit) && ageLimit !== 0) {
            categoryWise.push({
              category: category.toUpperCase(),
              gender: toTitleCase(gender),
              age: ageLimit,
            });
          }
        });
      }
    });
  }

  return {
    text,
    relaxation: relaxationText,
    categoryWise,
  };
};

/* ============================================================
   VACANCY DETAILS
============================================================ */
export const extractVacancy = (vacancy) => {
  if (!vacancy || typeof vacancy !== "object") {
    return { 
      total: "See Notification", 
      positions: [],
      categoryWise: null,
    };
  }

  let positions = [];

  if (Array.isArray(vacancy.positions)) {
    positions = vacancy.positions.map((p) => {
      // Handle string positions
      if (typeof p === "string") {
        return {
          name: p,
          count: "-",
          qualification: "-",
          ageLimit: "",
        };
      }

      // Handle object positions
      return {
        name: p.name || p.postName || p.position || "Post",
        count: 
          p.totalPosts || 
          p.posts || 
          p.numberOfPosts ||
          p.count || 
          p.total || 
          "-",
        qualification: 
          p.eligibility || 
          p.qualification || 
          p.educationalQualification || 
          "-",
        ageLimit: p.ageLimit || "",
        category: p.category || "",
        areaType: p.areaType || "",
        discipline: p.discipline || "",
        general: p.general || "",
        obc: p.obc || "",
        sc: p.sc || "",
        st: p.st || "",
        ews: p.ews || "",
        pwd: p.pwd || p.ph || "",
      };
    });
  }

  // Extract category-wise breakdown
  let categoryWise = null;
  if (vacancy.categoryWise && typeof vacancy.categoryWise === "object") {
    categoryWise = {};
    Object.entries(vacancy.categoryWise).forEach(([key, value]) => {
      if (value && !isPlaceholderValue(value) && value !== 0) {
        categoryWise[key] = value;
      }
    });
    if (Object.keys(categoryWise).length === 0) categoryWise = null;
  }

  return {
    total:
      vacancy.totalPosts ||
      vacancy.total ||
      "See Notification",
    positions,
    categoryWise,
  };
};

/* ============================================================
   ELIGIBILITY
============================================================ */
export const extractEligibility = (elig) => {
  if (!elig) return [];

  if (typeof elig === "string")
    return [{ type: "text", text: elig }];

  if (Array.isArray(elig)) {
    return elig.map((item) => {
      if (typeof item === "string")
        return { type: "text", text: item };

      const position = item.position || item.name || "";
      const parts = [];

      if (item.educationalQualification)
        parts.push(`Education: ${item.educationalQualification}`);
      if (item.typingSkills)
        parts.push(`Typing: ${item.typingSkills}`);
      if (item.stenographySkills)
        parts.push(`Stenography: ${item.stenographySkills}`);
      if (item.otherRequirements)
        parts.push(`Other: ${item.otherRequirements}`);

      return {
        type: "position",
        position,
        text: parts.join(" | "),
      };
    });
  }

  // Handle object eligibility
  const result = [];

  const eduQualification =
    elig.educationalQualification ||
    elig.educationQualification ||
    elig.generalRequirement ||
    elig.qualification;

  if (eduQualification) {
    result.push({
      type: "text",
      text: eduQualification,
    });
  }

  if (elig.education) {
    if (Array.isArray(elig.education)) {
      elig.education.forEach((edu) => {
        result.push({ type: "text", text: edu });
      });
    } else {
      result.push({ type: "text", text: elig.education });
    }
  }

  // Special requirements
  if (elig.specialRequirements && Array.isArray(elig.specialRequirements)) {
    elig.specialRequirements.forEach((req) => {
      result.push({ type: "special", text: req });
    });
  }

  // Stream required
  if (elig.streamRequired && !isPlaceholderValue(elig.streamRequired)) {
    result.push({ type: "text", text: `Stream: ${elig.streamRequired}` });
  }

  // Minimum percentage
  if (elig.minimumPercentage && elig.minimumPercentage !== 0) {
    result.push({ 
      type: "text", 
      text: `Minimum Percentage: ${elig.minimumPercentage}%` 
    });
  }

  // Experience required
  if (elig.experienceRequired && !isPlaceholderValue(elig.experienceRequired)) {
    result.push({ type: "text", text: `Experience: ${elig.experienceRequired}` });
  } else if (elig.experience) {
    result.push({ type: "text", text: `Experience: ${elig.experience}` });
  }

  if (elig.skills) {
    result.push({ type: "text", text: `Skills: ${elig.skills}` });
  }

  // Handle other fields
  const processedKeys = [
    "educationalQualification",
    "educationQualification",
    "generalRequirement",
    "qualification",
    "education",
    "experience",
    "experienceRequired",
    "skills",
    "specialRequirements",
    "streamRequired",
    "minimumPercentage",
  ];

  Object.entries(elig).forEach(([key, value]) => {
    if (processedKeys.includes(key)) return;
    if (!value || isPlaceholderValue(value)) return;

    const label = toTitleCase(
      key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")
    );

    if (typeof value === "string") {
      result.push({ type: "item", label, text: value });
    }
  });

  return result;
};

/* ============================================================
   PHYSICAL STANDARDS
============================================================ */
export const extractPhysicalStandards = (physical) => {
  if (!physical || typeof physical !== "object") return null;

  const result = {
    male: {},
    female: {},
  };

  ["male", "female"].forEach((gender) => {
    if (physical[gender] && typeof physical[gender] === "object") {
      Object.entries(physical[gender]).forEach(([key, value]) => {
        if (value && !isPlaceholderValue(value)) {
          result[gender][key] = value;
        }
      });
    }
  });

  // Return null if both male and female are empty
  if (
    Object.keys(result.male).length === 0 &&
    Object.keys(result.female).length === 0
  ) {
    return null;
  }

  return result;
};

/* ============================================================
   PHYSICAL EFFICIENCY TEST
============================================================ */
export const extractPhysicalTest = (test) => {
  if (!test || typeof test !== "object") return null;

  const result = {
    male: {},
    female: {},
  };

  ["male", "female"].forEach((gender) => {
    if (test[gender] && typeof test[gender] === "object") {
      Object.entries(test[gender]).forEach(([key, value]) => {
        if (value && !isPlaceholderValue(value)) {
          result[gender][key] = value;
        }
      });
    }
  });

  // Return null if both male and female are empty
  if (
    Object.keys(result.male).length === 0 &&
    Object.keys(result.female).length === 0
  ) {
    return null;
  }

  return result;
};

/* ============================================================
   IMPORTANT LINKS (WITH ACTIVATION DATE SUPPORT)
============================================================ */
export const extractLinks = (links) => {
  if (!links || typeof links !== "object") return [];

  const seen = new Set();
  const result = [];

  Object.entries(links).forEach(([key, value]) => {
    if (!value) return;

    let url = null;
    let label = toTitleCase(
      key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")
    );
    let activationDate = null;
    let customText = null;

    // Handle nested "other" object
    if (key === "other" && typeof value === "object") {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (typeof nestedValue === "string" && nestedValue.startsWith("http")) {
          const nestedLabel = toTitleCase(
            nestedKey.replace(/_/g, " ").replace(/([A-Z])/g, " $1")
          );
          
          if (!seen.has(nestedValue)) {
            seen.add(nestedValue);
            result.push({
              label: nestedLabel,
              url: nestedValue,
              activationDate: null,
              isActive: true,
              isPending: false,
            });
          }
        }
      });
      return;
    }

    // Handle string URLs
    if (typeof value === "string") {
      url = value;
    }
    // Handle object with url/link/href
    else if (typeof value === "object") {
      url = value.url || value.link || value.href;
      activationDate = value.activationDate || null;
      customText = value.text || value.label || null;
      
      if (customText) label = customText;
    }

    // Skip if no URL or URL is placeholder
    if (!url || isPlaceholderValue(url)) {
      // If there's activation date but no URL, still add with pending status
      if (activationDate) {
        result.push({
          label,
          url: null,
          activationDate,
          isActive: false,
          isPending: true,
        });
      }
      return;
    }

    // Skip duplicate URLs
    if (seen.has(url)) return;
    
    // Skip placeholder domains
    if (url.includes("jobsaddah.com") && 
        !["whatsappChannel", "telegramChannel", "joinWhatsAppChannel", "joinTelegramChannel"].includes(key)) {
      return;
    }
    
    seen.add(url);

    result.push({
      label,
      url,
      activationDate,
      isActive: true,
      isPending: false,
    });
  });

  return result;
};

/* ============================================================
   LINK HELPER: CHECK IF LINK IS CLICKABLE
============================================================ */
export const isLinkClickable = (link) => {
  if (!link) return false;
  if (!link.url || isPlaceholderValue(link.url)) return false;
  return link.isActive === true;
};

/* ============================================================
   LINK HELPER: GET LINK STATUS MESSAGE
============================================================ */
export const getLinkStatusMessage = (link) => {
  if (!link) return null;
  
  if (link.isPending && link.activationDate) {
    return `Available from ${link.activationDate}`;
  }
  
  if (!link.url && link.activationDate) {
    return `Will be active from ${link.activationDate}`;
  }
  
  return null;
};

/* ============================================================
   DOCUMENTATION NORMALIZATION
============================================================ */
const normalizeDocumentation = (docs) => {
  if (!Array.isArray(docs)) return [];

  return docs.map((doc) => {
    if (typeof doc === "string") {
      return { type: doc, url: null, name: doc };
    }

    return {
      type: doc.type || doc.name || "Document",
      url: doc.url || doc.link || null,
      name: doc.name || doc.type || "Document",
    };
  });
};

/* ============================================================
   DISTRICT WISE DATA
============================================================ */
const normalizeDistricts = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return [];

  return arr.map((d) => ({
    districtName: d.districtName || d.name || d.district || "",
    posts: d.posts || d.totalPosts || d.count || "",
    lastDate: d.lastDate || d.closingDate || "",
    notificationLink: d.notificationLink || d.link || "",
    _raw: d,
  }));
};

/* ============================================================
   UI HELPER: ADDITIONAL DETAILS RENDERER
============================================================ */
export const renderAdditionalValue = (value) => {
  if (value == null) return null;

  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-5 space-y-1 text-sm">
        {value.map((v, i) => (
          <li key={i}>{extractText(v)}</li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="space-y-1 pl-2 text-sm">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <strong>
              {toTitleCase(
                k.replace(/_/g, " ").replace(/([A-Z])/g, " $1")
              )}
              :
            </strong>{" "}
            {extractText(v)}
          </div>
        ))}
      </div>
    );
  }

  return <span>{extractText(value)}</span>;
};

/* ============================================================
   HELPER: FORMAT PHYSICAL STANDARDS FOR DISPLAY
============================================================ */
export const formatPhysicalStandards = (standards) => {
  if (!standards) return null;

  const result = [];

  if (standards.male && Object.keys(standards.male).length > 0) {
    result.push({
      gender: "Male",
      details: Object.entries(standards.male).map(([key, value]) => ({
        label: toTitleCase(key),
        value,
      })),
    });
  }

  if (standards.female && Object.keys(standards.female).length > 0) {
    result.push({
      gender: "Female",
      details: Object.entries(standards.female).map(([key, value]) => ({
        label: toTitleCase(key),
        value,
      })),
    });
  }

  return result.length > 0 ? result : null;
};
