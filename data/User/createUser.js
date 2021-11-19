User = require('../../models/user');
v = require('../../inputVerification').general;
bcrypt = require('bcrypt');
config = require('../../config.json');

/**
 * Validate & Return user params
 * @param {String} email The user's sign-up email address
 * @param {String} fName The user's first name
 * @param {String} lName The user's last name
 * @param {String} rawPwd The user's password as plaintext
 * @param {String[]} accessGroups The access groups the user belongs to
 * @param {String} role The user's role in the system
 * @return {Object} The params passed in, but trimmed, etc
 */
async function verifyAndCleanCreateUserParams(
    email,
    fName,
    lName,
    rawPwd,
    accessGroups,
    role,
) {
  if (typeof email !== 'string') {
    throw new Error('Received nonstring for email');
  }
  email = email.trim().toLowerCase();
  if (email.length === 0) throw new Error('Received empty email string');
  if (
    !email.match(
        /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    )
  ) {
    throw new Error('Invalid user email');
  }

  if (await User.exists({email})) throw new Error('User already exists.');

  if (typeof fName !== 'string') {
    throw new Error('Received nonstring for First Name');
  }
  fName = fName.trim();
  if (fName.length === 0) throw new Error('Received empty first name');

  if (typeof lName !== 'string') {
    throw new Error('Received nonstring for Last Name');
  }
  lName = lName.trim();
  if (lName.length === 0) throw new Error('Received empty last name');

  if (typeof rawPwd !== 'string') {
    throw new Error('Received nonstring for password');
  }
  if (rawPwd.length < 8) throw new Error('Password was too short.');
  let containsUpper = false;
  let containsLower = false;
  let containsNumber = false;
  let containsSymbol = false;
  const charCodeOf0 = '0'.charCodeAt(0);
  const charCodeOf9 = '9'.charCodeAt(0);

  const charCodeOfA = 'A'.charCodeAt(0);
  const charCodeOfZ = 'Z'.charCodeAt(0);

  const charCodeOfa = 'a'.charCodeAt(0);
  const charCodeOfz = 'z'.charCodeAt(0);

  for (let i = 0; i < rawPwd.length; i++) {
    c = rawPwd.charCodeAt(i);
    if (c >= charCodeOf0 && c <= charCodeOf9) {
      containsNumber = true;
      continue;
    }
    if (c >= charCodeOfA && c <= charCodeOfZ) {
      containsUpper = true;
      continue;
    }
    if (c >= charCodeOfa && c <= charCodeOfz) {
      containsLower = true;
      continue;
    }
    containsSymbol = true;
  }

  if (!(containsUpper && containsLower && containsNumber && containsSymbol)) {
    throw new Error('Password does not meet criteria');
  }

  if (typeof accessGroups != 'object' || !Array.isArray(accessGroups)) {
    throw new Error('Access groups was not an array');
  }

  for (let i = 0; i < accessGroups.length; i++) {
    let ag = accessGroups[i];
    if (typeof ag !== 'string') {
      throw new Error('Member of access groups was not a String');
    }
    ag = ag.trim().toLowerCase();
    if (ag.length === 0) {
      throw new Error('One of the access groups was empty (spaces)');
    }
    accessGroups[i] = ag;
  }

  if (typeof role !== 'string') throw new Error('Role was not a string');
  role = role.trim().toLowerCase();
  if (role.length === 0) {
    throw new Error('Role was empty or spaces');
  }
  if (!role.match(/(student|ra|maintenance|admin)/)) {
    throw new Error('Role did not match valid roles');
  }
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
 * Make a user and return their JSON
 * @param {String} email The user's sign-up email address
 * @param {String} fName The user's first name
 * @param {String} lName The user's last name
 * @param {String} rawPwd The user's password as plaintext
 * @param {String[] | String} accessGroups The access groups the user belongs to
 * @param {String} role The user's role in the system
 * @param {Boolean} isCreateeAdmin Whether the access groups should be granted or simply applied for
 * @return {Object}
 */
async function createUser(
    email,
    fName,
    lName,
    rawPwd,
    accessGroups,
    role,
    isCreateeAdmin = false,
) {
  if (typeof accessGroups === 'string') accessGroups = [accessGroups];
  ({email, fName, lName, rawPwd, accessGroups, role} =
    await verifyAndCleanCreateUserParams(
        email,
        fName,
        lName,
        rawPwd,
        accessGroups,
        role,
    ));
  hashPwd = 'NotAHashedPassword';
  numRounds = config.APPLICATION.SECURITY.Password.BcryptNumHashingRounds;
  // salt = await bcrypt.genSalt(numRounds);
  hashPwd = await bcrypt.hash(rawPwd, numRounds);
  const accessGroupField = isCreateeAdmin ?
    'accessGroups' :
    'appliedAccessGroups';
  const userObj = {
    email,
    name: {
      first: fName,
      last: lName,
    },
    password: hashPwd,
    role: role,
  };
  userObj[accessGroupField] = accessGroups;
  const createdUser = await User.create(userObj);
  return createdUser;
}

module.exports = createUser;
