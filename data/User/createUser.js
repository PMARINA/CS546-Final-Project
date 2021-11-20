const {
  validateAndCleanEmail,
  validateAndCleanName,
  validatePassword,
  validateAndCleanRole,
  validateAndCleanAccessGroups,
} = require('./validate');
User = require('../../models/user');
v = require('../../inputVerification').general;
bcrypt = require('bcrypt');
config = require('../../config.json');
ObjectId = require('mongoose').Types.ObjectId;

/**
 * Validate & Return user params
 * @param {String} email The user's sign-up email address
 * @param {String} fName The user's first name
 * @param {String} lName The user's last name
 * @param {String} rawPwd The user's password as plaintext
 * @param {String[]} accessGroups The access groups the user belongs to
 * @param {String} role The user's role in the system
 * @param {String?} creatorId ObjectId of the person creating the user
 * @return {Object} The params passed in, but trimmed, etc
 */
async function verifyAndCleanCreateUserParams(
    email,
    fName,
    lName,
    rawPwd,
    accessGroups,
    role,
    creatorId,
) {
  email = await validateAndCleanEmail(email);

  fName = validateAndCleanName(fName, 'first name');
  lName = validateAndCleanName(lName, 'last name');
  validatePassword(rawPwd);

  validateAndCleanAccessGroups(accessGroups);

  role = validateAndCleanRole(role);
  return {
    email,
    fName,
    lName,
    rawPwd,
    accessGroups,
    role,
  };
}

/**
 * Given the creator, figure out what access groups should be automatically granted or applied for but not granted
 * @param {String[]} groups Validated/Cleaned list of access groups
 * @param {String} creatorId ObjectId of the user creating the new user
 * @return {Promise<{accessGroups: String[], appliedAccessGroups: String[]}>}
 */
async function getAccessGroups(groups, creatorId) {
  // If the ObjectId isn't valid, then just apply for it
  let creatorObjectId = null;
  try {
    creatorObjectId = new ObjectId(creatorId);
  } catch (e) {
    return {accessGroups: [], appliedAccessGroups: groups};
  }

  if (creatorObjectId) {
    const creatorUserObject = await User.findOne(
        {_id: creatorObjectId},
        {_id: 0, role: 1, accessGroups: 1},
    );
    // If the creator is an admin, they get everything
    if (creatorUserObject.role === 'admin') {
      return {accessGroups: groups, appliedAccessGroups: []};
    }
    // If the creator is an RA, they get whatever the RA has authority over, and nothing else
    // TODO: Finish based on results of slack discussion @ https://stevenswebdevfall2021.slack.com/archives/C02HFHLQ0UC/p1637342974001900
  }

  // Fall through = no access, everything is applied for
  return {accessGroups: [], appliedAccessGroups: groups};
}

/**
 * Make a user and return their JSON
 * @param {String} email The user's sign-up email address
 * @param {String} fName The user's first name
 * @param {String} lName The user's last name
 * @param {String} rawPwd The user's password as plaintext
 * @param {String[] | String} accessGroups The access groups the user belongs to
 * @param {String} role The user's role in the system
 * @param {String?} creatorId ObjectId of the creator of the user.
 * @return {Object}
 */
async function createUser(
    email,
    fName,
    lName,
    rawPwd,
    accessGroups,
    role,
    creatorId = '',
) {
  let accessGroupsList;
  if (typeof accessGroups === 'string') {
    accessGroupsList = [accessGroups];
  } else {
    accessGroupsList = accessGroups;
  }
  ({email, fName, lName, rawPwd, accessGroupsList, role} =
    await verifyAndCleanCreateUserParams(
        email,
        fName,
        lName,
        rawPwd,
        accessGroupsList,
        role,
        creatorId,
    ));
  let appliedAccessGroups;
  ({accessGroupsList, appliedAccessGroups} = await getAccessGroups(
      accessGroupsList,
      creatorId,
  ));
  const numRounds = config.APPLICATION.SECURITY.Password.BcryptNumHashingRounds;
  // salt = await bcrypt.genSalt(numRounds);
  const hashPwd = await bcrypt.hash(rawPwd, numRounds);
  const userObj = {
    email,
    name: {
      first: fName,
      last: lName,
    },
    accessGroups: accessGroupsList,
    appliedAccessGroups,
    password: hashPwd,
    role: role,
  };
  return await User.create(userObj);
}

module.exports = createUser;
