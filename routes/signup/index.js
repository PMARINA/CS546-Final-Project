const express = require("express");
const User = require("../../data/User");
const router = new express.Router();
const authMiddleware = require("../middleware").auth;

router.post("/", authMiddleware.apiAnonymousOnly, async (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let pwd = req.body.pwd;
  let accessGroup = req.body.accessGroup;
  ({ firstName, lastName, email, pwd, accessGroup } = req.body);
  tryfnc = async function (f, s) {
    try {
      return await f(s);
    } catch (e) {
      e = e.message.toString();
      if (e.includes("User already exists")) {
        res.json(
          `The user (${email}) already exists. Please exit the signup menu and try to log in.`
        );
      } else {
        res.json(`${e}: ${s}`);
        return;
      }
    }
  };
  email = await tryfnc(User.validate.validateAndCleanEmail, email);
  firstName = await tryfnc(
    User.validate.validateAndCleanName.bind(undefined, firstName, "First name")
  );
  lastName = await tryfnc(
    User.validate.validateAndCleanName.bind(undefined, lastName, "Last name")
  );
  await tryfnc(User.validate.validatePassword, pwd);
  const accessGroups = await tryfnc(
    User.validate.validateAndCleanAccessGroups,
    [accessGroup]
  );
  try {
    req.session.userInfo = await User.createUser(
      email,
      firstName,
      lastName,
      pwd,
      accessGroup,
      "student"
    );
  } catch (e) {
    e = e.message.toString();
    res.json(e);
    return;
  }
  res.json({ redirect: "/" });
});

module.exports = router;
