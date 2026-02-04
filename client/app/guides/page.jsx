export const metadata = {
  title: "Guides & Tips | JobsAddah",
  description:
    "Job preparation guides, salary insights, interview tips, and application help.",
};

const guideCards = [
  {
    title: "Interview Tips for Govt Jobs",
    desc: "Practical tips for written + interview stages, document prep, and verification.",
    href: "/guides/interview-tips",
  },
  {
    title: "Salary & Pay Scale Basics",
    desc: "Understand pay levels, grade pay, allowances, and take‑home estimates.",
    href: "/guides/salary-info",
  },
  {
    title: "How to Read a Notification",
    desc: "Break down eligibility, dates, fees, and selection process quickly.",
    href: "/guides/notification-reading",
  },
];

export default function GuidesIndex() {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Guides</h1>
          <p className="text-sm text-slate-600 mt-2">
            Practical help for preparation, application, and career planning.
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guideCards.map((card) => (
            <a
              key={card.href}
              href={card.href}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                {card.title}
              </h2>
              <p className="text-sm text-slate-600">{card.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
