const Post = require('../models/jobs');

// --- Helper: Standard Response Formatter ---
const formatResponse = (data, page, limit, total) => ({
  success: true,
  count: data.length,
  totalDocuments: total,
  totalPages: Math.ceil(total / limit),
  currentPage: parseInt(page),
  data: data
});

// ==========================================
// A. CRUD OPERATIONS (Create, Update, Delete)
// ==========================================

// 1. Create a New Post
const createPost = async (req, res) => {
  try {

    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(201).json({ success: true, data: savedPost });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message }); // 400 for Bad Request (Duplicate slug etc)
  }
};

const insertBulkPosts = async (req, res) => {
  try {
    const posts = req.body; // Expecting an Array of Objects

    if (!Array.isArray(posts)) {
      return res.status(400).json({ success: false, message: "Input must be an array of posts" });
    }

    // 1. Auto-generate slugs if missing
    posts.forEach(post => {
      if (!post.slug && post.postTitle) {
        post.slug = post.postTitle
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, '');
      }
    });

    // 2. Insert Many (ordered: false ensures valid docs get inserted even if some fail)
    const result = await Post.insertMany(posts, { ordered: false });

    res.status(201).json({
      success: true,
      message: `Successfully inserted ${result.length} posts`,
      data: result
    });

  } catch (err) {
    // Handle Duplicate Key Error (E11000) gracefully
    if (err.code === 11000) {
      return res.status(207).json({ // 207 = Multi-Status
        success: true,
        message: "Bulk insert completed with some duplicates skipped.",
        insertedCount: err.result ? err.result.nInserted : "Unknown",
        error: "Duplicate slugs found and skipped"
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Update a Post by ID
const updatePost = async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return updated doc & validate
    );

    if (!updatedPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, data: updatedPost });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 3. Delete a Post by ID
const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Delete ALL Posts (Dangerous!)
const deleteAllPosts = async (req, res) => {
  try {
    const result = await Post.deleteMany({});
    res.json({
      success: true,
      message: 'All posts deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Get Single Post (By Slug or ID)
const getPostDetails = async (req, res) => {
  try {
    // Check if param is valid ObjectID, else treat as Slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id };

    const post = await Post.findOne(query);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// B. CATEGORIZED GETTERS (Filtering)
// ==========================================

// 6. Get Online Forms (Latest Jobs)
const getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { postType: 'JOB' };

    if (search) {
      query.$or = [
        { postTitle: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Post.countDocuments(query);

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Lightweight response for listing
    const data = posts.map(post => ({
      _id: post._id,
      title: post.postTitle,
      slug: post.slug,
      org: post.organization,
      vacancies: post.totalVacancyCount || "N/A",
      lastDate: post.importantDates?.find(d => d.label?.toLowerCase().includes('last'))?.value || "N/A", // "last" label more flexible for various formats
      createdAt: post.createdAt, // Optionally send createdAt for debugging or frontend sorting
    }));

    res.json(formatResponse(data, page, limit, total));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// 7. Get Admit Cards
const getAdmitCards = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { postType: 'ADMIT_CARD' };

    if (search) query.postTitle = { $regex: search, $options: 'i' };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .select('postTitle slug organization importantDates importantLinks')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const data = posts.map(post => ({
      _id: post._id,
      title: post.postTitle,
      slug: post.slug,
      examDate: post.importantDates.find(d => d.label.toLowerCase().includes('exam'))?.value || "Soon",
      downloadLink: post.importantLinks.find(l => l.label.toLowerCase().includes('admit') || l.label.toLowerCase().includes('download'))?.url
    }));

    res.json(formatResponse(data, page, limit, total));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 8. Get Results
const getResults = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { postType: 'RESULT' };

    if (search) query.postTitle = { $regex: search, $options: 'i' };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .select('postTitle slug organization importantDates importantLinks')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const data = posts.map(post => ({
      _id: post._id,
      title: post.postTitle,
      slug: post.slug,
      resultDate: post.importantDates.find(d => d.label.toLowerCase().includes('result'))?.value || "Declared",
      checkLink: post.importantLinks.find(l => l.label.toLowerCase().includes('result'))?.url
    }));

    res.json(formatResponse(data, page, limit, total));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 9. Get Upcoming Exams
// Logic: Finds posts where `importantDates` contains "Exam Date" or "Test Date"
const getExams = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = {
      "importantDates.label": { $regex: /Exam Date|Test Date|CBT Date/i }
    };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .select('postTitle slug organization importantDates')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const data = posts.map(post => ({
      _id: post._id,
      title: post.postTitle,
      slug: post.slug,
      examDate: post.importantDates.find(d => /Exam Date|Test Date/i.test(d.label))?.value
    }));

    res.json(formatResponse(data, page, limit, total));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 10. Get Answer Keys (Bonus)
const getAnswerKeys = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = { postType: 'ANSWER_KEY' };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));

    res.json(formatResponse(posts, page, limit, total));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// C. STATS & DASHBOARD
// ==========================================

// 11. Get Dashboard Stats
const getStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      Post.countDocuments({}), // Total Posts
      Post.countDocuments({ postType: 'JOB' }),
      Post.countDocuments({ postType: 'ADMIT_CARD' }),
      Post.countDocuments({ postType: 'RESULT' }),
      Post.countDocuments({ postType: 'ANSWER_KEY' })
    ]);

    res.json({
      success: true,
      stats: {
        total: stats[0],
        jobs: stats[1],
        admitCards: stats[2],
        results: stats[3],
        answerKeys: stats[4]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const getallPost = async (req, res) => {
  try {
    const response = await Post.find().sort({ createdAt: -1 });
    res.json(response)
  } catch (err) {
    console.error(err);

  }


}
module.exports = {
  createPost,
  updatePost,
  deletePost,
  deleteAllPosts,
  getPostDetails,
  getJobs,
  getAdmitCards,
  getResults,
  getExams,
  getAnswerKeys,
  getStats,
  insertBulkPosts,
  getallPost
};