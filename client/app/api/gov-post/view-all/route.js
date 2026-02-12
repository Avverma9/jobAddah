import GovPostList from "../../../../lib/models/joblist";
import Section from "../../../../lib/models/section";
import { connectDB } from "../../../../lib/db/connectDB";
import { NextResponse } from "next/server";
import { matchesCategory, toCategoryKey } from "@/lib/category-utils";

const cleanJobsList = (jobs) => {
  if (!Array.isArray(jobs)) return [];
  return jobs.filter(
    (j) => j && j.title !== "Privacy Policy" && j.title !== "Sarkari Result",
  );
};

const dedupeJobs = (jobs) =>
  Array.from(
    new Set(jobs.map((j) => JSON.stringify({ title: j.title, link: j.link }))),
  ).map((s) => JSON.parse(s));

const resolveCategoryLink = async (categoryInput) => {
  const query = String(categoryInput || "").trim();
  if (!query) return null;

  const sections = await Section.find().select("categories").lean();
  for (const section of sections) {
    for (const cat of section.categories || []) {
      if (matchesCategory(cat?.name, query)) {
        const link = String(cat.link || "").trim();
        if (!link) return null;
        return {
          name: cat.name,
          key: toCategoryKey(cat.name),
          link,
        };
      }
    }
  }
  return null;
};

const queryPostsByCategoryLink = async (categoryLink) => {
  const safeLink = categoryLink.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return GovPostList.find({
    url: { $regex: "^" + safeLink, $options: "i" },
  })
    .sort({ createdAt: -1 })
    .select("url jobs updatedAt createdAt")
    .lean();
};

const fetchJobs = async (categoryInput) => {
  await connectDB();

  if (categoryInput) {
    const category = await resolveCategoryLink(categoryInput);
    if (!category?.link) {
      return { jobs: [], category: null };
    }

    const posts = await queryPostsByCategoryLink(category.link);
    const allJobs = posts.flatMap((post) => cleanJobsList(post.jobs));
    return { jobs: dedupeJobs(allJobs), category: { name: category.name, key: category.key } };
  }

  const posts = await GovPostList.find({})
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(25)
    .select("url jobs updatedAt createdAt")
    .lean();

  const allJobs = posts.flatMap((post) => cleanJobsList(post.jobs));
  return { jobs: dedupeJobs(allJobs), category: null };
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || searchParams.get("name") || "";
    const { jobs, category: resolved } = await fetchJobs(category);
    return NextResponse.json({ success: true, category: resolved, data: jobs });
  } catch (error) {
    console.error("Error in view-all API:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const category =
      typeof body?.category === "string"
        ? body.category
        : typeof body?.name === "string"
          ? body.name
          : "";

    const { jobs, category: resolved } = await fetchJobs(category);
    return NextResponse.json({ success: true, category: resolved, data: jobs });
  } catch (error) {
    console.error("Error in view-all API:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
