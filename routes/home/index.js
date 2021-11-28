const express = require('express');
const router = new express.Router();

router.get('/', async (req, res) => {
  res.json('home page');
});

module.exports = router;
