const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../../models/user");
/**
 * Determine if the user with uid exists.
 * @param {String} uid The user id to check for
 * @return {Promise<boolean>} Whether the user id exists
 */
async function userExists(uid) {
  if (typeof uid !== "string") return false;
  uid = uid.trim();
  let uidObject = null;
  try {
    uidObject = new ObjectId(uid);
  } catch (e) {}
  if (!uidObject) return false;
  return await User.exists({ _id: uidObject });
}

module.exports = userExists;
