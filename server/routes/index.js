const express = require('express');
const adminRoute = require('@/routes/admin');
const authRoute = require('@/routes/auth');
const jobRoute = require('@/routes/job');
const aiAssistantRoute = require('@/routes/aiAssistant');
const scrapperRoute = require('@/routes/scrapper');
const postsRoute = require('@/routes/posts');
const aiRoute = require('@/routes/ai');
const dashboardRoute = require('@/routes/dashboard');
const adConfigRoute = require('@/routes/adConfig');
const router = express.Router();
router.use('/', adminRoute);
router.use('/', authRoute);
router.use('/', jobRoute);
router.use('/scrapper', scrapperRoute);
router.use('/', postsRoute);
router.use("/ai",aiRoute)
router.use('/', aiAssistantRoute);
router.use("/dashboard",dashboardRoute)
router.use("/ad-config", adConfigRoute)

module.exports = router;