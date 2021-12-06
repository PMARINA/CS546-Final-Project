const Buildings = require('../../models/building');
const user = require('../../models/user');
const userExists = require('./userExists');

/**
 *
 * @param {String} uid The user's id
 * @return {Promise<Object[]>}
 */
async function getAllBuildingsForUser(uid) {
  if (!await userExists(uid)) {
    // throw new Error("User does not exist");
    return [];
  } else {
    const userObject = await user.findById(uid);
    const groups = userObject.accessGroups;
    console.log(groups);
    return Buildings.find({accessGroups: {$in: groups}});
  }
}

module.exports = {getAllBuildingsForUser};
