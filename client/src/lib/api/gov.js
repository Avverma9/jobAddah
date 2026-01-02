import { NextResponse } from "next/server";
import connect from "@/lib/mongodb";
import govPostList from "@/lib/models/gov/joblist";
import Post from "@/lib/models/gov/job";
import Section from "@/lib/models/gov/section";
import { getCache, setCache, clearCache } from "@/lib/cache";

// Cache keys and TTLs
const CACHE_KEYS = {
  SECTIONS_WITH_POSTS: "sections-with-posts",
  ALL_SECTIONS: "all-sections",
  FAV_POSTS: "fav-posts",
  POST_BY_URL: "post-by-url:", // prefix
  SECTION_POSTS: "section-posts:", // prefix
  REMINDERS: "reminders:", // prefix
  SEARCH: "search:", // prefix
};

const CACHE_TTL = {
  LONG: 600, // 10 minutes - rarely changes
  MEDIUM: 300, // 5 minutes - normal
  SHORT: 120, // 2 minutes - frequently changes
  SEARCH: 180, // 3 minutes - search results
};

// ==================== GET POST DETAILS ====================
export const getGovPostDetails = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    let url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    try {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        const parsed = new URL(url);
        url = parsed.pathname;
      }
    } catch (e) {}

    url = url.trim();

    // 🚀 Check cache
    const cacheKey = `${CACHE_KEYS.POST_BY_URL}${url}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached }, { status: 200 });
    }


    await connect();
    const getData = await Post.findOne({ url }).sort({ createdAt: -1 }).lean();

    if (!getData) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // 💾 Cache the result
    setCache(cacheKey, getData, CACHE_TTL.LONG);

    return NextResponse.json({ success: true, data: getData }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
};

// ==================== GET ALL SECTIONS ====================
export const getGovJobSections = async (request) => {
  try {
    // 🚀 Check cache
    const cached = getCache(CACHE_KEYS.ALL_SECTIONS);
    if (cached) {
      return NextResponse.json(
        { success: true, count: cached.length, data: cached },
        { status: 200 }
      );
    }

    await connect();
    const getData = await Section.find().sort({ createdAt: -1 }).lean();

    // 💾 Cache the result
    setCache(CACHE_KEYS.ALL_SECTIONS, getData, CACHE_TTL.LONG);

    return NextResponse.json(
      { success: true, count: getData.length, data: getData },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
};

// ==================== GET POSTS BY SECTION ====================
export const getGovPostListBySection = async (request, { params }) => {
  try {
    const url = params.url;

    // 🚀 Check cache
    const cacheKey = `${CACHE_KEYS.SECTION_POSTS}${url}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json(
        { success: true, count: cached.length, data: cached },
        { status: 200 }
      );
    }


    await connect();

    const getData = await govPostList.aggregate([
      { $match: { section: url } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          section: 1,
          createdAt: 1,
          updatedAt: 1,
          url: 1,
          jobs: {
            $filter: {
              input: "$jobs",
              as: "job",
              cond: {
                $and: [
                  { $ne: ["$$job.title", "Privacy Policy"] },
                  { $ne: ["$$job.title", "Sarkari Result"] },
                ],
              },
            },
          },
        },
      },
    ]);

    // 💾 Cache the result
    setCache(cacheKey, getData, CACHE_TTL.MEDIUM);

    return NextResponse.json(
      { success: true, count: getData.length, data: getData },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
};

