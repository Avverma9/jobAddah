import { AlertCircle, Briefcase, Calendar, CheckCircle, ChevronRight, Clock, FileText, Info, Link as LinkIcon, MapPin, Loader } from "lucide-react";

// ============================================================================
// 1. DATA EXTRACTION LOGIC (The Core)
// ============================================================================

export const extractRecruitmentData = (data) => {
  const rec = data.recruitment || data;

  const title = rec.title || data.title || "Recruitment Notification";

  const org = rec.organization || {};
  const organization = org.name || "";
  const website = Array.isArray(org.website)
    ? org.website[0]
    : org.website || org.officialWebsite || org.url || "";

  return {
    title,
    organization,
    website,
    dates: extractDates(rec.importantDates || rec.dates || {}),
    fees: extractFees(rec.applicationFee || rec.fees || {}),
    age: extractAge(rec.ageLimit || rec.age || {}),
    vacancy: extractVacancy(rec.vacancyDetails || rec.vacancy || {}),
    eligibility: extractEligibility(rec.eligibility || {}),
    selection: rec.selectionProcess || rec.selection || [],
    links: extractLinks(rec.importantLinks || rec.links || {}),
    districtData: rec.districtWiseData || rec.districtData || [],
  };
};

// --- DATES EXTRACTION ---
export const extractDates = (dates) => {
  if (!dates || typeof dates !== "object") return [];

  const result = [];
  const dateMapping = [
    {
      keys: ["notificationDate", "Notification Date", "notificationReleaseDate", "shortNoticeDate"],
      label: "Notification Date",
    },
    {
      keys: [
        "applicationStartDate", "applicationStart", "onlineApplicationStart", "onlineApplyStartDate", 
        "onlineApplyStart", "startDate", "applyOnlineStartDate", "applyOnlineStart", "applyStartDate", 
        "Online Apply Start Date", "applicationBeginDate", "Apply_Start_Date", "startingDate", "startingDate2", "startingDate3"
      ],
      label: "Application Start",
    },
    {
      keys: [
        "applicationLastDate", "applicationEndDate", "lastDateToApply", "lastDateForApply", 
        "onlineApplyLastDate", "onlineApplicationEnd", "lastDate", "applyOnlineLastDate", 
        "applyOnlineLast", "applyLastDate", "Online Apply Last Date", "applicationEnd", 
        "Apply_Last_Date", "lastDateOfRegistration", "lastDateToApplyOnline", "lastDate2", "lastDate3", "onlineApplicationLastDate"
      ],
      label: "Application Deadline",
    },
    {
      keys: [
        "feePaymentLastDate", "lastDateForFeePayment", "payExamFeeLastDate", "feeLastDate", 
        "feePaymentEnd", "feePaymentLast", "Last Date For Fee Payment", "lastDateOfFeePayment", 
        "Fee_Payment_Last_Date", "feePaymentLastDate2", "feePaymentLastDate3", "payExamFeesLastDate"
      ],
      label: "Fee Payment Deadline",
    },
    {
      keys: [
        "correctionLastDate", "correctionDate", "correctionFormDates", "formCorrectionDate", 
        "editModifyForm", "correctionModifiedFormWindow", "Correction_Date", "onlineCorrection", 
        "onlineCorrection2", "onlineCorrection3", "Online Correction Form Link"
      ],
      label: "Correction Window",
    },
    {
      keys: [
        "formCompleteLastDate", "formSubmissionLastDate", "finalSubmitLast", "printFormLastDate"
      ],
      label: "Form Complete/Print Last Date",
    },
    {
      keys: [
        "examDate", "preExamDate", "writtenExamDate", "cbtDate", "tierIExamStartDate", "Exam Date", 
        "froPreExamDate", "acfPreExamDate", "swayamExamDate", "examDates", "Exam_Date", 
        "preExamDate", "mainsExamDate", "CHTE Paper-II Exam Date"
      ],
      label: "Exam Date",
    },
    {
      keys: [
        "admitCardDate", "admitCardReleaseDate", "admitCard", "admitCardAvailable", "admitCardStatus", 
        "Admit Card", "froPreAdmitCardDate", "acfPreAdmitCardDate", "admitCardAvailableDate", 
        "Admit_Card_Date", "Paper-II Admit Card", "cyclingTestAdmitCard", "Dummy Admit Card"
      ],
      label: "Admit Card",
    },
    {
      keys: [
        "examCityDetails", "tierIExamCityDetails", "examCityAvailableDate", 
        "examCityDetailsDate", "Paper-II Exam City Details"
      ],
      label: "Exam City Details",
    },
    {
      keys: [
        "resultDate", "resultDeclaredDate", "resultReleaseDate", "resultAnnouncement", "Result Date", 
        "froPTResultDate", "Result Declared Date", "Result_Date", "resultDeclared"
      ],
      label: "Result Date",
    },
    { keys: ["Answer Key", "answerKeyReleaseDate", "answerKey"], label: "Answer Key" },
    { keys: ["Final Answer Key Release Date", "finalAnswerKey"], label: "Final Answer Key" },
    { keys: ["Counselling Start On"], label: "Counselling Start" },
    { keys: ["Last Date for Counselling"], label: "Counselling End" },
    { keys: ["Dummy Admit Card Correction Date"], label: "Dummy Admit Card Correction" },
    { keys: ["meritList", "meritListDate"], label: "Merit List Date" },
    { keys: ["applicationStatus", "Application_Status_Date"], label: "Application Status" },
    { keys: ["photoSignatureReuploadWindow", "reUploadPhotoSign"], label: "Photo/Sign Re-upload" },
    { keys: ["slotBookingDate"], label: "Slot Booking" },
    { keys: ["documentVerificationDate"], label: "Document Verification" },
    { keys: ["cyclingTestDate"], label: "Cycling Test Date" },
  ];

  dateMapping.forEach(({ keys, label }) => {
    for (const key of keys) {
      if (dates[key] && String(dates[key]).trim()) {
        result.push(`${label}: ${dates[key]}`);
      }
    }
  });

  return result;
};

