const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  // --- 1. Meta Information ---
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true,
    lowercase: true,
    trim: true 
  },
  postTitle: { 
    type: String, 
    required: true,
    index: true 
  },
  postType: {
    type: String,
    required: true,
    enum: ['JOB', 'ADMIT_CARD', 'RESULT', 'ANSWER_KEY', 'SYLLABUS', 'ADMISSION','SCHOLARSHIP','PRIVATE_JOB'],
    default: 'JOB',
    index: true
  },
  organization: { type: String, required: true },
  shortInfo: { type: String }, 
  
  // Total Vacancy (Number for sorting, 0 if not applicable)
  totalVacancyCount: { type: Number, default: 0 },

  // --- 2. Dates Section ---
  importantDates: [{
    label: { type: String }, // "Application Start", "Exam Date"
    value: { type: String }  // "25 Nov 2025"
  }],

  // --- 3. Fee Details ---
  applicationFee: [{
    category: { type: String }, // "Gen/OBC"
    amount: { type: Number, default: 0 },
    note: { type: String }      // "Refundable" etc.
  }],

  // --- 4. Age Limit (Object Structure) ---
  ageLimit: {
    asOnDate: { type: String }, // "01/01/2025"
    minAge: { type: String },
    maxAge: { type: String },
    details: { type: String }   // "Relaxation Rules"
  },

  // --- 5. Vacancy / Post Details (Array of Objects) ---
  vacancyDetails: [{
    postName: { type: String },    // "Station Master"
    totalPost: { type: String },   // "500" or "Various"
    eligibility: { type: String }, // "Degree in Engineering"
    payLevel: { type: String },    // "Level-6"
    categoryBreakdown: { type: mongoose.Schema.Types.Mixed } // Flexible Object for { Gen: 10, OBC: 5 }
  }],
  
  // --- 6. District Wise Data (For Anganwadi etc.) ---
  districtWiseData: [{
    districtName: { type: String },
    totalPost: { type: String },
    lastDate: { type: String },
    notificationLink: { type: String }
  }],

  // --- 7. Important Links (Most Critical) ---
  importantLinks: [{
    label: { type: String, required: true }, // "Apply Online"
    url: { type: String, required: true },   // "https://..."
    isDeepLink: { type: Boolean, default: false }
  }],

  // --- 8. Flags & Timestamps ---
  isLive: { type: Boolean, default: true },
  
}, { timestamps: true });

// Text Index for Search Functionality
PostSchema.index({ postTitle: 'text', organization: 'text' });

module.exports = mongoose.model('Post', PostSchema);