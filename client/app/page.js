import ReminderCard from "./component/home/ReminderCard";
import SectionGrid from "./component/home/SectionGrid";
import ToolsCard from "./component/home/ToolsCard";
import TrendingCard from "./component/home/TrendingCard";
import { buildSectionHref } from "./lib/sectionRouting";
import { buildMetadata, toAbsoluteUrl } from "./lib/seo";
import { getHomePageData } from "./lib/server-home-data";
import { SITE_NAME } from "./lib/site-config";

export const metadata = buildMetadata({
  title: "Latest Sarkari Result and Government Jobs",
  description:
    "Get verified Sarkari Naukri updates, admit cards, answer keys, results, and deadline alerts for SSC, Railway, Bank, UPSC, and state recruitment exams.",
  path: "/",
  keywords: [
    "jobsaddah",
    "sarkari result today",
    "latest govt jobs india",
    "admit card download",
    "answer key updates",
  ],
});

export default async function Home() {
  const { trendingItems, deadlineItems, sections, postsByMegaTitle } = await getHomePageData();
  const sectionListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Government Job Sections",
    itemListElement: sections.slice(0, 12).map((section, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: String(section?.title || section?.megaTitle || "Section").trim(),
      url: toAbsoluteUrl(buildSectionHref(section?.megaTitle || section?.title || "latest jobs")),
    })),
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: toAbsoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${toAbsoluteUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sectionListSchema) }}
      />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <TrendingCard items={trendingItems} />
        <ReminderCard items={deadlineItems} />
        <ToolsCard />
        <SectionGrid initialSections={sections} initialPostsByMegaTitle={postsByMegaTitle} />
      </main>
    </div>
  );
}
