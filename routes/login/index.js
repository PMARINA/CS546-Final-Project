const express = require('express');
const router = new express.Router();

router.get('/', async (req, res) => {
  res.json('Log in');
});
router.post('/', async (req, res) => {
  res.json('user has logged in');
});

module.exports = router;
