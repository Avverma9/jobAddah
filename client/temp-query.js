const mongoose = require('mongoose');
const Job = require('./lib/models/joblist').default || require('./lib/models/joblist');
(async()=>{
  await mongoose.connect(process.env.MONGO_URI);
  const link = 'https://sarkariresult.com.cm/latest-jobs/';
  const safeLink = link.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
  const regex = new RegExp('^'+safeLink, 'i');
  const docs = await Job.find({ url: { $regex: regex } }).limit(2).select('url jobs').lean();
  console.log({safeLink, count: docs.length, first: docs[0]?.url, jobs: docs[0]?.jobs?.length});
  await mongoose.disconnect();
})();
