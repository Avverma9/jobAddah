import { NextResponse } from 'next/server';

export const getGovPostDetails = async (request) => {
  try {
    const sp = request.nextUrl.searchParams;
    const url = sp.get('url');
    const id = sp.get('id');

    if (!url && !id) {
      return NextResponse.json(
        { success: false, error: 'URL or ID is required' },
        { status: 400 }
      );
    }

    const scrapeResp = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/scrapper/scrape-complete`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url, id }),
        cache: 'no-store',
      }
    );

    let scrapeJson = null;
    try {
      scrapeJson = await scrapeResp.json();
    } catch (e) {
      scrapeJson = null;
    }

    if (scrapeJson && scrapeJson.success && scrapeJson.data) {
      return NextResponse.json({ success: true, data: scrapeJson.data }, { status: 200 });
    }

    if (scrapeJson) {
      const status = scrapeJson.status === 'PROCESSING' ? 202 : 200;
      return NextResponse.json(scrapeJson, { status });
    }

    return NextResponse.json(
      {
        success: false,
        status: 'PROCESSING',
        error: 'Scraping started, try again shortly.',
      },
      { status: 202 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
};

export async function GET(request) {
  return getGovPostDetails(request);
}
