const express = require('express');
const adminRoute = require('./admin');
const authRoute = require('./auth');
const jobRoute = require('./job');
const aiAssistantRoute = require('./aiAssistant');
const scrapperRoute = require('../routes/scrapper');
const postsRoute = require('./posts');
const aiRoute = require('./ai');
const dashboardRoute = require('./dashboard');
const adConfigRoute = require('./adConfig');
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