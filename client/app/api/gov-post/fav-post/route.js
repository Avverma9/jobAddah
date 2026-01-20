import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/db/connectDB";
import Post from "@/lib/models/job";

export const GET = async (request) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await connectDB();

    // Automatically un-favorite posts that have expired
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

    // Fetch all currently active favorite posts
    const validFavs = await Post.find({ fav: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { 
        success: true, 
        count: validFavs.length, 
        data: validFavs 
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("getFavPosts error:", err);
    return NextResponse.json(
      { 
        success: false, 
        message: err.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
};

