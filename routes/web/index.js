const express = require("express");
const router = new express.Router();
const buildings = require("./buildings");
const appointments = require('./appointments');

router.use("/buildings", buildings);
router.use("/appointments", appointments);

module.exports = router;
