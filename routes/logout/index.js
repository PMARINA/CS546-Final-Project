const express = require('express');
const router = new express.Router();

router.all('/', async (req, res) => {
  res.json('user logged out');
});

module.exports = router;