// --- FEES EXTRACTION ---
export const extractFees = (fees) => {
  if (!fees || typeof fees !== "object") return [];

  const result = [];
  const handledKeys = new Set();

  const isDummyValue = (v) => {
    if (v == null) return true;
    if (typeof v !== "string") return false;
    const val = v.toLowerCase();
    return (
      val.includes("will be updated") ||
      val.includes("available soon") ||
      val.includes("notified soon") ||
      val.includes("notify later")
    );
  };

  const specialKeyMap = {
    generalEWSBCEBCJharkhandDomicile: "Gen/EWS/BC/EBC (Jharkhand)",
    scStJharkhandDomicile: "SC/ST (Jharkhand)",
    allCategoryOtherState: "Other State Candidates",
    generalEwsObcCreamyLayer: "Gen/EWS/OBC (Creamy)",
    ewsObcNonCreamyLayer: "EWS/OBC (Non‑Creamy)",
    ewsObcNonCreamy: "EWS/OBC (Non‑Creamy)",
  };

  const formatFeeKey = (key) => {
    if (specialKeyMap[key]) return specialKeyMap[key];
    return key
      .replace(/_/g, " / ")
      .replace(/([a-z])([A-Z])/g, "$1 / $2")
      .replace(/general/gi, "General")
      .replace(/obc/gi, "OBC")
      .replace(/ews/gi, "EWS")
      .replace(/sc/gi, "SC")
      .replace(/st/gi, "ST")
      .replace(/ph/gi, "PH")
      .replace(/female/gi, "Female")
      .replace(/pwd/gi, "PwD")
      .trim();
  };

  if (fees.feeCategories && Array.isArray(fees.feeCategories)) {
    fees.feeCategories.forEach((catItem) => {
      if (catItem.category) {
        result.push({ type: "header", text: catItem.category });
      }
      Object.entries(catItem).forEach(([key, value]) => {
        if (key === "category") return;
        if (isDummyValue(value)) return;
        const formattedKey = formatFeeKey(key);
        result.push({ type: "item", text: `${formattedKey}: ${value}` });
      });
    });
    handledKeys.add("feeCategories");
  }

  const nestedKeys = [
    { key: "withPPP_Aadhaar", label: "With PPP/Aadhaar:" },
    { key: "withoutPPP_Aadhaar", label: "Without PPP/Aadhaar:" },
    { key: "categoryFees", label: "Category Fees:" },
    { key: "paper1", label: "Paper I Only:" },
    { key: "bothPapers", label: "Both Paper I & II:" },
    { key: "categories", label: "Application Fee:" },
    { key: "feeDetails", label: "Fee Details:" },
  ];

  let hasNested = false;

  nestedKeys.forEach(({ key, label }) => {
    if (fees[key] && typeof fees[key] === "object" && !Array.isArray(fees[key])) {
      hasNested = true;
      handledKeys.add(key);
      result.push({ type: "header", text: label });
      Object.entries(fees[key]).forEach(([subKey, subValue]) => {
        if (subValue == null || isDummyValue(subValue)) return;
        const formattedKey = formatFeeKey(subKey);
        result.push({ type: "item", text: `${formattedKey}: ${subValue}` });
      });
    }
  });

  Object.entries(fees).forEach(([key, val]) => {
    if (handledKeys.has(key)) return;
    if (!val || typeof val !== "object" || Array.isArray(val)) return;
    if (/paymentmode/i.test(key)) return;
    hasNested = true;
    handledKeys.add(key);
    result.push({ type: "header", text: `${formatFeeKey(key)}:` });
    Object.entries(val).forEach(([subKey, subVal]) => {
      if (subVal == null || isDummyValue(subVal)) return;
      const formattedKey = formatFeeKey(subKey);
      result.push({ type: "item", text: `${formattedKey}: ${subVal}` });
    });
  });

  if (hasNested) {
    const paymentKeys = [
      "paymentMode",
      "paymentModes",
      "paymentModeOnline",
      "paymentModeOnlineMethods",
      "PaymentModeOnlineMethods",
      "PaymentModeOnline",
      "Payment_Mode_Online_Methods",
      "Payment Mode",
      "Payment Mode (Online)",
    ];
    const modesSet = new Set();
    paymentKeys.forEach((k) => {
      const v = fees[k];
      if (!v) return;
      if (Array.isArray(v)) v.forEach((m) => modesSet.add(m));
      else modesSet.add(v);
    });
    if (modesSet.size > 0) {
      const modes = Array.from(modesSet).join(", ");
      result.push({ type: "payment", text: `Payment Mode: ${modes}` });
    }
    return result;
  }

  const flatSkipKeys = new Set([
    "feeCategories",
    "paymentMode",
    "paymentModes",
    "paymentModeOnline",
    "paymentModeOnlineMethods",
    "PaymentModeOnlineMethods",
    "PaymentModeOnline",
    "Payment_Mode_Online_Methods",
    "Payment Mode",
    "Payment Mode (Online)",
  ]);

  Object.entries(fees).forEach(([key, value]) => {
    if (flatSkipKeys.has(key)) return;
    if (value == null) return;
    if (typeof value === "object") return;
    if (isDummyValue(value)) return;
    result.push({ type: "normal", text: `${formatFeeKey(key)}: ${value}` });
  });

  const refundKeys = [
    "refundDetails",
    "feeRefund",
    "refundNote",
    "refundAmountCbtGeneralOBC",
    "refundAmountCbtScStEbcFemaleTransgender",
  ];
  refundKeys.forEach((key) => {
    if (fees[key] && !isDummyValue(fees[key])) {
      result.push({ type: "info", text: `Refund: ${fees[key]}` });
    }
  });

  const paymentKeys = [
    "paymentMode",
    "paymentModes",
    "paymentModeOnline",
    "paymentModeOnlineMethods",
    "PaymentModeOnlineMethods",
    "PaymentModeOnline",
    "Payment_Mode_Online_Methods",
    "Payment Mode",
    "Payment Mode (Online)",
  ];
  const modesSet = new Set();
  paymentKeys.forEach((k) => {
    const v = fees[k];
    if (!v) return;
    if (Array.isArray(v)) v.forEach((m) => modesSet.add(m));
    else modesSet.add(v);
  });
  if (modesSet.size > 0) {
    const modes = Array.from(modesSet).join(", ");
    result.push({ type: "payment", text: `Payment Mode: ${modes}` });
  }

  return result;
};


