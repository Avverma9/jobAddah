import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/db/connectDB";
import Post from "@/lib/models/job";

export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);

    /* ------------------ DAYS WINDOW ------------------ */
    const daysWindowRaw = Number(searchParams.get("days") ?? 2);
    const daysWindow = Number.isFinite(daysWindowRaw)
      ? Math.min(Math.max(daysWindowRaw, 1), 30)
      : 2;

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

    await connectDB();

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
      data: reminders,
      reminders,
      message:
        reminders.length === 0
          ? `No reminders within ${daysWindow} days`
          : `Found ${reminders.length} reminders`,
    };

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

