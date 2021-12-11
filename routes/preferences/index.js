const express = require("express");
const router = new express.Router();
const authMiddleware = require("../middleware").auth;
const building = require("../../data/Building");
const user = require("../../models/user");
const userData = require("../../data/User");
const { validate } = require("../../data/User");
const config = require("../../config.json");
const bcrypt = require("bcrypt");

//region Middleware setup
router.use(authMiddleware.loggedInOnly);
//endregion

//region Get main preferences page
router.get("/", async (req, res) => {
  let unAppliedPermissionsExist = false;
  const allBuildingPermissions = await building.getAllAccessGroups();
  const currentAppliedPermissions = res.locals.userInfo.appliedAccessGroups;
  const currentPermissions = new Set(
    res.locals.userInfo.accessGroups.concat(currentAppliedPermissions)
  );
  const unAppliedPermissions = [];

  function addPermission(perm) {
    const obj = { value: perm };
    let name = perm;
    let lastCharWasSpace = true;
    for (let i = 0; i < name.length; i++) {
      if (lastCharWasSpace) {
        name =
          name.substring(0, i) +
          name.charAt(i).toUpperCase() +
          name.substring(i + 1);
      }
      lastCharWasSpace = name.charAt(i) === " ";
    }
    obj.name = name;
    unAppliedPermissions.push(obj);
  }

  for (const perm of allBuildingPermissions) {
    if (!currentPermissions.has(perm)) {
      unAppliedPermissionsExist = true;
      addPermission(perm);
    }
  }
  res.render("preferences", {
    navbar: res.locals.navbar,
    userInfo: res.locals.userInfo,
    unAppliedPermissionsExist,
    unAppliedPermissions,
  });
  // res.json("Settings Page");
});
//endregion

//region Post name update
router.post("/updateName", async (req, res) => {
  const nameObj = req.body;
  if (
    !nameObj.firstName ||
    typeof nameObj.firstName !== "string" ||
    nameObj.firstName.trim().length === 0
  ) {
    res.json("The first name must be provided and not empty.");
  } else if (
    !nameObj.lastName ||
    typeof nameObj.lastName !== "string" ||
    nameObj.lastName.trim().length === 0
  ) {
    res.json("The last name must be provided and not empty");
  } else {
    const firstName = nameObj.firstName.trim();
    const lastName = nameObj.lastName.trim();
    await user.updateOne(
      { _id: req.session.userInfo._id },
      { "name.first": firstName, "name.last": lastName }
    );
    res.json({ redirect: "/preferences" });
  }
});
//endregion

//region Post email update
router.post("/updateEmail", async (req, res) => {
  const emailObj = req.body;
  if (
    !emailObj ||
    typeof emailObj.email !== "string" ||
    emailObj.email.trim().length === 0
  ) {
    res.json("The email must be provided and not empty");
  } else if (
    !emailObj.email.match(
      /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    )
  ) {
    res.json("The email provided was not valid");
  } else if (await user.exists({ email: emailObj.email })) {
    res.json(
      "The email provided is already used by another account. Please sign in with that instead."
    );
  } else {
    const email = emailObj.email;
    await user.updateOne({ _id: req.session.userInfo._id }, { email: email });
    res.json({ redirect: "/preferences" });
  }
});
//endregion

//region Post password update
function validatePasswordString(pwd) {
  let containsLower = false;
  let containsUpper = false;
  let containsSymbol = false;
  let containsNumber = false;
  const sufficientLength = pwd.length >= 8;
  for (let i = 0; i < pwd.length; i++) {
    const currentChar = pwd.charAt(i);
    const currCode = currentChar.charCodeAt(0);
    if (
      // Lowercase
      currCode >= "a".charCodeAt(0) &&
      currCode <= "z".charCodeAt(0)
    ) {
      containsLower = true;
    } else if (
      // Uppercase
      currCode >= "A".charCodeAt(0) &&
      currCode <= "Z".charCodeAt(0)
    ) {
      containsUpper = true;
    } else if (
      // Number
      currCode >= "0".charCodeAt(0) &&
      currCode <= "9".charCodeAt(0)
    ) {
      containsNumber = true;
    } else {
      // Not any of the others = symbol
      containsSymbol = true;
    }
  }
  return (
    sufficientLength &&
    containsLower &&
    containsUpper &&
    containsNumber &&
    containsSymbol
  );
}
router.post("/updatePassword", async (req, res) => {
  const passwordObject = req.body;
  const existingPassword = passwordObject.currentPassword;
  const newPassword = passwordObject.newPassword;
  if (
    !passwordObject ||
    typeof passwordObject.currentPassword !== "string" ||
    typeof passwordObject.newPassword !== "string"
  ) {
    res.status(400).json("The password must be provided and not empty");
    return;
  }

  const existingPwdVal = validatePasswordString(existingPassword);
  const newPwdVal = validatePasswordString(newPassword);
  const email = (await user.findById(res.locals.userId.toString())).email;
  const correctPassword = await userData.checkCredentials(
    email,
    existingPassword
  );

  if (!(existingPwdVal && newPwdVal)) {
    res
      .status(400)
      .json(
        "The passwords provided were not valid. Please rely on the clientside validation guidance."
      );
  } else if (!correctPassword.valid) {
    res
      .status(403)
      .json("The current password is invalid. Please check and try again.");
  } else {
    const numRounds =
      config.APPLICATION.SECURITY.Password.BcryptNumHashingRounds;
    const hashPwd = await bcrypt.hash(newPassword, numRounds);
    await user.updateOne(
      { _id: req.session.userInfo._id },
      { password: hashPwd }
    );
    res.json({ redirect: "/preferences" });
  }
});
//endregion

//region Post appliedGroups Update
router.post("/updateAppliedGroups", async (req, res) => {
  const groups = req.body.groups;
  if (typeof groups !== "object" || !Array.isArray(groups)) {
    res.status(400).json("You must provide a list of groups to apply for");
    return;
  }
  for (let i = 0; i < groups.length; i++) {
    if (
      typeof groups[i] !== "string" ||
      groups[i].trim().toLowerCase() !== groups[i] ||
      groups[i].length === 0
    ) {
      res
        .status(400)
        .json(
          "Invalid group detected. Please allow the clientside code to run."
        );
      return;
    }
  }
  const userObj = await user.findById(res.locals.userInfo._id.toString());
  for (const x of groups) userObj.appliedAccessGroups.push(x);
  await userObj.save();
  res.json({ redirect: "/preferences" });
});
//endregion

//region Unused Routes
// router.patch("/", async (req, res) => {
//   const reportId = req.params.id;
//   res.json(`updated the user's personal preferences: ${reportId}`);
// });
//endregion

module.exports = router;
