const express = require('express');
const router = new express.Router();
const User = require('../../data/User');

// router.get('/', async (req, res) => {
//   res.json('Log in');
// });
router.post('/', async (req, res) => {
  // If the user is already logged in, just redirect them home... no need to re-log them in.
  if (req.session && req.session.userInfo) {
    const userId = req.session.userInfo['_id'];
    if (await User.exists(userId)) {
      // res.json({'redirect': '/'});
      res.redirect('/');
      return;
    } else {
      res.redirect('/logout');
      return;
    }
  }
  // if (!res.session) res.session = {};

  const username = req.body['loginEmail'];
  const password = req.body['loginPassword'];

  if (username === undefined) {
    res.json('loginEmail missing');
    return;
  } else if (password === undefined) {
    res.json('loginPassword missing');
  }

  const checkResult = await User.checkCredentials(username, password);
  req.session.userInfo = checkResult.cookieData;
  if (checkResult.valid) res.json({'redirect': '/'});
  else res.json(checkResult.resBody);
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
});

module.exports = router;
