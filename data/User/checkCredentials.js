const { validateAndCleanEmail, validatePassword } = require("./validate");
const User = require("../../models/user");
const bcrypt = require("bcrypt");

/**
 * Check the users' credentials
 *
 * idealResponse from this method...
 *
 * ```json
 {
    usernameHelp: "Username needs to be...",
    passwordHelp: "Password missing uppercase",
    valid: false,
    cookieData: {
      someResponseFromServer: 'the users object from the db',
    }
  }
 *```
 * @param {String} username
 * @param {String} password
 * @return {Promise<Object>}
 */
async function checkCredentials(username, password) {
  const incorrectCredentialsMessage = "Username or Password was incorrect";
  let usernameHelp = undefined;
  let passwordHelp = undefined;
  try {
    username = await validateAndCleanEmail(username, false);
  } catch (e) {
    usernameHelp = e.message;
  }
  try {
    validatePassword(password);
  } catch (e) {
    passwordHelp = e.message;
  }
  if (usernameHelp || passwordHelp) {
    // There was something wrong at the validation stage...
    return {
      usernameHelp,
      passwordHelp,
      valid: false,
      cookieData: {},
    };
  }
  const userWithUsername = await User.findOne({ email: username });
  if (!userWithUsername) {
    // Compare against an arbitrary hardcoded hash to protect against timing attacks
    await bcrypt.compare(
      password,
      `$2b$12$pLq3BKhZYcBL7yVI5S7xLOFfQa7kcfPyyi5DlyzanapX.zgxpvJY6`
    );
    return { valid: false, resBody: incorrectCredentialsMessage };
  } else {
    const hash = userWithUsername.password;
    if (await bcrypt.compare(password, hash)) {
      return { cookieData: userWithUsername, valid: true };
    } else {
      return { valid: false, resBody: incorrectCredentialsMessage };
    }
  }
}

module.exports = checkCredentials;