// --- AGE EXTRACTION ---
export const extractAge = (age) => {
  if (!age || typeof age !== "object") return { text: [], relaxation: "" };

  const result = [];

  // Minimum Age
  const minKeys = ["minimumAge", "minAge", "minimum", "Minimum Age", "Minimum_Age"];
  for (const key of minKeys) {
    if (age[key]) {
      result.push(`Minimum Age: ${age[key]}`);
      break;
    }
  }

  // Maximum Age (can be string or nested object)
  const maxKeys = ["maximumAge", "maxAge", "maximum", "Maximum Age", "Maximum_Age"];
  for (const key of maxKeys) {
    if (age[key]) {
      if (typeof age[key] === 'object') {
         Object.entries(age[key]).forEach(([k, v]) => {
             const label = k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
             result.push(`Max Age (${label}): ${v}`);
         });
      } else {
        result.push(`Maximum Age: ${age[key]}`);
      }
      break;
    }
  }

  // As On Date
  const asOnKeys = ["asOnDate", "ageAsOn", "asOn", "ageCalculationDate", "As On Date"];
  for (const key of asOnKeys) {
    if (age[key]) {
      result.push(`Age as on: ${age[key]}`);
      break;
    }
  }

  // Specific Post Age Limits (Iterate remaining keys)
  const excludeKeys = [...minKeys, ...maxKeys, ...asOnKeys, "ageRelaxation", "ageRelaxationDetails", "relaxation", "relaxationDetails", "notes", "Age Relaxation", "Age_Relaxation"];
  
  Object.keys(age).forEach(key => {
      if (!excludeKeys.includes(key)) {
          // Format key: "maximumAgeURMale" -> "Maximum Age UR Male"
          const label = key
            .replace(/([A-Z])/g, " $1")
            .replace(/_/g, " ")
            .replace(/^maximumAge/i, "Max Age")
            .replace(/^maxAge/i, "Max Age")
            .trim();
          
          if (typeof age[key] === 'string' || typeof age[key] === 'number') {
             result.push(`${label}: ${age[key]}`);
          }
      }
  });

  const relaxation =
    age.ageRelaxation || age.ageRelaxationDetails || age.relaxation ||
    age.relaxationDetails || age["Age Relaxation"] || age.Age_Relaxation || "";

  return { text: result, relaxation };
};

