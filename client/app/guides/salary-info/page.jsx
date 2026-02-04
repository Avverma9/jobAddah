export const metadata = {
  title: "Salary & Pay Scale | JobsAddah Guides",
  description:
    "Understand government job pay levels, allowances, and take‑home salary basics.",
};

export default function SalaryInfo() {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Salary & Pay Scale Basics
        </h1>
        <p className="text-sm text-slate-700 leading-relaxed">
          Government jobs usually follow pay levels with DA, HRA, and other
          allowances. Always verify exact pay in the official notification.
        </p>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
          <li>Check pay level and grade pay (if mentioned).</li>
          <li>Allowances vary by city category and department.</li>
          <li>Take‑home salary differs after deductions.</li>
        </ul>
      </div>
    </div>
  );
}
