const express = require('express');
const User = require("../../data/User");
const router = new express.Router();
const expressHandlebars = require('express-handlebars').create();
const cookieName = require('../../config.json').APPLICATION.COOKIE.name;

router.get('/', async (req, res) => {
  let userLoggedIn = false;
  if (req.session && req.session.userInfo) {
    const userId = req.session.userInfo['_id'];
    if (await User.exists(userId)) {
      // res.json({'redirect': '/'});
      // res.redirect('/');
      userLoggedIn = true;
    } else {
      res.redirect('/logout');
      return;
    }
  }
  const navbar = await expressHandlebars.render('views/navbar/main.handlebars', {
    userLoggedIn,
    currentPageIsHome: true,
  });
  const templateToRender = userLoggedIn ? 'homeLoggedIn' : 'homeAnonymous';
  res.render(templateToRender, {navbar, title: 'Duck Wash'});
});

module.exports = router;