// --- VACANCY EXTRACTION ---
export const extractVacancy = (vacancy) => {
  if (!vacancy || typeof vacancy !== "object") {
    return { total: "See Notification", positions: [] };
  }

  const total =
    vacancy.totalPosts ||
    vacancy.total ||
    vacancy.totalVacancy ||
    vacancy.posts ||
    vacancy.totalPost ||
    vacancy.totalSeat ||
    "See Notification";

  let positions =
    vacancy.positions ||
    vacancy.postDetails ||
    vacancy.details ||
    vacancy.vacancies ||
    vacancy.postWiseDetails ||
    [];

  if (!Array.isArray(positions)) {
    positions = [];
  }

  const formatText = (text) => {
    if (!text) return "-";
    if (Array.isArray(text)) return text.join(", ");
    return String(text);
  };

  const buildCategoryLikeString = (pos) => {
    const cats = pos.categoryWise || pos.categories || pos.categorywise;

    if (cats) {
      if (Array.isArray(cats)) {
        const parts = cats
          .map((c) => {
            const cat =
              c.category ||
              c.cat ||
              c.name ||
              c.type ||
              c.group ||
              c.label;
            const val =
              c.posts ||
              c.post ||
              c.count ||
              c.total ||
              c.numberOfPosts ||
              c.noOfPost ||
              c.noOfPosts;
            if (!cat || val == null) return null;
            return `${cat}: ${val}`;
          })
          .filter(Boolean);
        if (parts.length) return parts.join(", ");
      } else if (typeof cats === "object") {
        const parts = Object.entries(cats)
          .map(([k, v]) => `${k}: ${v}`)
          .filter(Boolean);
        if (parts.length) return parts.join(", ");
      } else {
        return String(cats);
      }
    }

    const flatCatEntries = Object.entries(pos).filter(([k, v]) => {
      if (typeof v !== "number") return false;
      const key = k.toLowerCase();
      if (key === "male" || key === "female") return false;
      return /^(gen|general|obc|ews|sc|st|ebc|bc|ur|other|others|pwd|ph|third|category)/.test(
        key
      );
    });

    if (flatCatEntries.length) {
      return flatCatEntries.map(([k, v]) => `${k}: ${v}`).join(", ");
    }

    return null;
  };

  const normalizedPositions = positions.map((pos) => {
    const name =
      pos.postName ||
      pos.name ||
      pos.tradeName ||
      pos.positionName ||
      pos.postTitle ||
      pos.title ||
      "Various Post";

    let count =
      pos.total ||
      pos.posts ||
      pos.numberOfPosts ||
      pos.noOfPost ||
      pos.noOfPosts ||
      pos.count ||
      pos.totalPosts ||
      null;

    let genderStr = null;
    if (pos.male != null || pos.female != null) {
      const parts = [];
      if (pos.male != null) parts.push(`Male: ${pos.male}`);
      if (pos.female != null) parts.push(`Female: ${pos.female}`);
      genderStr = parts.join(", ");
    }

    const catStr = buildCategoryLikeString(pos);

    if (!count && genderStr) {
      count = genderStr;
    } else if (count && genderStr) {
      count = `${count} (${genderStr})`;
    }

    if (!count && catStr) {
      count = catStr;
    } else if (count && catStr) {
      count = `${count} (${catStr})`;
    }

    if (count == null) count = "-";

    const group =
      pos.group ||
      pos.category ||
      pos.type ||
      pos.level ||
      "-";

    const eligibility =
      pos.eligibility ||
      pos.eligibilityCriteria ||
      pos.qualification ||
      pos.education ||
      pos.educationalQualification ||
      pos.criteria ||
      pos.details ||
      "-";

    return {
      name: formatText(name),
      count: formatText(count),
      group: formatText(group),
      eligibility: formatText(eligibility),
    };
  });

  return { total, positions: normalizedPositions };
};



