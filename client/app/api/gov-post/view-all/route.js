import GovPostList from "../../../../lib/models/joblist";
import { connectDB } from "../../../../lib/db/connectDB";
import { NextResponse } from "next/server";

const fetchJobsByLink = async (link) => {
  await connectDB();

  let posts = [];
  if (link) {
    const safeLink = link.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");

    // Fetch all posts matching this link
    posts = await GovPostList.find({
      url: { $regex: "^" + safeLink, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .select("url jobs updatedAt createdAt")
      .lean();
  } else {
    // Fallback: return latest jobs across all sections
    posts = await GovPostList.find({})
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(25)
      .select("url jobs updatedAt createdAt")
      .lean();
  }

  // Flatten all jobs from all matching posts
  let allJobs = [];
  posts.forEach((post) => {
    if (post.jobs && post.jobs.length > 0) {
      const cleanedJobs = post.jobs.filter(
        (j) => j.title !== "Privacy Policy" && j.title !== "Sarkari Result",
      );
      allJobs = [...allJobs, ...cleanedJobs];
    }
  });

  // Remove duplicates if any (based on title and link)
  const uniqueJobs = Array.from(
    new Set(
      allJobs.map((j) => JSON.stringify({ title: j.title, link: j.link })),
    ),
  ).map((s) => JSON.parse(s));

  return uniqueJobs;
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const link = searchParams.get("link");

    const uniqueJobs = await fetchJobsByLink(link);
    return NextResponse.json({ success: true, data: uniqueJobs });
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
    const link = typeof body?.link === "string" ? body.link : "";

    const uniqueJobs = await fetchJobsByLink(link);
    return NextResponse.json({ success: true, data: uniqueJobs });
  } catch (error) {
    console.error("Error in view-all API:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
