export const metadata = {
  title: "Interview Tips | JobsAddah Guides",
  description:
    "Interview preparation tips for government job recruitment stages.",
};

export default function InterviewTips() {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Interview Tips for Govt Jobs
        </h1>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
          <li>Read the official notification and job description carefully.</li>
          <li>Prepare documents in advance (ID, certificates, photos).</li>
          <li>Practice basic questions related to role and organization.</li>
          <li>Be clear about your eligibility and reservation category.</li>
          <li>Maintain calm and answer with clarity.</li>
        </ul>
      </div>
    </div>
  );
}
