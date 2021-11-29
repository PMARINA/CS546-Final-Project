const express = require('express');
const router = new express.Router();
const expressHandlebars = require('express-handlebars').create();

router.get('/', async (req, res) => {
  const navbar = await expressHandlebars.render('views/navbar/main.handlebars', {
    userLoggedIn: false,
    currentPageIsHome: true,
  });
  res.render('homeAnonymous', {navbar});
});

module.exports = router;
