const express = require('express');
const router = new express.Router();

router.get('/', async (req, res) => {
  res.json('Sign Up');
});
router.post('/', async (req, res) => {
  res.json('user signed up');
});

module.exports = router;
