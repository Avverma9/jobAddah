import VlogSpotlight from "@/components/VlogSpotlight";

export const metadata = {
  title: "Why JobsAddah Is Reliable | JobsAddah Guides",
  description:
    "Learn how JobsAddah keeps Sarkari job updates accurate and easy to follow for aspirants.",
};

export default function WhyJobsAddahGuide() {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            JobsAddah Reliability Guide
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            A quick overview of how we compile, verify, and structure job
            updates for aspirants.
          </p>
        </header>
        <VlogSpotlight />
      </div>
    </div>
  );
}
