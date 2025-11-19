const mongoose = require('mongoose');
const ExamPost = require('./models/jobs');
require('dotenv').config();

const rajasthanPoliceData = {
  postName: "Rajasthan Police Constable Result 2025 Declared",
  shortInfo: "Rajasthan Police Department has officially released the written exam result for the post of Constable (GD, Driver, Band & Telecommunication). The exam was conducted on 13th & 14th September 2025. Candidates who appeared for the exam can now download their District-wise Result PDF and check their eligibility for the PET/PST round scheduled in December.",
  category: "Result",
  
  importantDates: [
    { label: "Application Begin", value: "28/04/2025" },
    { label: "Last Date for Apply Online", value: "25/05/2025" },
    { label: "Exam Date", value: "13-14 September 2025" },
    { label: "Answer Key Released", value: "17/09/2025" },
    { label: "Result Declared", value: "14/11/2025" },
    { label: "PET/PST Exam Date", value: "30 Nov - 07 Dec 2025" }
  ],

  applicationFee: [
    { category: "General / OBC / EWS", amount: "600/-" },
    { category: "SC / ST / PH", amount: "400/-" },
    { category: "All Category Female", amount: "400/-" }
  ],
  paymentMode: "Online via Debit Card, Credit Card, Net Banking Only",

  ageLimit: {
    asOnDate: "01/01/2026",
    minAge: "18 Years",
    maxAge: "23 Years (Constable GD)",
    details: [
      "Driver Post Max Age: 26 Years",
      "Male DOB: 02/01/2002 to 01/01/2008",
      "Female DOB: 02/01/1997 to 01/01/2008",
      "Age Relaxation Extra as per Rajasthan Police Rules"
    ]
  },

  vacancyDetails: [
    {
      postName: "Constable General (GD) / Telecommunication",
      totalPost: "10,036 (Approx)",
      eligibility: "Class 12th (Intermediate) Exam Passed in Any Board + Rajasthan CET 10+2 Score Card."
    },
    {
      postName: "Constable Driver",
      totalPost: "Various",
      eligibility: "Class 12th Passed + LMV/HMV Driving License (1 Year Old)."
    }
  ],

  importantLinks: [
    { label: "Download Result (District Wise List)", url: "https://police.rajasthan.gov.in", isNew: true },
    { label: "Download PET/PST Schedule", url: "#", isNew: true },
    { label: "Download Cutoff Marks", url: "#", isNew: false },
    { label: "Download Answer Key", url: "#", isNew: false },
    { label: "Official Website", url: "https://police.rajasthan.gov.in", isNew: false }
  ]
};

const seedRajasthan = async () => {
  try {
    // 1. Database Connect
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    // 2. Create Post
    const newPost = await ExamPost.create(rajasthanPoliceData);
    
    console.log("✅ Rajasthan Police Result Data Seeded Successfully!");
    console.log("Post ID:", newPost._id);

    // 3. Connection Close
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error Seeding Data:", error);
    process.exit(1);
  }
};

seedRajasthan();