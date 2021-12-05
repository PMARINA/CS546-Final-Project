const express = require('express');
const User = require("../../data/User");
const router = new express.Router();

router.post('/', async (req, res) => {
  if (req.session && req.session.userInfo) {
    const userId = req.session.userInfo['_id'];
    if (await User.exists(userId)) {
      res.json({'redirect': '/'});
      // res.redirect('/');
      return;
    } else {
      res.json({'redirect': '/logout'});
      return;
    }
  }
  // if (!res.session) res.session = {};
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let pwd = req.body.pwd;
  let accessGroup = req.body.accessGroup;
  ({
    firstName,
    lastName,
    email,
    pwd,
    accessGroup,
  } = req.body);
  tryfnc = async function (f, s) {
    try {
      return await f(s);
    } catch (e) {
      res.json(`${e.message}: ${s}:`);
    }
  };
  email = await tryfnc(User.validate.validateAndCleanEmail, email);
  firstName = await tryfnc(User.validate.validateAndCleanName.bind(undefined, firstName, 'First name'));
  lastName = await tryfnc(User.validate.validateAndCleanName.bind(undefined, lastName, 'Last name'));
  await tryfnc(User.validate.validatePassword, pwd);
  const accessGroups = await tryfnc(User.validate.validateAndCleanAccessGroups, [accessGroup]);
  try {
    req.session.userInfo = await User.createUser(email, firstName, lastName, pwd, accessGroup, 'student');
  } catch (e) {
    res.json(e.message);
    return;
  }
  res.json({'redirect': '/'});
});

module.exports = router;
