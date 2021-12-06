const express = require('express');
const router = new express.Router();
const buildings = require('./buildings');

router.use('/buildings', buildings);

module.exports = router;
