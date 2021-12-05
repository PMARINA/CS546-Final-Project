const express = require('express');
const router = new express.Router();
const cookie = require('../../config.json').APPLICATION.COOKIE;

router.all('/', async (req, res) => {
  res.clearCookie(cookie.name);
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
