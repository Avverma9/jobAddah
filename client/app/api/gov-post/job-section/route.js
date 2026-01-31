import Section from "../../../../lib/models/section";
import govPostList from "../../../../lib/models/joblist";
import { connectDB } from "../../../../lib/db/connectDB";
import { NextResponse } from "next/server";

export const getSectionsWithPosts = async () => {
  try {
    await connectDB();

    const sections = await Section.find()
      .select("url categories createdAt updatedAt")
      .lean();

    if (!sections.length) {
      return NextResponse.json({ success: true, count: 0, data: [] });
    }

    const promises = sections.map(async (sec) => {
      const categoriesWithData = await Promise.all(
        (sec.categories || []).map(async (cat) => {
          const link = cat.link?.trim();
          if (!link) return { ...cat, count: 0, data: [] };

          const safeLink = link.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");

          const posts = await govPostList
            .find({ url: { $regex: "^" + safeLink, $options: "i" } })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("url jobs updatedAt createdAt")
            .lean();

          const cleanedPosts = posts.map((post) => {
            if (post.jobs?.length) {
              post.jobs = post.jobs.filter(
                (j) => j.title !== "Privacy Policy" && j.title !== "Sarkari Result"
              );
            }
            return post;
          });

          return {
            name: cat.name,
            link,
            count: cleanedPosts.length,
            data: cleanedPosts,
          };
        })
      );

      return {
        _id: sec._id,
        url: sec.url,
        createdAt: sec.createdAt,
        updatedAt: sec.updatedAt,
        categories: categoriesWithData,
      };
    });

    const result = await Promise.all(promises);

    return NextResponse.json(
      { success: true, count: result.length, data: result },
      { status: 200 }
    );
  } catch (err) {
    console.error("getSectionsWithPosts error", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};

const getFullCategoryPosts = async (link) => {
  try {
    await connectDB();
    const safeLink = link.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
    const posts = await govPostList
      .find({ url: { $regex: "^" + safeLink, $options: "i" } })
      .sort({ createdAt: -1 })
      .select("url jobs updatedAt createdAt")
      .lean();

    let allJobs = [];
    posts.forEach((post) => {
      if (post.jobs?.length) {
        const cleaned = post.jobs.filter(
          (j) => j.title !== "Privacy Policy" && j.title !== "Sarkari Result"
        );
        allJobs = allJobs.concat(cleaned);
      }
    });

    const uniqueJobs = Array.from(
      new Set(allJobs.map((j) => JSON.stringify({ title: j.title, link: j.link })))
    ).map((s) => JSON.parse(s));

    return NextResponse.json({ success: true, data: uniqueJobs }, { status: 200 });
  } catch (err) {
    console.error("getFullCategoryPosts error", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const link = searchParams.get("link");

  // If link is provided, return full post list for that category (View More flow)
  if (link) {
    return getFullCategoryPosts(link);
  }

  return getSectionsWithPosts();
}
