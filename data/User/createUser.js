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
 * @param {String} [creatorId=''] ObjectId of the person creating the user
 * @return {Object} The params passed in, but trimmed, etc
 */
async function verifyAndCleanCreateUserParams(
    email,
    fName,
    lName,
    rawPwd,
    accessGroups,
    role,
    creatorId = '',
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
  const accessGroupsLabel = "accessGroups";
  const appliedAccessGroupsLabel = "appliedAccessGroups";
  try {
    creatorObjectId = new ObjectId(creatorId);
  } catch (e) {
    const toReturn = {};
    toReturn[accessGroupsLabel] = [];
    toReturn[appliedAccessGroupsLabel] = groups;
    return toReturn;
  }

  const creatorUserObject = await User.findOne(
      {_id: creatorObjectId},
      {_id: 0, role: 1, accessGroups: 1},
  );
    // If the creator is an admin, they get everything
  const creatorRole = creatorUserObject.role;
  const creatorAdminAccessGroups = creatorUserObject.privilegedAccessGroups;
  if (creatorRole === 'admin') {
    const toReturn = {};
    toReturn[accessGroupsLabel] = groups;
    toReturn[appliedAccessGroupsLabel] = [];
    return toReturn;
  }
  if (creatorRole === 'ra') {
    const admittedGroups = [];
    const appliedGroups = [];
    const raPrivilegedGroups = set(creatorAdminAccessGroups);
    groups.forEach(function(group) {
      if (raPrivilegedGroups.contains(group)) admittedGroups.push(group);
      else appliedGroups.push(group);
    });
    const toReturn = {};
    toReturn[accessGroupsLabel] = admittedGroups;
    toReturn[appliedAccessGroupsLabel] = appliedGroups;
    return toReturn;
  }

  // Fall through = no access, everything is applied for
  const toReturn = {};
  toReturn[accessGroupsLabel] = [];
  toReturn[appliedAccessGroupsLabel] = groups;
  return toReturn;
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
