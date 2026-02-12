export const metadata = {
  title: "Editorial and Correction Policy | JobsAddah",
  description:
    "JobsAddah editorial policy for source verification, corrections, and update transparency on recruitment pages.",
};

const points = [
  "Official notice first: summaries are secondary to source PDFs and official portals.",
  "Date accuracy priority: application and exam timelines are reviewed before publication.",
  "Correction transparency: material fixes are updated with latest verification date.",
  "Ad clarity: sponsored placements must be clearly labeled as advertisement.",
  "User reports: correction requests are accepted through Contact with URL and screenshot.",
];

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Editorial and Correction Policy
          </h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            This policy explains how JobsAddah publishes recruitment updates and
            how corrections are handled to protect users from misinformation.
          </p>
        </header>

        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Editorial standards</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
            {points.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-3">How to report an issue</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            If you find a mismatch in dates, fees, eligibility, or official
            links, share the post URL and proof link from official source on the
            Contact page. Critical corrections are prioritized.
          </p>
        </section>
      </div>
    </div>
  );
}