// --- ELIGIBILITY EXTRACTION ---
export const extractEligibility = (elig) => {
  if (!elig) return [];
  if (typeof elig === "string") return [{ type: "text", text: elig }];

  // Simple description keys
  const descKeys = ["description", "educationQualification", "educationalQualification", "Education Qualification", "qualification", "education", "Criteria"];
  for (const key of descKeys) {
      if (elig[key] && typeof elig[key] === 'string') {
          return [{ type: "text", text: elig[key] }];
      }
      if (elig[key] && Array.isArray(elig[key])) {
          return elig[key].map(item => ({ type: "listItem", text: item }));
      }
  }

  const result = [];

  Object.entries(elig).forEach(([key, value]) => {
    if (!value) return;

    // Skip generic keys handled above or metadata
    if (["detailsLink", "otherDetails", "otherQualifications", "other", "gender", "residency", "notes", "Exam Name"].includes(key)) {
      if (value && typeof value === "string") {
        result.push({ type: "info", text: value });
      } else if (Array.isArray(value)) {
         value.forEach(v => result.push({ type: "info", text: v }));
      }
      return;
    }

    // Format the key (e.g., "paper1" -> "Paper 1", "railwayPLWWelder" -> "Railway PLW Welder")
    const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/([0-9]+)/g, " $1 ") // Space around numbers
        .trim();

    if (Array.isArray(value)) {
      result.push({ type: "header", label: label });
      value.forEach((item) => {
        result.push({ type: "listItem", text: item });
      });
    } else if (typeof value === "string") {
      result.push({ type: "item", label: label, text: value });
    }
  });

  return result.length > 0 ? result : [{ type: "text", text: "Check official notification for full details." }];
};

