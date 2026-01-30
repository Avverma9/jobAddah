import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import { connectDB } from "@/lib/db/connectDB";
import Post from "@/lib/models/job";
import { extractRecruitmentData } from "@/util/post-helper";
import { getCleanPostUrl } from "@/lib/job-url";
import {
  Calendar,
  CheckCircle2,
  Briefcase,
  ChevronRight,
  BookOpen,
  Flame,
  MousePointer2,
} from "lucide-react";
import { generateJobPostingSchema } from "@/lib/seo-schemas";

const COMPETITOR_DOMAINS = [
  "sarkariresult.com",
  "sarkariresult.com.cm",
  "sarkariexam.com",
  "freejobalert.com",
  "jagranjosh.com",
];

const sanitizeLinks = (links) => {
  if (!Array.isArray(links)) return [];
  return links
    .filter((l) => l && typeof l === "object" && typeof l.url === "string")
    .map((l) => {
      const u = l.url.toLowerCase();
      const isCompetitor = COMPETITOR_DOMAINS.some((d) => u.includes(d));
      return isCompetitor ? { ...l, url: "https://jobsaddah.com" } : l;
    });
};

const cleanDateValue = (val) => {
  if (!val) return "To be announced";
  const v = String(val).trim();
  if (v.length > 50 || v.toLowerCase().includes("related"))
    return "Check Notification";
  return v;
};

const hasSubstantialContent = (detail) => {
  if (!detail) return false;
  const count = (arr) => (Array.isArray(arr) ? arr.filter(Boolean).length : 0);
  let score = 0;
  if (detail.title) score += 1;
  if (detail.organization) score += 1;
  if (count(detail.dates)) score += 1;
  if (count(detail.fees)) score += 1;
  if (count(detail.links)) score += 1;
  if (count(detail.vacancy?.positions)) score += 1;
  if (count(detail.selection)) score += 1;
  if (count(detail.eligibility)) score += 1;
  return score >= 4;
};

