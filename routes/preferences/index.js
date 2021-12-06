const express = require("express");
const router = new express.Router();
const authMiddleware = require("../middleware").auth;

router.get("/", authMiddleware.loggedInOnly, async (req, res) => {
  res.json("Settings Page");
});

router.patch("/", async (req, res) => {
  const reportId = req.params.id;
  res.json(`updated the user's personal preferences: ${reportId}`);
});

module.exports = router;
