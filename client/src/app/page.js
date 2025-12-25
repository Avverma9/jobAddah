import FavJobsPreview from "@/app/fav-jobs/page";
import Welcome from "./welcome/page";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main>
        <FavJobsPreview limit={3} />

        <Welcome />
  {/* spacing removed - empty container caused extra white space */}
      </main>
    </div>
  );
}
