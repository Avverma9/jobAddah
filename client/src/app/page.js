import FavJobsPreview from "@/app/fav-jobs/page";
import Welcome from "./welcome/page";

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

        <FavJobsPreview limit={3} />

        <Welcome />
        {/* spacing removed - empty container caused extra white space */}
      </main>
    </div>
  );
}
