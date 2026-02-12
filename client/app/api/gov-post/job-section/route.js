import Section from "../../../../lib/models/section";
import GovPostList from "../../../../lib/models/joblist";
import { connectDB } from "../../../../lib/db/connectDB";
import { NextResponse } from "next/server";
import { matchesCategory, toCategoryKey } from "@/lib/category-utils";

const cleanJobsList = (jobs) => {
  if (!Array.isArray(jobs)) return [];
  return jobs.filter(
    (j) => j && j.title !== "Privacy Policy" && j.title !== "Sarkari Result",
  );
};

const flattenUniqueJobs = (posts) => {
  let allJobs = [];
  posts.forEach((post) => {
    allJobs = allJobs.concat(cleanJobsList(post.jobs));
  });
  return Array.from(
    new Set(allJobs.map((j) => JSON.stringify({ title: j.title, link: j.link }))),
  ).map((s) => JSON.parse(s));
};

const queryPostsBySourceLink = async (sourceLink, limit = 0) => {
  if (!sourceLink) return [];
  const safeLink = sourceLink.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const query = GovPostList.find({ url: { $regex: "^" + safeLink, $options: "i" } })
    .sort({ createdAt: -1 })
    .select("url jobs updatedAt createdAt")
    .lean();

  if (limit > 0) query.limit(limit);
  return query;
};

const resolveCategoryFromSections = (sections, categoryQuery) => {
  if (!Array.isArray(sections) || !categoryQuery) return null;
  const query = String(categoryQuery).trim();
  if (!query) return null;

  for (const section of sections) {
    for (const cat of section.categories || []) {
      if (matchesCategory(cat?.name, query)) {
        return {
          name: cat.name,
          key: toCategoryKey(cat.name),
          link: String(cat.link || "").trim(),
        };
      }
    }
  }
  return null;
};

export const getSectionsWithPosts = async () => {
  try {
    await connectDB();

    const sections = await Section.find()
      .select("url categories createdAt updatedAt")
      .lean();

    if (!sections.length) {
      return NextResponse.json({ success: true, count: 0, data: [] });
    }

    const result = await Promise.all(
      sections.map(async (sec) => {
        const categoriesWithData = await Promise.all(
          (sec.categories || []).map(async (cat) => {
            const sourceLink = String(cat?.link || "").trim();
            if (!sourceLink) {
              return {
                name: cat?.name || "Category",
                key: toCategoryKey(cat?.name),
                count: 0,
                data: [],
              };
            }

            const posts = await queryPostsBySourceLink(sourceLink, 10);
            const cleanedPosts = posts.map((post) => ({
              ...post,
              jobs: cleanJobsList(post.jobs),
            }));

            return {
              name: cat.name,
              key: toCategoryKey(cat.name),
              count: cleanedPosts.length,
              data: cleanedPosts,
            };
          }),
        );

        return {
          _id: sec._id,
          url: sec.url,
          createdAt: sec.createdAt,
          updatedAt: sec.updatedAt,
          categories: categoriesWithData,
        };
      }),
    );

    return NextResponse.json(
      { success: true, count: result.length, data: result },
      { status: 200 },
    );
  } catch (err) {
    console.error("getSectionsWithPosts error", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
};

const getFullCategoryPosts = async (categoryQuery) => {
  try {
    await connectDB();

    const sections = await Section.find().select("categories").lean();
    const resolvedCategory = resolveCategoryFromSections(sections, categoryQuery);

    if (!resolvedCategory?.link) {
      return NextResponse.json(
        { success: true, category: null, data: [] },
        { status: 200 },
      );
    }

    const posts = await queryPostsBySourceLink(resolvedCategory.link);
    const uniqueJobs = flattenUniqueJobs(posts);

    return NextResponse.json(
      {
        success: true,
        category: { name: resolvedCategory.name, key: resolvedCategory.key },
        data: uniqueJobs,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("getFullCategoryPosts error", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || searchParams.get("name");

  if (category) {
    return getFullCategoryPosts(category);
  }

  return getSectionsWithPosts();
}
