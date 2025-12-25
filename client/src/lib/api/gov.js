import { NextResponse } from 'next/server'
import connect from '@/lib/mongodb'
import govPostList from '@/lib/models/gov/joblist'
import Post from '@/lib/models/gov/job'
import Section from '@/lib/models/gov/section'

export const getGovPostDetails = async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    let url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 })
    }

    try {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const parsed = new URL(url)
        url = parsed.pathname
      }
    } catch (e) {}

    url = url.trim()

    await connect()
    const getData = await Post.findOne({ url }).sort({ createdAt: -1 }).lean()

    if (!getData) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: getData }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 })
  }
}

export const getGovJobSections = async (request) => {
  try {
    await connect()
    const getData = await Section.find().sort({ createdAt: -1 }).lean()

    return NextResponse.json({ success: true, count: getData.length, data: getData }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 })
  }
}

export const getGovPostListBySection = async (request, { params }) => {
  try {
    const url = params.url
    await connect()

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
              input: '$jobs',
              as: 'job',
              cond: {
                $and: [
                  { $ne: ['$$job.title', 'Privacy Policy'] },
                  { $ne: ['$$job.title', 'Sarkari Result'] },
                ],
              },
            },
          },
        },
      },
    ])

    return NextResponse.json({ success: true, count: getData.length, data: getData }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 })
  }
}

export const getSectionsWithPosts = async () => {
  try {
    await connect();

    // 1. Fetch Sections
    const sections = await Section.find()
      .select('url categories createdAt updatedAt')
      .lean();

    if (!sections.length) {
      return NextResponse.json({ success: true, count: 0, data: [] });
    }

    // 2. Prepare Unique Links & Fetch in Parallel
    // We fetch data SPECIFICALLY for each category with a limit.
    // This avoids fetching 5000 records when you only need 50.
    const promises = sections.map(async (sec) => {
      const categoriesWithData = await Promise.all(
        (sec.categories || []).map(async (cat) => {
          const link = cat.link?.trim();
          
          if (!link) return { ...cat, count: 0, data: [] };

          // ESCAPE REGEX for safety
          const safeLink = link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

          // ⚡ FAST QUERY: Use Index + Limit
          // Only fetch top 10 posts for this section.
          // Remove .limit(10) if you TRULY need to show 1000s of posts on one page (not recommended).
          const posts = await govPostList
            .find({ url: { $regex: '^' + safeLink, $options: 'i' } }) 
            .sort({ createdAt: -1 })
            .limit(10) // <--- THIS IS THE KEY SPEED FIX
            .select('url jobs updatedAt createdAt') // Fetch only needed fields
            .lean();

          // Clean up jobs array
          const cleanedPosts = posts.map(post => {
            if (post.jobs?.length) {
              post.jobs = post.jobs.filter(
                (j) => j.title !== 'Privacy Policy' && j.title !== 'Sarkari Result'
              );
            }
            return post;
          });

          return {
            name: cat.name,
            link,
            count: cleanedPosts.length,
            data: cleanedPosts
          };
        })
      );

      return {
        _id: sec._id,
        url: sec.url,
        createdAt: sec.createdAt,
        updatedAt: sec.updatedAt,
        categories: categoriesWithData
      };
    });

    const result = await Promise.all(promises);

    return NextResponse.json({ success: true, count: result.length, data: result }, { status: 200 });
  } catch (err) {
    console.error('getSectionsWithPosts error', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const getFavPosts = async (request) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dateFields = [
      'recruitment.importantDates.applicationLastDate',
      'recruitment.importantDates.applicationEndDate',
      'recruitment.importantDates.lastDateToApplyOnline',
      'recruitment.importantDates.onlineApplyLastDate',
      'recruitment.importantDates.lastDateOfRegistration',
      'recruitment.importantDates.lastDate',
    ]

    await connect()

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
                        { $ifNull: ['$recruitment.importantDates.applicationLastDate', '$recruitment.importantDates.lastDate'] },
                        '',
                      ],
                    },
                  },
                },
                onError: new Date('2099-12-31'),
                onNull: new Date('2099-12-31'),
              },
            },
            today,
          ],
        },
      },
      { $set: { fav: false } }
    )

    const validFavs = await Post.find({ fav: true }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ success: true, count: validFavs.length, data: validFavs }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Internal server error' }, { status: 500 })
  }
}

