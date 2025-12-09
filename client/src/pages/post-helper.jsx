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

  // 1. Handle Array-based Fee Categories (KVS/NVS style)
  if (fees.feeCategories && Array.isArray(fees.feeCategories)) {
    fees.feeCategories.forEach((catItem) => {
      if (catItem.category) {
        result.push({ type: "header", text: catItem.category });
      }
      Object.entries(catItem).forEach(([key, value]) => {
        if (key !== "category") {
          const formattedKey = key.replace(/_/g, " / ").replace(/([A-Z])/g, " $1").trim();
          result.push({ type: "item", text: `${formattedKey}: ${value}` });
        }
      });
    });
    // Handle payment mode if present in sibling key
    if (fees.paymentMode) {
       const modes = Array.isArray(fees.paymentMode) ? fees.paymentMode.join(", ") : fees.paymentMode;
       result.push({ type: "payment", text: `Payment Mode: ${modes}` });
    }
    return result;
  }

  // 2. Handle Nested Object Structure (HSSC, UPDELED, UPPSC style)
  const nestedKeys = [
    { key: "withPPP_Aadhaar", label: "With PPP/Aadhaar:" },
    { key: "withoutPPP_Aadhaar", label: "Without PPP/Aadhaar:" },
    { key: "categoryFees", label: "Category Fees:" },
    { key: "paper1", label: "Paper I Only:" },
    { key: "bothPapers", label: "Both Paper I & II:" },
    { key: "categories", label: "Application Fee:" },
  ];

  let hasNested = false;
  nestedKeys.forEach(({ key, label }) => {
    if (fees[key]) {
      hasNested = true;
      result.push({ type: "header", text: label });
      Object.entries(fees[key]).forEach(([subKey, subValue]) => {
        const formattedKey = subKey.replace(/_/g, " / ").replace(/([A-Z])/g, " $1").trim();
        result.push({ type: "item", text: `${formattedKey}: ${subValue}` });
      });
    }
  });

  if (hasNested) {
     // Check for payment mode at root level even if nested fees exist
     const pMode = fees.paymentMode || fees.paymentModes || fees.paymentModeOnline || fees.Payment_Mode_Online_Methods || fees["Payment Mode"] || fees["Payment Mode (Online)"];
     if (pMode) {
        const modes = Array.isArray(pMode) ? pMode.join(", ") : pMode;
        result.push({ type: "payment", text: `Payment Mode: ${modes}` });
     }
     return result;
  }

  // 3. Handle Flat Fee Structure (Most Common)
  const feeKeys = [
    "General/OBC", "SC/ST", "PH", "General/ OBC/ EWS", "SC/ ST/ Female", "PH Candidates",
    "generalEWSBCEBCJharkhandDomicile", "scStJharkhandDomicile", "allCategoryOtherState",
    "general", "obc", "ews", "sc", "st", "ph", "female", "generalOBC_EWS", "scStFemale",
    "generalEwsObc", "scStPh", "generalObcEws", "scStEbc", "scStPwbdExServiceman",
    "generalEwsObcCreamyLayer", "ewsObcNonCreamyLayer", "ewsObcNonCreamy",
    "General_OBC_EWS", "SC_ST_PH_ESM", "general_obc_ews", "sc_st", "sc_st_pwd",
    "General_EWS_OBC", "SC_ST_PH", "All_Category_Female", "generalOtherState", "mpReserveCategory",
    "scSt_femaleBihar", "exServiceCandidates", "scst_EBC", "allCandidates", "forAllCandidates",
    "feeDetails", "otherStateCandidates", "chhattisgarhDomicileAllCategories", "correctionCharge",
    "correctionChargeFirstTime", "correctionChargeSecondTime", "applicationEditModificationCharge",
    "portalCharge", "firstTimeLateFeeCharge", "secondTimeLateFeeCharge", "General/OBC", "SC/ST", "PH"
  ];

  // Helper to format keys
  const formatFeeKey = (key) => {
      // Custom mapping for complex keys
      if (key === 'generalEWSBCEBCJharkhandDomicile') return 'Gen/EWS/BC/EBC (Jharkhand)';
      if (key === 'scStJharkhandDomicile') return 'SC/ST (Jharkhand)';
      if (key === 'allCategoryOtherState') return 'Other State Candidates';
      if (key === 'generalEwsObcCreamyLayer') return 'Gen/EWS/OBC (Creamy)';
      if (key === 'ewsObcNonCreamyLayer' || key === 'ewsObcNonCreamy') return 'EWS/OBC (Non-Creamy)';
      
      return key
        .replace(/_/g, " / ")
        .replace(/([a-z])([A-Z])/g, "$1 / $2") // Split CamelCase
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

  feeKeys.forEach(key => {
      if (fees[key] !== undefined && fees[key] !== null) {
          result.push({ type: "normal", text: `${formatFeeKey(key)}: ${fees[key]}` });
      }
  });
  
  // Refund Keys
  ["refundDetails", "feeRefund", "refundNote", "refundAmountCbtGeneralOBC", "refundAmountCbtScStEbcFemaleTransgender"].forEach(key => {
      if (fees[key]) result.push({ type: "info", text: `Refund: ${fees[key]}` });
  });

  // Payment Modes
  const paymentModes = fees.paymentMode || fees.paymentModes || fees.paymentModeOnline || fees.Payment_Mode_Online_Methods || fees["Payment Mode"] || fees["Payment Mode (Online)"];
  if (paymentModes) {
    const modes = Array.isArray(paymentModes) ? paymentModes.join(", ") : paymentModes;
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
    vacancy.totalPosts || vacancy.total || vacancy.totalVacancy ||
    vacancy.posts || "See Notification";

  let positions =
    vacancy.positions || vacancy.postDetails || vacancy.details ||
    vacancy.vacancies || [];

  if (!Array.isArray(positions)) {
    positions = [];
  }

  // Normalize position objects for the table
  const normalizedPositions = positions.map(pos => {
      // Find Name
      const name = pos.postName || pos.name || pos.tradeName || pos.positionName || "Various Post";
      
      // Find Count/Total
      let count = pos.total || pos.posts || pos.numberOfPosts || pos.noOfPost || pos.count || pos.noOfPosts || "-";
      
      // Handle nested category counts (e.g., SSC GD, UP Home Guard)
      if (typeof count === 'object' || pos.categoryWise || pos.categories) {
          const cats = count.categoryWise || pos.categoryWise || pos.categories || count; // Fallback if count is the object
          if (typeof cats === 'object') {
             // Create a string representation: "Gen: 10, OBC: 5..."
             count = Object.entries(cats)
               .map(([k, v]) => `${k}: ${v}`)
               .join(", ");
          }
      }
      
      // Find Group/Category
      const group = pos.group || pos.category || "-";
      
      // Find Eligibility
      const eligibility = pos.eligibility || pos.eligibilityCriteria || pos.qualification || pos.education || "-";

      return { name, count, group, eligibility };
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

// --- LINKS EXTRACTION ---
export const extractLinks = (links) => {
  if (!links || typeof links !== "object") return [];

  const result = [];

  Object.entries(links).forEach(([key, value]) => {
    if (!value) return;

    // Format Label
    const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/url|link|href/gi, "") // Remove 'link' or 'url' from label
        .trim();

    // 1. Value is String (Direct URL)
    if (typeof value === "string") {
      result.push({ label, url: value });
    } 
    // 2. Value is Object with text/url (e.g., {text: "Click Here", url: "..."})
    else if (value.url || value.href) {
      const linkLabel = value.text && value.text.length < 50 ? value.text : label; // Use text if short, else key
      result.push({ label: linkLabel === "Click Here" ? label : linkLabel, url: value.url || value.href });
    }
    // 3. Value is Array of Objects (e.g., Download Result: [{text: Link1...}, {text: Link2...}])
    else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        const itemLabel = item.name || item.text || item.districtName || `Link ${idx + 1}`;
        const itemUrl = item.url || item.href || item.notificationLink;
        if (itemUrl) {
            result.push({ label: `${label} (${itemLabel})`, url: itemUrl });
        }
      });
    }
    // 4. Value is Nested Object (e.g., officialNotification: {english: url, hindi: url})
    else if (typeof value === "object") {
        Object.entries(value).forEach(([k, v]) => {
            if (typeof v === "string") {
                result.push({ label: `${label} - ${k}`, url: v });
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