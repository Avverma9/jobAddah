import FavJobsPreview from "@/app/fav-jobs/page";
import Welcome from "./welcome/page";
import { HorizontalAd } from "@/components/ads/AdUnits";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main>
        {/* Top heading requested by user */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-lg sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-white to-green-700 bg-[length:200%_auto] animate-flag-flow py-2">
            India's Fast and Modern Job info app
          </h1>
        </div>

        {/* Ad after heading */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 w-full">
          <HorizontalAd className="w-full" />
        </div>

        <FavJobsPreview limit={3} />

        {/* Ad between sections */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 w-full">
          <HorizontalAd className="w-full" />
        </div>

        <Welcome />

        {/* Ad at bottom */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 w-full">
          <HorizontalAd className="w-full" />
        </div>

        {/* SEO Content Section - Critical for AdSense "Low Value Content" fix */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-slate-700">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              India's #1 Portal for Latest Government Jobs & Sarkari Naukri 2026
            </h2>
            <p className="mb-4 leading-relaxed">
              Welcome to <strong>JobsAddah</strong>, the most trusted and fastest-growing platform for government job seekers in India. We provide real-time updates on <strong>Sarkari Naukri</strong>, <strong>Sarkari Result</strong>, <strong>Admit Cards</strong>, and <strong>Answer Keys</strong>. Whether you are preparing for SSC, UPSC, Banking, Railway, or State-level exams, JobsAddah is your one-stop solution.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Why Choose JobsAddah?</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-600">
                  <li><strong>Fastest Updates:</strong> Get instant notifications for new job openings.</li>
                  <li><strong>Comprehensive Coverage:</strong> We cover Central and State Govt jobs across all sectors.</li>
                  <li><strong>User-Friendly Tools:</strong> Use our <a href="/image-tool" className="text-blue-600 hover:underline">Image Resizer</a>, <a href="/resume-maker" className="text-blue-600 hover:underline">Resume Maker</a>, and <a href="/typing-test" className="text-blue-600 hover:underline">Typing Test</a> tools for free.</li>
                  <li><strong>Accurate Information:</strong> We source data directly from official notifications.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Popular Categories</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-600">
                  <li><strong>SSC Exams:</strong> CGL, CHSL, MTS, GD Constable.</li>
                  <li><strong>Banking Jobs:</strong> IBPS PO, Clerk, SBI, RBI.</li>
                  <li><strong>Railway (RRB):</strong> NTPC, Group D, ALP.</li>
                  <li><strong>Defence:</strong> Army, Navy, Air Force, NDA, CDS.</li>
                  <li><strong>Teaching:</strong> CTET, UPTET, KVS, NVS.</li>
                </ul>
              </div>
            </div>
            
            <p className="mt-6 text-sm text-slate-500">
              Disclaimer: JobsAddah is an information aggregator and is not affiliated with any government organization. Please verify details from the official notifications linked in our posts.
            </p>
          </div>
        </section>

        {/* spacing removed - empty container caused extra white space */}
      </main>
    </div>
  );
}