export const getReminders = async (request) => {
  try {
    const { searchParams } = new URL(request.url)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const daysWindowRaw = Number(searchParams.get('days') ?? 2)
    const daysWindow = Number.isFinite(daysWindowRaw) ? Math.min(Math.max(daysWindowRaw, 1), 30) : 2

    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + daysWindow)
    endDate.setHours(23, 59, 59, 999)

    const dateFields = [
      'recruitment.importantDates.applicationLastDate',
      'recruitment.importantDates.applicationEndDate',
      'recruitment.importantDates.lastDateToApplyOnline',
      'recruitment.importantDates.onlineApplyLastDate',
      'recruitment.importantDates.lastDateOfRegistration',
      'recruitment.importantDates.lastDate',
    ]

    await connect()

    const reminders = await Post.aggregate([
      {
        $project: {
          _id: 1,
          url: 1,
          title: '$recruitment.title',
          organization: '$recruitment.organization.name',
          totalPosts: '$recruitment.vacancyDetails.totalPosts',
          datesToCheck: dateFields.map((field) => `$${field}`),
        },
      },
      { $unwind: { path: '$datesToCheck', preserveNullAndEmptyArrays: false } },
      { $match: { datesToCheck: { $type: 'string', $ne: '' } } },
      {
        $addFields: {
          parsedDate: {
            $dateFromString: { dateString: { $trim: { input: '$datesToCheck' } }, onError: null, onNull: null },
          },
        },
      },
      { $match: { parsedDate: { $gte: today, $lte: endDate } } },
      {
        $project: {
          _id: 1,
          title: { $ifNull: ['$title', 'Untitled'] },
          organization: { $ifNull: ['$organization', 'N/A'] },
          applicationLastDate: '$datesToCheck',
          totalPosts: { $ifNull: ['$totalPosts', 0] },
          url: 1,
          daysLeft: {
            $ceil: { $divide: [{ $subtract: ['$parsedDate', today] }, 1000 * 60 * 60 * 24] },
          },
        },
      },
      { $sort: { daysLeft: 1 } },
      { $limit: 100 },
    ])

    return NextResponse.json(
      {
        success: true,
        count: reminders.length,
        reminders,
        message: reminders.length === 0 ? `No reminders within ${daysWindow} days` : `Found ${reminders.length} reminders`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch reminders' }, { status: 500 })
  }
}

function stripDomain(url) {
  if (!url) return url
  try {
    const parsed = new URL(url)
    let path = parsed.pathname.trim()
    if (!path.startsWith('/')) path = '/' + path
    if (!path.endsWith('/')) path = path + '/'
    return path
  } catch (err) {
    let clean = url.trim()
    if (!clean.startsWith('/')) clean = '/' + clean
    if (!clean.endsWith('/')) clean = clean + '/'
    return clean
  }
}

export const fixAllUrls = async (request) => {
  try {
    await connect()
    const posts = await Post.find({}, { url: 1 }).lean()

    const bulkOps = []

    for (const post of posts) {
      const cleaned = stripDomain(post.url)
      if (post.url !== cleaned) {
        bulkOps.push({ updateOne: { filter: { _id: post._id }, update: { $set: { url: cleaned } } } })
      }
    }

    let updatedCount = 0
    if (bulkOps.length > 0) {
      const res = await Post.bulkWrite(bulkOps)
      updatedCount = res.modifiedCount || 0
    }

    return NextResponse.json({ success: true, updated: updatedCount, message: 'All URLs normalized successfully' }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export const findByTitle = async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title')

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
    }

    const safeTitle = title.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')
    const titleRe = new RegExp(safeTitle, 'i')

    await connect()

    const [results1, results2] = await Promise.all([
      govPostList
        .aggregate([
          { $match: { 'jobs.title': titleRe } },
          {
            $project: {
              _id: 1,
              url: 1,
              updatedAt: 1,
              jobs: { $filter: { input: '$jobs', as: 'job', cond: { $regexMatch: { input: '$$job.title', regex: titleRe } } } },
            },
          },
          { $limit: 20 },
        ])
        .exec(),
      Post.find({ 'recruitment.title': titleRe }, { _id: 1, url: 1, recruitment: 1, updatedAt: 1, fav: 1 }).limit(20).lean(),
    ])

    const combinedResults = [...results1, ...results2]

    return NextResponse.json({ success: true, data: combinedResults })
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
