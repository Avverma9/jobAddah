const express = require('express');
const adminRoute = require('./admin');
const authRoute = require('./auth');
const jobRoute = require('./job');

const router = express.Router();
router.use('/', adminRoute);
router.use('/', authRoute);
router.use('/', jobRoute);

module.exports = router;