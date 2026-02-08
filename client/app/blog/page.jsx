import Link from "next/link";

export const metadata = {
  title: "Blog | JobsAddah",
  description:
    "Latest updates, preparation tips, and career articles for job seekers.",
};

const posts = [
  // Tracking + Planning
  {
    title: "How to Track Govt Job Deadlines (Without Missing Forms)",
    desc: "A simple weekly checklist + reminders system for every recruitment.",
    slug: "track-govt-job-deadlines",
    category: "Planning",
    tags: ["deadlines", "tracker", "reminders"],
  },
  {
    title: "Create a One-Page Exam Dashboard in Google Sheets",
    desc: "Track forms, fees, admit cards, and results in one place.",
    slug: "one-page-exam-dashboard-sheets",
    category: "Planning",
    tags: ["sheets", "tracker", "workflow"],
  },
  {
    title: "30-60-90 Day Study Plan for Beginners",
    desc: "A practical roadmap that works across SSC/Bank/Railway exams.",
    slug: "30-60-90-study-plan",
    category: "Strategy",
    tags: ["study-plan", "beginner"],
  },
  {
    title: "How to Make a Study Timetable (Even If You Work/Study)",
    desc: "Time blocks, revision slots, and realistic daily targets.",
    slug: "study-timetable-working-aspirants",
    category: "Strategy",
    tags: ["timetable", "time-management"],
  },
  {
    title: "Revision System: 1-3-7-15 Rule Explained",
    desc: "A clean revision cycle to retain GK, formulas, and concepts.",
    slug: "revision-1-3-7-15-rule",
    category: "Strategy",
    tags: ["revision", "memory"],
  },

  // Forms + Applications
  {
    title: "Top Mistakes in Online Applications (And How to Fix Them)",
    desc: "Common errors that cause rejection: preview, details, and uploads.",
    slug: "top-online-application-mistakes",
    category: "Applications",
    tags: ["form-fill", "common-mistakes"],
  },
  {
    title: "Complete Document Checklist Before You Apply",
    desc: "Keep PDFs/photos ready: IDs, certificates, and basic proofs.",
    slug: "document-checklist-before-apply",
    category: "Applications",
    tags: ["documents", "checklist"],
  },
  {
    title: "Fee Payment Failed? What to Do Next",
    desc: "Steps to confirm status, retry safely, and avoid double payments.",
    slug: "fee-payment-failed-what-to-do",
    category: "Applications",
    tags: ["payment", "troubleshoot"],
  },
  {
    title: "How to Choose Post Preference & Zone Preference",
    desc: "A simple strategy to avoid regret after final submission.",
    slug: "post-zone-preference-strategy",
    category: "Applications",
    tags: ["preference", "strategy"],
  },
  {
    title: "OTR / One-Time Registration: How to Keep It Clean",
    desc: "Avoid mismatches by locking your core profile details early.",
    slug: "otr-one-time-registration-tips",
    category: "Applications",
    tags: ["otr", "profile"],
  },

  // Eligibility + Rules
  {
    title: "Eligibility Basics: Age, Education, Attempt Count",
    desc: "Understand eligibility before you waste time on forms.",
    slug: "eligibility-basics-age-education",
    category: "Eligibility",
    tags: ["eligibility", "rules"],
  },
  {
    title: "How to Calculate Age for Govt Exams (Correctly)",
    desc: "Date-cutoff logic + common mistakes while counting age.",
    slug: "age-calculation-govt-exams",
    category: "Eligibility",
    tags: ["age-limit", "cutoff-date"],
  },
  {
    title: "Reservation Basics: SC/ST/OBC/EWS Explained Simply",
    desc: "What changes in age-relaxation, fees, and cutoffs.",
    slug: "reservation-basics-sc-st-obc-ews",
    category: "Eligibility",
    tags: ["reservation", "ews"],
  },
  {
    title: "Domicile Certificate: When You Need It",
    desc: "State-level forms and where domicile matters most.",
    slug: "domicile-certificate-when-needed",
    category: "Eligibility",
    tags: ["domicile", "state-jobs"],
  },

  // Admit Card + Exam Day
  {
    title: "Admit Card Checklist: What to Verify Immediately",
    desc: "Name, photo, exam city, shift time, and instructions.",
    slug: "admit-card-checklist",
    category: "Exam Day",
    tags: ["admit-card", "checklist"],
  },
  {
    title: "What to Carry on Exam Day (Do’s & Don’ts)",
    desc: "Avoid last-minute stress with a simple carry list.",
    slug: "what-to-carry-exam-day",
    category: "Exam Day",
    tags: ["exam-day", "rules"],
  },
  {
    title: "How to Avoid Silly Mistakes in the Exam Hall",
    desc: "Bubbling errors, section selection, and time traps.",
    slug: "avoid-silly-mistakes-exam-hall",
    category: "Exam Day",
    tags: ["accuracy", "time"],
  },

  // Answer Key + Result
  {
    title: "Answer Key: How to Calculate Your Score Fast",
    desc: "A quick method to estimate score and decide next steps.",
    slug: "answer-key-score-calculate",
    category: "Results",
    tags: ["answer-key", "score"],
  },
  {
    title: "Cutoff Basics: How Cutoffs Actually Work",
    desc: "Normalization, vacancies, and competition explained.",
    slug: "cutoff-basics-explained",
    category: "Results",
    tags: ["cutoff", "analysis"],
  },
  {
    title: "Result आने के बाद क्या करें? Next Step Checklist",
    desc: "Document prep, DV readiness, and next exam planning.",
    slug: "after-result-next-step-checklist",
    category: "Results",
    tags: ["result", "next-steps"],
  },

  // Core Prep (Quant/Reasoning/English/GK)
  {
    title: "Quant Speed: How to Improve Calculation Fast",
    desc: "Daily drills that improve speed without losing accuracy.",
    slug: "quant-speed-improvement",
    category: "Preparation",
    tags: ["quant", "speed"],
  },
  {
    title: "Reasoning Practice Plan (15-30 Minutes Daily)",
    desc: "A micro-plan to build consistency and confidence.",
    slug: "reasoning-practice-plan",
    category: "Preparation",
    tags: ["reasoning", "practice"],
  },
  {
    title: "English: How to Improve Vocabulary for Exams",
    desc: "Smart word lists + revision method that sticks.",
    slug: "english-vocabulary-for-exams",
    category: "Preparation",
    tags: ["english", "vocabulary"],
  },
  {
    title: "GK/GS Notes: How to Make Short Notes That Revise Fast",
    desc: "Use one-page notes + bookmarks for quick revision.",
    slug: "gk-short-notes-method",
    category: "Preparation",
    tags: ["gk", "notes"],
  },
  {
    title: "Mock Tests: The Right Way to Analyze Mistakes",
    desc: "Error log + weak-topic mapping to improve score steadily.",
    slug: "mock-test-analysis-method",
    category: "Preparation",
    tags: ["mock-test", "analysis"],
  },

  // Resume + Career
  {
    title: "Resume Basics for Govt Jobs",
    desc: "Keep your resume clean, compliant, and easy to verify.",
    slug: "resume-basics-govt-jobs",
    category: "Career",
    tags: ["resume", "format"],
  },
  {
    title: "How to Write a Simple Bio for Application Portals",
    desc: "A short, correct summary that fits most portals.",
    slug: "simple-bio-for-portals",
    category: "Career",
    tags: ["profile", "bio"],
  },
  {
    title: "Govt Job vs Private Job: How to Decide for Yourself",
    desc: "A decision framework (without hype).",
    slug: "govt-vs-private-decision",
    category: "Career",
    tags: ["career", "decision"],
  },

  // Interview + DV
  {
    title: "Document Verification (DV) Checklist",
    desc: "Originals, photocopies, photo IDs, and common gotchas.",
    slug: "document-verification-checklist",
    category: "DV & Interview",
    tags: ["dv", "documents"],
  },
  {
    title: "Basic Interview Questions for Govt Posts",
    desc: "Your intro, strengths, background, and calm answering tips.",
    slug: "basic-interview-questions-govt",
    category: "DV & Interview",
    tags: ["interview", "tips"],
  },

  // Motivation + Productivity
  {
    title: "How to Stay Consistent When You Feel Demotivated",
    desc: "A simple system: small targets + visible progress.",
    slug: "stay-consistent-demotivated",
    category: "Mindset",
    tags: ["motivation", "consistency"],
  },
  {
    title: "Burnout से कैसे बचें (Govt Exam Preparation)",
    desc: "Rest, revision balance, and realistic expectations.",
    slug: "avoid-burnout-govt-exams",
    category: "Mindset",
    tags: ["burnout", "health"],
  },
  {
    title: "Phone Distraction Control for Students",
    desc: "Practical settings and habits to reduce doom-scrolling.",
    slug: "phone-distraction-control",
    category: "Productivity",
    tags: ["focus", "habits"],
  },

  // Exam-specific (generic but useful)
  {
    title: "SSC Preparation Starter Pack",
    desc: "Syllabus-first strategy + daily practice structure.",
    slug: "ssc-preparation-starter-pack",
    category: "Exam Guides",
    tags: ["ssc", "starter"],
  },
  {
    title: "Bank Exam Preparation Starter Pack",
    desc: "Speed + accuracy + mocks: a clean plan for beginners.",
    slug: "bank-exam-prep-starter-pack",
    category: "Exam Guides",
    tags: ["bank", "starter"],
  },
  {
    title: "Railway Exam Preparation Starter Pack",
    desc: "How to cover basics and practice smartly.",
    slug: "railway-exam-prep-starter-pack",
    category: "Exam Guides",
    tags: ["railway", "starter"],
  },
  {
    title: "Teaching/TET Preparation Starter Pack",
    desc: "Concept clarity + pedagogy + revision approach.",
    slug: "tet-prep-starter-pack",
    category: "Exam Guides",
    tags: ["tet", "teaching"],
  },

  // Website-friendly evergreen content
  {
    title: "How to Read a Recruitment Notification Properly",
    desc: "Vacancy, eligibility, dates, selection process—what to check.",
    slug: "read-recruitment-notification",
    category: "Basics",
    tags: ["notification", "basics"],
  },
  {
    title: "Selection Process Explained: CBT, PET, DV, Medical",
    desc: "Understand each stage so you plan preparation correctly.",
    slug: "selection-process-explained",
    category: "Basics",
    tags: ["selection-process", "stages"],
  },
  {
    title: "Syllabus Strategy: Start With High-Weight Topics",
    desc: "Score-first approach without ignoring fundamentals.",
    slug: "syllabus-strategy-high-weight",
    category: "Strategy",
    tags: ["syllabus", "priority"],
  },
  {
    title: "Previous Year Papers: How Many & How to Use",
    desc: "A method to turn PYQs into a scoring weapon.",
    slug: "previous-year-papers-how-to-use",
    category: "Preparation",
    tags: ["pyq", "practice"],
  },
  {
    title: "Daily Current Affairs Plan (15 Minutes)",
    desc: "Short routine + weekly revision to stay updated.",
    slug: "daily-current-affairs-plan",
    category: "Preparation",
    tags: ["current-affairs", "routine"],
  },

  // More quick hitters (add volume)
  {
    title: "How to Build an Error Log Notebook",
    desc: "Track mistakes and fix patterns quickly.",
    slug: "error-log-notebook",
    category: "Preparation",
    tags: ["error-log", "improvement"],
  },
  {
    title: "Guesswork vs Smart Elimination in MCQs",
    desc: "Reduce negative marking with elimination rules.",
    slug: "smart-elimination-mcqs",
    category: "Preparation",
    tags: ["mcq", "negative-marking"],
  },
  {
    title: "Negative Marking: Simple Risk Management",
    desc: "When to attempt and when to skip.",
    slug: "negative-marking-risk-management",
    category: "Strategy",
    tags: ["negative-marking", "strategy"],
  },
  {
    title: "How to Improve Reading Comprehension",
    desc: "A daily practice method that shows results.",
    slug: "improve-reading-comprehension",
    category: "Preparation",
    tags: ["english", "rc"],
  },
  {
    title: "Math Formulas: A One-Page Formula Sheet Method",
    desc: "Build compact sheets and revise daily.",
    slug: "one-page-formula-sheet",
    category: "Preparation",
    tags: ["formulas", "revision"],
  },
  {
    title: "Exam City Travel Plan (Budget + Timing)",
    desc: "Reach on time with less stress and smart packing.",
    slug: "exam-city-travel-plan",
    category: "Exam Day",
    tags: ["travel", "planning"],
  },
  {
    title: "Photo/Signature Upload: Common Rejection Reasons",
    desc: "Clarity, background, and correct file handling tips.",
    slug: "photo-signature-upload-common-issues",
    category: "Applications",
    tags: ["photo", "signature"],
  },
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Blog</h1>
          <p className="text-sm text-slate-600 mt-2">
            News, tips, and guides to keep you ready for exams and recruitment.
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-slate-600">{post.desc}</p>
              <div className="text-xs text-slate-500 mt-3">{post.category}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
