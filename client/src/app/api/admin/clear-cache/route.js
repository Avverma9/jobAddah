// app/api/admin/clear-cache/route.js
import { NextResponse } from "next/server";
import { clearCache } from "@/lib/cache";

export async function POST(request) {
  try {
    // 🗑️ Clear ALL caches (no security check)
    clearCache();

    return NextResponse.json({
      success: true,
      message: "All caches cleared successfully"
    });
  } catch (error) {
    console.error("Cache clear error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