export const extractLinks = (links) => {
  if (!links || typeof links !== "object") return [];

  const result = [];

  const isPlaceholder = (str) => {
    const s = String(str).trim().toLowerCase();
    if (!s) return true;
    return (
      s === "#" ||
      s === "-" ||
      s.includes("link activate soon") ||
      s.includes("coming soon") ||
      s.includes("update soon") ||
      s.includes("available soon") ||
      s.includes("notify later")
    );
  };

  const isLikelyUrl = (str) => {
    if (!str) return false;
    const s = String(str).trim();
    if (!s || isPlaceholder(s)) return false;
    if (/^(https?:\/\/|www\.)/i.test(s)) return true;
    if (/^https?[a-z0-9]/i.test(s) && s.includes(".")) return true;
    if (s.includes("/") && !s.includes(" ")) return true;
    if (s.includes(".pdf")) return true;
    return false;
  };

  const formatLabel = (key) => {
    let label = key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/url|link|href|text/gi, "")
      .trim();
    if (!label) label = "Link";
    return label.replace(/\s+/g, " ").trim();
  };

  const normalizeClickHereLabel = (baseLabel, textLabel) => {
    if (!textLabel) return baseLabel;
    const s = String(textLabel).trim();
    if (/^click here/i.test(s)) return baseLabel;
    return s;
  };

  const pushStringUrl = (label, value) => {
    const parts = String(value).trim().split(/\s+/);
    const urls = parts.filter(isLikelyUrl);
    urls.forEach((u, idx) => {
      result.push({
        label: urls.length > 1 ? `${label} (${idx + 1})` : label,
        url: u,
      });
    });
  };

  Object.entries(links).forEach(([key, value]) => {
    if (!value) return;

    const baseLabel = formatLabel(key);

    // 1) Value is plain string
    if (typeof value === "string") {
      if (isLikelyUrl(value)) {
        pushStringUrl(baseLabel, value);
      }
      return;
    }

    // 2) Value is Object with url/href (e.g. {text, url} / {text, href})
    if (!Array.isArray(value) && (value.url || value.href)) {
      const rawUrl = value.url || value.href;
      if (!isLikelyUrl(rawUrl)) return;
      const linkLabel = normalizeClickHereLabel(
        baseLabel,
        value.name || value.text
      );
      result.push({ label: linkLabel, url: rawUrl });
      return;
    }

    // 3) Value is Array (UPSSSC PET style / district lists)
    if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (!item) return;

        if (typeof item === "string") {
          if (isLikelyUrl(item)) {
            const lbl = `${baseLabel} (${idx + 1})`;
            pushStringUrl(lbl, item);
          }
          return;
        }

        const itemUrl =
          item.url || item.href || item.notificationLink || item.link;
        if (!isLikelyUrl(itemUrl)) return;

        const itemLabelRaw =
          item.name || item.text || item.districtName || `Link ${idx + 1}`;
        const itemLabel = normalizeClickHereLabel(baseLabel, itemLabelRaw);
        result.push({ label: `${baseLabel} (${itemLabel})`, url: itemUrl });
      });
      return;
    }

    // 4) Nested object: { eng: 'url', hindi: 'url' } OR { key: {text,url} }
    if (typeof value === "object") {
      Object.entries(value).forEach(([k, v]) => {
        const subKeyLabel = formatLabel(k);

        if (typeof v === "string") {
          if (!isLikelyUrl(v)) return;
          const lbl = `${baseLabel} - ${subKeyLabel}`;
          pushStringUrl(lbl, v);
        } else if (v && typeof v === "object") {
          const u = v.url || v.href;
          if (!isLikelyUrl(u)) return;
          const textLbl = normalizeClickHereLabel(
            subKeyLabel || baseLabel,
            v.name || v.text
          );
          const lbl = `${baseLabel} - ${textLbl}`;
          result.push({ label: lbl, url: u });
        }
      });
    }
  });

  return result;
};

// ============================================================================
// 2. REACT COMPONENTS (UI)
// ============================================================================