// ==================== GET SECTIONS WITH POSTS ====================
export const getSectionsWithPosts = async () => {
  try {
    // 🚀 Check cache first
    const cached = getCache(CACHE_KEYS.SECTIONS_WITH_POSTS);
    if (cached) {
      return NextResponse.json({
        success: true,
        count: cached.length,
        data: cached,
      });
    }


    await connect();

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

          const safeLink = link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

          const posts = await govPostList
            .find({ url: { $regex: "^" + safeLink, $options: "i" } })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("url jobs updatedAt createdAt")
            .lean();

          const cleanedPosts = posts.map((post) => {
            if (post.jobs?.length) {
              post.jobs = post.jobs.filter(
                (j) =>
                  j.title !== "Privacy Policy" && j.title !== "Sarkari Result"
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

    // 💾 Store in cache
    setCache(CACHE_KEYS.SECTIONS_WITH_POSTS, result, CACHE_TTL.MEDIUM);

    return NextResponse.json(
      {
        success: true,
        count: result.length,
        data: result,
      },
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

// ==================== GET FAVORITE POSTS ====================
export const getFavPosts = async (request) => {
  try {
    // 🚀 Check cache
    const cached = getCache(CACHE_KEYS.FAV_POSTS);
    if (cached) {
      return NextResponse.json(
        { success: true, count: cached.length, data: cached },
        { status: 200 }
      );
    }


    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await connect();

    await Post.updateMany(
      {
        fav: true,
        $expr: {
          $lt: [
            {
              $dateFromString: {
                dateString: {
                  $trim: {
                    input: {
                      $ifNull: [
                        {
                          $ifNull: [
                            "$recruitment.importantDates.applicationLastDate",
                            "$recruitment.importantDates.lastDate",
                          ],
                        },
                        "",
                      ],
                    },
                  },
                },
                onError: new Date("2099-12-31"),
                onNull: new Date("2099-12-31"),
              },
            },
            today,
          ],
        },
      },
      { $set: { fav: false } }
    );

    const validFavs = await Post.find({ fav: true })
      .sort({ createdAt: -1 })
      .lean();

    // 💾 Cache for shorter duration (favorites change frequently)
    setCache(CACHE_KEYS.FAV_POSTS, validFavs, CACHE_TTL.SHORT);

    return NextResponse.json(
      { success: true, count: validFavs.length, data: validFavs },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
};

// ==================== GET REMINDERS ====================
export const getReminders = async (request) => {
  try {
    const { searchParams } = new URL(request.url);

    /* ------------------ DAYS WINDOW ------------------ */
    const daysWindowRaw = Number(searchParams.get("days") ?? 2);
    const daysWindow = Number.isFinite(daysWindowRaw)
      ? Math.min(Math.max(daysWindowRaw, 1), 30)
      : 2;

    /* ------------------ CACHE ------------------ */
    const cacheKey = `${CACHE_KEYS.REMINDERS}_${daysWindow}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    /* ------------------ DATE RANGE ------------------ */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + daysWindow);
    endDate.setHours(23, 59, 59, 999);

    /* ------------------ DATE FIELDS ------------------ */
    const dateFields = [
      "$recruitment.importantDates.applicationLastDate",
      "$recruitment.importantDates.applicationEndDate",
      "$recruitment.importantDates.lastDateToApplyOnline",
      "$recruitment.importantDates.onlineApplyLastDate",
      "$recruitment.importantDates.lastDateOfRegistration",
      "$recruitment.importantDates.lastDate",
    ];

    await connect();

    /* ================== AGGREGATION ================== */
    const reminders = await Post.aggregate([
      /* ---------- Base Fields ---------- */
      {
        $project: {
          _id: 1,
          url: 1,
          title: "$recruitment.title",
          organization: "$recruitment.organization.name",
          totalPosts: "$recruitment.vacancyDetails.totalPosts",
          rawDates: dateFields,
          createdAt: 1,
        },
      },

      /* ---------- Parse + Filter Dates ---------- */
      {
        $addFields: {
          parsedDates: {
            $filter: {
              input: {
                $map: {
                  input: "$rawDates",
                  as: "d",
                  in: {
                    $dateFromString: {
                      dateString: { $trim: { input: "$$d" } },
                      onError: null,
                      onNull: null,
                    },
                  },
                },
              },
              as: "pd",
              cond: {
                $and: [
                  { $ne: ["$$pd", null] },
                  { $gte: ["$$pd", today] },
                  { $lte: ["$$pd", endDate] },
                ],
              },
            },
          },
        },
      },

      /* ---------- Must have at least one valid date ---------- */
      {
        $match: {
          "parsedDates.0": { $exists: true },
        },
      },

      /* ---------- Pick Nearest Date ---------- */
      {
        $addFields: {
          applicationLastDate: { $min: "$parsedDates" },
        },
      },

      /* ---------- Days Left ---------- */
      {
        $addFields: {
          daysLeft: {
            $ceil: {
              $divide: [
                { $subtract: ["$applicationLastDate", today] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },

      /* ---------- Sort by urgency ---------- */
      { $sort: { daysLeft: 1, createdAt: -1 } },

      /* =================================================
         🔥 DEDUPLICATION LAYER (MOST IMPORTANT)
         ================================================= */
      {
        $group: {
          _id: {
            organization: "$organization",
            applicationLastDate: "$applicationLastDate",
            totalPosts: "$totalPosts",
          },
          reminder: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$reminder" },
      },

      /* ---------- Final Shape ---------- */
      {
        $project: {
          _id: 1,
          url: 1,
          title: { $ifNull: ["$title", "Untitled"] },
          organization: { $ifNull: ["$organization", "N/A"] },
          totalPosts: { $ifNull: ["$totalPosts", 0] },
          applicationLastDate: 1,
          daysLeft: 1,
        },
      },

      { $sort: { daysLeft: 1 } },
      { $limit: 50 },
    ]);

    /* ------------------ RESPONSE ------------------ */
    const response = {
      success: true,
      count: reminders.length,
      reminders,
      message:
        reminders.length === 0
          ? `No reminders within ${daysWindow} days`
          : `Found ${reminders.length} reminders`,
    };

    /* ------------------ CACHE SAVE ------------------ */
    setCache(cacheKey, response, CACHE_TTL.SHORT);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("getReminders error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch reminders",
      },
      { status: 500 }
    );
  }
};


// ==================== FIX URLS (No caching - admin function) ====================
function stripDomain(url) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    let path = parsed.pathname.trim();
    if (!path.startsWith("/")) path = "/" + path;
    if (!path.endsWith("/")) path = path + "/";
    return path;
  } catch (err) {
    let clean = url.trim();
    if (!clean.startsWith("/")) clean = "/" + clean;
    if (!clean.endsWith("/")) clean = clean + "/";
    return clean;
  }
}

export const fixAllUrls = async (request) => {
  try {
    await connect();
    const posts = await Post.find({}, { url: 1 }).lean();

    const bulkOps = [];

    for (const post of posts) {
      const cleaned = stripDomain(post.url);
      if (post.url !== cleaned) {
        bulkOps.push({
          updateOne: {
            filter: { _id: post._id },
            update: { $set: { url: cleaned } },
          },
        });
      }
    }

    let updatedCount = 0;
    if (bulkOps.length > 0) {
      const res = await Post.bulkWrite(bulkOps);
      updatedCount = res.modifiedCount || 0;
    }

    // 🗑️ Clear all caches after URL fix
    clearCache();

    return NextResponse.json(
      {
        success: true,
        updated: updatedCount,
        message: "All URLs normalized successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
};

// ==================== SEARCH BY TITLE ====================
export const findByTitle = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title");

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    // 🚀 Check cache (cache by search query)
    const cacheKey = `${CACHE_KEYS.SEARCH}${title.toLowerCase().trim()}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }


    const safeTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const titleRe = new RegExp(safeTitle, "i");

    await connect();

    const [results1, results2] = await Promise.all([
      govPostList
        .aggregate([
          { $match: { "jobs.title": titleRe } },
          {
            $project: {
              _id: 1,
              url: 1,
              updatedAt: 1,
              jobs: {
                $filter: {
                  input: "$jobs",
                  as: "job",
                  cond: {
                    $regexMatch: { input: "$$job.title", regex: titleRe },
                  },
                },
              },
            },
          },
          { $limit: 20 },
        ])
        .exec(),
      Post.find(
        { "recruitment.title": titleRe },
        { _id: 1, url: 1, recruitment: 1, updatedAt: 1, fav: 1 }
      )
        .limit(20)
        .lean(),
    ]);

    const combinedResults = [...results1, ...results2];

    // 💾 Cache search results
    setCache(cacheKey, combinedResults, CACHE_TTL.SEARCH);

    return NextResponse.json({ success: true, data: combinedResults });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
};
