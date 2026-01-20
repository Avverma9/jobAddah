import { connectDB } from '@/lib/db/connectDB';
import Post from '@/lib/models/job';
import joblist from '@/lib/models/joblist';
import { NextResponse } from 'next/server';


export const findByTitle = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!title || title.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Title must be at least 2 characters' },
        { status: 400 }
      );
    }

    const safeTitle = title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const titleRe = new RegExp(safeTitle, 'i');

    await connectDB();

    const [results1, results2] = await Promise.all([
      joblist
        .aggregate([
          { $match: { 'jobs.title': titleRe } },
          {
            $project: {
              _id: 1,
              url: 1,
              updatedAt: 1,
              jobs: {
                $map: {
                  input: {
                    $filter: {
                      input: '$jobs',
                      as: 'job',
                      cond: {
                        $regexMatch: { input: '$$job.title', regex: titleRe },
                      },
                    },
                  },
                  as: 'job',
                  in: {
                    title: '$$job.title',
                    url: '$$job.link',
                  },
                },
              },
            },
          },
          { $limit: limit },
        ])
        .allowDiskUse(false)
        .exec(),
      
      Post.find(
        { 'recruitment.title': titleRe },
        {
          _id: 1,
          url: 1,
          'recruitment.title': 1,
          'recruitment.organization.name': 1,
          'recruitment.organization.shortName': 1,
          'recruitment.status': 1,
          'recruitment.importantDates.applicationLastDate': 1,
          updatedAt: 1,
          fav: 1,
        }
      )
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean()
        .exec(),
    ]);

    const flattenedResults1 = results1.flatMap((doc) =>
      doc.jobs.map((job) => ({
        _id: doc._id,
        title: job.title,
        url: job.url,
        updatedAt: doc.updatedAt,
        source: 'govPostList',
      }))
    );

    const flattenedResults2 = results2.map((doc) => ({
      _id: doc._id,
      title: doc.recruitment?.title,
      organization:
        doc.recruitment?.organization?.shortName ||
        doc.recruitment?.organization?.name,
      status: doc.recruitment?.status,
      lastDate: doc.recruitment?.importantDates?.applicationLastDate,
      url: doc.url,
      updatedAt: doc.updatedAt,
      fav: doc.fav,
      source: 'Post',
    }));

    const combinedResults = [...flattenedResults1, ...flattenedResults2]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit * 2);

    return NextResponse.json({
      success: true,
      count: combinedResults.length,
      data: combinedResults,
    });
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
};

export async function GET(request) {
  return findByTitle(request);
}
