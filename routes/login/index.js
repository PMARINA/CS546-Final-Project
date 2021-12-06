const express = require('express');
const router = new express.Router();
const User = require('../../data/User');
const auth = require('../middleware').auth;

router.post('/', auth.apiAnonymousOnly, async (req, res) => {
  const username = req.body['loginEmail'];
  const password = req.body['loginPassword'];

  if (username === undefined) {
    res.json('username missing');
    return;
  }
  if (password === undefined) {
    res.json('loginPassword missing');
    return;
  }

  const checkResult = await User.checkCredentials(username, password);
  if (checkResult.valid) {
    req.session.userInfo = checkResult.cookieData;
    res.json({'redirect': '/'});
  } else {
    res.json(checkResult.resBody);
  }
});

module.exports = router;
