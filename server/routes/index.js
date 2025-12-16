const express = require('express');
const adminRoute = require('./admin');
const authRoute = require('./auth');
const jobRoute = require('./gov/job');
const aiAssistantRoute = require('./aiAssistant');
const govScrapperRoute = require('./gov/scrapper');
const pvtScrapperRoute = require('./pvt/scrapper');
const postsRoute = require('./gov/posts');
const aiRoute = require('./ai');
const dashboardRoute = require('./dashboard');
const adConfigRoute = require('./adConfig');
const router = express.Router();
router.use('/', adminRoute);
router.use('/', authRoute);
router.use('/', jobRoute);
router.use('/scrapper', govScrapperRoute);
router.use('/pvt-scrapper', pvtScrapperRoute);
router.use('/', postsRoute);
router.use("/ai",aiRoute)
router.use('/', aiAssistantRoute);
router.use("/dashboard",dashboardRoute)
router.use("/ad-config", adConfigRoute)

module.exports = router;