const getJobDetails = cache(async (slug) => {
  let targetPath = Array.isArray(slug) ? slug.join("/") : slug;
  if (!targetPath) return null;
  if (!targetPath.startsWith("/")) targetPath = "/" + targetPath;
  if (!targetPath.endsWith("/")) targetPath = targetPath + "/";

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const res = await fetch(`${apiUrl}/scrapper/scrape-complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: targetPath }),
      next: { revalidate: 3600 },
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/html")) return null;
    if (!res.ok) return null;

    const json = await res.json();
    return json?.success ? json.data : null;
  } catch {
    return null;
  }
});

async function getRelatedPosts() {
  try {
    await connectDB();
    const posts = await Post.aggregate([
      { $match: { fav: true } },
      { $sample: { size: 6 } },
      { $project: { "recruitment.title": 1, url: 1, link: 1 } },
    ]);
    return JSON.parse(JSON.stringify(posts));
  } catch {
    return [];
  }
}

function generateOverview(detail) {
  const org = detail.organization || "The Recruitment Board";
  const vacancy = detail.vacancy?.total || "various";
  const title = detail.title || "Government Job Opportunity";
  const lastDate =
    detail.dates?.find((d) => String(d).toLowerCase().includes("last date")) ||
    "the closing date";

  return (
    <>
      <p className="mb-4 text-lg">
        <strong>{org}</strong> has officially released the recruitment
        advertisement for <strong>{title}</strong>. This is a significant
        opportunity for candidates who are aspiring to join the government
        sector. The recruitment board has announced a total of{" "}
        <strong>{vacancy}</strong> vacancies for various posts. Eligible
        aspirants can now check the detailed notification, including the
        eligibility criteria, age limit, selection process, and important dates
        before applying.
      </p>
      <p className="mb-4">
        The online application process will be conducted through the official
        website. Interested aspirants are advised to read the complete
        notification carefully to avoid any mistakes during the application
        process. The application window is open for a limited time, and
        candidates must submit their forms before{" "}
        <strong>{typeof lastDate === "string" ? lastDate : "the deadline"}</strong>
        . Below, you will find a detailed breakdown of the recruitment process,
        including the direct link to apply, application fee structure, syllabus,
        and exam pattern.
      </p>
      <p>
        Securing a job in {org} is a prestigious achievement, offering stability
        and career growth. Ensure you prepare all necessary documents and meet
        the medical and physical standards (if applicable) required for the
        post. Read on for a comprehensive guide to this recruitment drive.
      </p>
    </>
  );
}

function generateDatesText(dates) {
  if (!Array.isArray(dates) || dates.length === 0) {
    return (
      <p>
        Dates for this recruitment have not been released yet. Please check back
        later.
      </p>
    );
  }

  const importantLines = dates
    .filter(Boolean)
    .map((d) => {
      const s = String(d);
      if (!s.includes(":")) return { label: "Important Date", val: s };
      const parts = s.split(":");
      const label = parts[0]?.trim() || "Important Date";
      const val = parts.slice(1).join(":");
      return { label, val: cleanDateValue(val) };
    });

  return (
    <div className="space-y-3">
      <p>
        Keeping track of important dates is crucial for every aspirant. Missing
        a deadline can result in disqualification. Here is the official
        schedule:
      </p>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {importantLines.map((item, i) => (
          <li
            key={i}
            className="flex justify-between items-center bg-white p-3 rounded border border-rose-100 shadow-sm"
          >
            <span className="font-semibold text-rose-700 text-sm w-1/2">
              {item.label}
            </span>
            <span className="font-bold text-slate-800 text-sm w-1/2 text-right">
              {item.val}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-slate-500 italic">
        Candidates are advised to complete their application process well before
        the last date to avoid last-minute server congestion.
      </p>
    </div>
  );
}

function generateFeesText(fees) {
  if (!Array.isArray(fees) || fees.length === 0) {
    return <p>Fee details are available in the official notification.</p>;
  }

  const validFees = fees
    .filter((f) => f?.text && typeof f.text === "string")
    .filter((f) => !f.text.toLowerCase().includes("payment method"));

  if (validFees.length === 0) {
    return <p>Fee details are available in the official notification.</p>;
  }

  return (
    <div className="space-y-3">
      <p>
        The application fee must be paid online via Net Banking, Debit Card, or
        Credit Card. The specific fee details for different categories are:
      </p>
      <ul className="list-disc pl-5 space-y-1 bg-white p-4 rounded-lg border border-slate-200">
        {validFees.map((f, i) => {
          const parts = f.text.match(/(.*?)[\-–:](.*)/);
          const cat = parts ? parts[1].trim() : "Category Fee";
          let amount = parts ? parts[2].trim() : f.text;
          if (!amount.includes("₹") && !Number.isNaN(Number(amount))) {
            amount = `₹${amount}`;
          }
          return (
            <li key={i}>
              <span className="font-semibold">{cat}:</span> {amount}
            </li>
          );
        })}
      </ul>
      <p className="text-sm bg-yellow-50 p-3 border border-yellow-200 rounded text-yellow-800 font-medium">
        Note: Fees once paid are generally non-refundable. Ensure you check your
        eligibility before making the payment.
      </p>
    </div>
  );
}

function generateSteps(detail) {
  const hasLinks = Array.isArray(detail.links) && detail.links.length > 0;
  return (
    <div className="space-y-4">
      <p>
        The application process is entirely online. Follow these step-by-step
        instructions to submit your application successfully:
      </p>
      <ol className="list-decimal pl-5 space-y-3 marker:font-bold marker:text-blue-600">
        <li>
          <strong>Visit the Official Website:</strong> Click on the apply link
          provided in the "Important Links" section below{" "}
          {hasLinks ? "" : "(if available)"} or visit the official website of
          the recruitment authority.
        </li>
        <li>
          <strong>Read the Notification:</strong> Download and read the official
          notification thoroughly to ensure you meet all eligibility criteria.
        </li>
        <li>
          <strong>Registration:</strong> Use "New Registration" if you are a
          first-time user to generate your credentials.
        </li>
        <li>
          <strong>Login & Fill Form:</strong> Fill in the application form with
          accurate details.
        </li>
        <li>
          <strong>Upload Documents:</strong> Upload photo, signature, and other
          required documents in the prescribed format.
        </li>
        <li>
          <strong>Fee Payment:</strong> Pay the fee using available online
          payment methods.
        </li>
        <li>
          <strong>Review & Submit:</strong> Preview your application and submit.
        </li>
        <li>
          <strong>Print Confirmation:</strong> Save/print the confirmation page
          for future reference.
        </li>
      </ol>
      <p className="text-sm bg-blue-50 p-3 rounded text-blue-800 italic">
        Tip: Keep your login credentials safe and regularly check the official
        website for updates.
      </p>
    </div>
  );
}

function generateSelectionProcess(selection) {
  if (!Array.isArray(selection) || selection.length === 0) {
    return (
      <p>The selection process details will be updated as per the official notification.</p>
    );
  }

  return (
    <div className="space-y-2">
      <p>The selection of candidates will be based on the following stages:</p>
      <ul className="list-disc pl-5 space-y-1">
        {selection.map((step, i) => {
          const txt =
            typeof step === "string"
              ? step
              : step?.name || step?.title || "";
          const safeTxt = String(txt || "")
            .replace(/_/g, " ")
            .trim();
          if (!safeTxt) return null;
          return (
            <li
              key={i}
              className="font-medium text-slate-800 capitalize"
            >
              {safeTxt}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawData = await getJobDetails(resolvedParams.slug);

  if (!rawData) return { title: "Job Details - JobsAddah" };

  const detail = extractRecruitmentData(rawData);
  const shouldIndex = hasSubstantialContent(detail);
  const title = `${detail.title} - Apply Online, Dates, Syllabus`;
  const desc = `Latest recruitment: ${detail.title}. Check eligibility, total ${
    detail.vacancy?.total || "posts"
  }, exam date, salary, and direct application link here.`;

  const slugPath = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug.join("/")
    : resolvedParams.slug;

  return {
    title: title.slice(0, 60),
    description: desc.slice(0, 160),
    alternates: { canonical: `/post/${slugPath}` },
    openGraph: { title, description: desc, type: "article" },
    robots: shouldIndex ? "index,follow" : "noindex,follow",
  };
}

export default async function JobDetailsPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  if (!slug) notFound();

  const [rawData, relatedPosts] = await Promise.all([
    getJobDetails(slug),
    getRelatedPosts(),
  ]);

  if (!rawData) notFound();

  const detail0 = extractRecruitmentData(rawData);
  const detail = { ...detail0, links: sanitizeLinks(detail0.links) };

  const recruitment = rawData.recruitment || {};
  const postDate = rawData.createdAt
    ? new Date(rawData.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recent";

  let salaryText = "As per rules";
  const salaryVal = detail.additionalDetails?.salary;
  if (salaryVal) {
    salaryText =
      typeof salaryVal === "object"
        ? Object.values(salaryVal).filter(Boolean).join(", ")
        : String(salaryVal);
  }

  const faqs = [
    {
      q: `What is the last date to apply for ${detail.organization}?`,
      a: `The last date to apply is ${
        recruitment.importantDates?.applicationLastDate ||
        "mentioned in the notification"
      }.`,
    },
    {
      q: `How many vacancies are available in ${detail.title}?`,
      a: `There are a total of ${detail.vacancy?.total || "multiple"} vacancies announced.`,
    },
    {
      q: `What is the age limit for this recruitment?`,
      a: detail.age?.text?.[0] || "Please check the official notification for detailed age criteria.",
    },
    {
      q: `Can I apply online?`,
      a: "Yes, candidates can apply online through the official link provided in the 'Important Links' section below.",
    },
  ];

  const positions = Array.isArray(detail.vacancy?.positions)
    ? detail.vacancy.positions
    : [];

  return (
    <article className="min-h-screen bg-slate-50 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateJobPostingSchema(detail)),
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <header className="border-b border-slate-100 pb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              {detail.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4 text-slate-500" /> {postDate}
              </span>
              <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                <Briefcase className="w-4 h-4 text-slate-500" />{" "}
                {detail.organization}
              </span>
              <span className="flex items-center gap-1 bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4" />{" "}
                {detail.vacancy?.total || "N/A"} Posts
              </span>
            </div>
          </header>

          <section className="prose max-w-none text-slate-700 leading-relaxed text-base md:text-lg">
            {generateOverview(detail)}
          </section>

          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-slate-800 pl-3">
              Preparing for the Recruitment
            </h2>
            {hasSubstantialContent(detail) ? (
              <div className="prose max-w-none text-slate-700 space-y-6">
              <p>
                Treat this notification as a living document. The dates, number of vacancies, and application conditions can shift slightly between the draft notification you see today and the final advertisement that opens for submissions. Bookmark this page, download the official PDF, and compare the terminology used here with the language on the issuing organization’s website before you start filling out any forms. Doing that extra cross-check keeps you clear of last-minute surprises and ensures that every claim in your application mirrors what the recruiters actually published.
              </p>
              <p>
                Eligibility is more than just the marks on your certificate. Consider not only the minimum educational qualification and age limit, but also domicile clauses, physical standards, and any reservations the body may use for specific districts or departments. Review the timeline of application windows and linking instructions with a calendar view, then note any documents that require certified copies, medical certificates, or self-attestation. A methodical checklist now prevents frantic scanning later when the online portal is live.
              </p>
              <p>
                Build a personal schedule that mirrors the recruitment milestones. Most Sarkari notifications open the form 10–14 days before the first deadline, so plan a rehearsal run where you log in to the portal, capture the form structure, and test uploading scans of your ID, experience proof, and signature. If you rely on a shared computer or cyber cafe, block out a slot well before the last date so you can submit comfortably even if the network slows down on the final day.
              </p>
              <p>
                Keep your documents organized in both digital and hard-copy folders. Maintain two copies of each certificate, one as a PDF and one as a photograph with consistent naming (e.g., "aadhaar-front.jpg"). That makes it easy to upload the right file during the online application and to present the same paperwork at the biometric or document-verification stage. If there are photographs or signatures with specifications, create them at a shop or printer that understands the requirement—JobsAddah regularly highlights those dimension notes so you do not lose points due to an incorrectly sized photo.
              </p>
              <p>
                When the admit card or hall ticket is released, revisit this page to review the contest details while keeping track of new updates via the reminder component on the right. Maintaining calm focus amid the noise of notification updates helps you read every instruction and margin note, which is where the real preparation advantage lies. A collected mindset prevents mistakes like choosing the wrong category or missing a question about preferable centres.
              </p>
              <p>
                JobsAddah surfaces data from multiple scraped sources, but you can reinforce it by using the reminder alerts, trending- jobs feed, and the search bar at the top to quickly jump from this notification to complementary job listings. See the “Important Links” table below for direct application portals, syllabus outlines, and download instructions so you can keep all information under the same roof. Together, these steps build the 800+ words of context you need for a well-informed, confident application.
              </p>
              <p>
                Finally, when you print this page or save it as a PDF, make a note of the reference number and the exact slug so you can refer to the same URL when the admit card is issued. A consistent URL makes it easier to share this notification with mentors, coaches, or peers, and it also helps search engines anchor the page in their index by following the canonical `/post/${Array.isArray(slug) ? slug.join("/") : slug}` path that everyone already uses on JobsAddah.
              </p>
            </div>
            ) : (
              <div className="prose max-w-none text-slate-700">
                <p>
                  This page is awaiting verified recruitment details. Please
                  check the official notification in the Important Links
                  section and revisit once the full data has been published.
                </p>
              </div>
            )}
          </section>

          <section className="scroll-mt-20" id="dates">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-rose-600 pl-3">
              Important Dates
            </h2>
            <div className="bg-rose-50/50 p-6 rounded-xl border border-rose-100">
              {generateDatesText(detail.dates)}
            </div>
          </section>

          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-green-600 pl-3">
              Application Fee
            </h2>
            <div className="prose max-w-none text-slate-700">
              {generateFeesText(detail.fees)}
            </div>
          </section>

          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-blue-600 pl-3">
              Vacancy Details & Eligibility
            </h2>
            <p className="mb-4 text-slate-700">
              The eligibility criteria including educational qualification and
              age limit are strictly enforced. The detailed vacancy distribution
              is as follows:
            </p>

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-900 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="p-4 border-b border-slate-200">Post Name</th>
                    <th className="p-4 border-b border-slate-200 text-center">
                      Total
                    </th>
                    <th className="p-4 border-b border-slate-200">
                      Qualification
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {positions.length > 0 ? (
                    positions.map((pos, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-rose-700 align-top">
                          {pos?.name || "Post"}
                        </td>
                        <td className="p-4 font-black text-center align-top text-slate-800">
                          {pos?.count ?? "-"}
                        </td>
                        <td className="p-4 text-slate-600 align-top leading-relaxed">
                          {pos?.qualification || "As per notification"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-4 text-slate-600" colSpan={3}>
                        Vacancy breakup will be updated as per notification.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-purple-600 pl-3">
              Selection Process
            </h2>
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 text-slate-700">
              {generateSelectionProcess(detail.selection)}
              <p className="mt-3 text-sm">
                For detailed exam pattern and syllabus, please refer to the
                official notification.
              </p>
            </div>
          </section>

          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-yellow-500 pl-3">
              Salary & Benefits
            </h2>
            <div className="prose max-w-none text-slate-700">
              <p>
                Candidates selected for the post of{" "}
                <strong>
                  {detail.vacancy?.positions?.[0]?.name || "various roles"}
                </strong>{" "}
                will receive a salary as per the recruiting body norms.
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                Expected Pay Scale: {salaryText}
              </p>
            </div>
          </section>

          <section className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
              How to Apply
            </h2>
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
              {generateSteps(detail)}
            </div>
          </section>

          <section id="links" className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-rose-600 pl-3">
              Important Links
            </h2>
            <div className="grid gap-4">
              {detail.links?.length ? (
                detail.links.map((link, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-5 border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all group"
                  >
                    <span className="font-bold text-slate-700 mb-3 sm:mb-0 text-lg group-hover:text-blue-700 transition-colors">
                      {link.label || "Link"}
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-rose-600 transition-colors"
                    >
                      Click Here <MousePointer2 size={18} />
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-sm">
                  Links will be updated soon.
                </div>
              )}
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BookOpen className="text-blue-600" /> Frequently Asked Questions
              (FAQs)
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group border border-slate-200 rounded-lg bg-slate-50 open:bg-white open:shadow-sm transition-all duration-200"
                >
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-bold text-slate-800 select-none">
                    {faq.q}
                    <div className="text-slate-400 group-open:rotate-180 transition-transform duration-200">
                      <ChevronRight />
                    </div>
                  </summary>
                  <div className="px-4 pb-4 text-slate-600 leading-relaxed border-t border-slate-100 pt-4 animate-in fade-in slide-in-from-top-2">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-rose-100 rounded-xl shadow-sm p-6 sticky top-24">
            <div className="mb-6 flex items-center gap-2 text-rose-600 font-bold uppercase tracking-wider text-sm border-b pb-2">
              <Flame className="w-5 h-5" /> Quick Updates
            </div>

            {relatedPosts.length > 0 ? (
              <ul className="space-y-4">
                {relatedPosts.map((post, i) => {
                  const url = getCleanPostUrl(post.url || post.link);
                  const title = post.recruitment?.title || "Latest Gov Job Update";
                  if (!url) return null;
                  return (
                    <li key={i} className="group">
                      <Link href={url} className="block">
                        <span className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                          {title}
                        </span>
                        <div className="mt-1 flex items-center text-xs text-rose-500 font-bold group-hover:translate-x-1 transition-transform">
                          Check Now <ChevronRight className="w-3 h-3 ml-1" />
                        </div>
                      </Link>
                      {i !== relatedPosts.length - 1 && (
                        <hr className="mt-3 border-slate-50" />
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No trending updates.
              </div>
            )}

            <div className="mt-8 bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-xs font-bold text-blue-800 mb-2">
                JOIN OUR COMMUNITY
              </p>
              <p className="text-xs text-blue-600 mb-3">
                Get daily updates via Telegram
              </p>
              <div className="inline-block bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full cursor-pointer hover:bg-blue-700">
                Join Telegram
              </div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