export const VacancyTable = ({ positions }) => {
  if (!positions || positions.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <Briefcase size={18} className="text-blue-600" />
        <h3 className="font-bold text-slate-800">Vacancy Details</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold">Post Name</th>
              <th className="px-4 py-3 font-semibold text-center">Group/Cat</th>
              <th className="px-4 py-3 font-semibold text-center">Total</th>
              <th className="px-4 py-3 font-semibold">Eligibility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {positions.map((pos, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-800">{pos.name}</td>
                <td className="px-4 py-3 text-center text-slate-600">{pos.group}</td>
                <td className="px-4 py-3 text-center font-bold text-blue-600 max-w-[150px] break-words">
                  {pos.count}
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-xs">{pos.eligibility}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ImportantDates = ({ dates }) => {
  if (!dates.length) return null;
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <Calendar size={18} className="text-blue-600" /> Important Dates
      </h3>
      <ul className="space-y-2 text-sm">
        {dates.map((date, idx) => {
          const [label, value] = date.split(": ");
          return (
            <li key={idx} className="flex justify-between items-start border-b border-dashed border-slate-100 pb-1 last:border-0">
              <span className="text-slate-500">{label}</span>
              <span className="font-medium text-slate-800 text-right">{value}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const ApplicationFees = ({ fees }) => {
  if (!fees.length) return null;
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center text-[10px] font-bold text-green-600">₹</div> 
        Application Fee
      </h3>
      <ul className="space-y-1.5 text-sm">
        {fees.map((item, idx) => {
          if (item.type === 'header') return <li key={idx} className="font-semibold text-slate-800 mt-2 border-b border-slate-100 pb-1">{item.text}</li>;
          if (item.type === 'payment') return <li key={idx} className="text-xs text-slate-400 mt-2 italic bg-slate-50 p-2 rounded">{item.text}</li>;
          if (item.type === 'info') return <li key={idx} className="text-xs text-orange-600 mt-1 flex gap-1"><Info size={12}/>{item.text}</li>;
          return (
            <li key={idx} className="flex justify-between items-center">
               <span className="text-slate-600">{item.text.split(":")[0]}</span>
               <span className="font-bold text-slate-800">{item.text.split(":")[1]}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const EligibilityCard = ({ eligibility }) => {
    if (!eligibility || eligibility.length === 0) return null;
    return (
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-blue-600" /> Eligibility
            </h3>
            <div className="space-y-3">
                {eligibility.map((item, idx) => (
                    <div key={idx}>
                        {item.type === 'header' && <h4 className="font-semibold text-sm text-blue-800 mb-1">{item.label}</h4>}
                        {item.type === 'item' && (
                            <div className="text-sm">
                                <span className="font-medium text-slate-700">{item.label}: </span>
                                <span className="text-slate-600">{item.text}</span>
                            </div>
                        )}
                        {item.type === 'listItem' && (
                            <div className="flex items-start gap-2 text-sm text-slate-600 ml-2">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0" />
                                <span>{item.text}</span>
                            </div>
                        )}
                        {item.type === 'text' && <p className="text-sm text-slate-600">{item.text}</p>}
                        {item.type === 'info' && <p className="text-xs text-slate-400 italic mt-1">{item.text}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ImportantLinks = ({ links }) => {
    if(!links.length) return null;
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <LinkIcon size={18} className="text-blue-600" /> Important Links
                </h3>
            </div>
            <div className="divide-y divide-slate-100">
                {links.map((link, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                        <span className="text-sm font-medium text-slate-700">{link.label}</span>
                        <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                            View <ChevronRight size={12}/>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- Loading & Error Skeletons ---
export const LoadingSkeleton = () => (
  <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
    <Loader size={40} className="text-blue-600 animate-spin mb-4" />
    <h2 className="text-lg font-semibold text-slate-700">Loading Job Details...</h2>
    <p className="text-slate-500 text-sm">Please wait while we fetch the latest information.</p>
  </div>
);

export const ErrorScreen = ({ error, navigate }) => (
  <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
    <div className="bg-red-50 p-4 rounded-full mb-4">
      <AlertCircle size={40} className="text-red-500" />
    </div>
    <h2 className="text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h2>
    <p className="text-slate-600 mb-6 max-w-md">{error || "We couldn't load the recruitment details. Please try again later."}</p>
    <button
      onClick={() => navigate(-1)}
      className="px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium text-sm"
    >
      Go Back
    </button>
  </div>
);