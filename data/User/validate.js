const User = require('../../models/user');
/**
 * - Email is a string
 * - Trim the email
 * - Email is not empty
 * - Email matches a RegEx
 * - Email isn't already taken by someone in the Users DB
 *
 * @param {String} email
 * @return {Promise<string>}
 */
async function validateAndCleanEmail(email) {
  if (typeof email !== 'string') {
    throw new Error('Email was expected to be a string');
  }
  email = email.trim().toLowerCase();
  if (email.length === 0) throw new Error('Email string was empty');
  if (
    !email.match(
        /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    )
  ) {
    throw new Error('Invalid user email');
  }

  if (await User.exists({email})) throw new Error('User already exists');
  return email;
}

/**
 * - The name is a string
 * - Trim the name
 * - The name is not empty (spaces)
 *
 * @param {String} name
 * @param {String} nameOfVariable
 * @return {string}
 */
function validateAndCleanName(name, nameOfVariable) {
  if (typeof name !== 'string') {
    throw new Error(`Received non-string for ${nameOfVariable}`);
  }
  name = name.trim();
  if (name.length === 0) throw new Error(`Received empty ${nameOfVariable}`);
  return name;
}

/**
 * Validate the user's proposed password
 * - Is a string
 * - Is at least 8 characters long
 * - Contains a number, an upper/lowercase letter, and a symbol
 * @param {String} password plaintext password (not hashed)
 */
function validatePassword(password) {
  if (typeof password !== 'string') {
    throw new Error('Received non-string for password');
  }
  if (password.length < 8) throw new Error('Password was too short');
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

  for (let i = 0; i < password.length; i++) {
    const c = password.charCodeAt(i);
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
}

/**
 * Validate and clean the name of an access group
 * - Must be lowercase, and not be surrounded by spaces
 * - Must not be empty
 * - Must be a string
 *
 * @param {String} groupName The access group to validate & clean
 * @return {string} The cleaned form of the access group
 */
function validateAndCleanAccessGroupName(groupName) {
  if (typeof groupName !== 'string') {
    throw new Error('Member of access groups was not a String');
  }
  groupName = groupName.trim().toLowerCase();
  if (groupName.length === 0) {
    throw new Error('One of the access groups was empty (spaces)');
  }
  return groupName;
}

/**
 * Given a list of access groups, clean and validate each group
 * @param {String[]} accessGroups
 */
function validateAndCleanAccessGroups(accessGroups) {
  if (typeof accessGroups != 'object' || !Array.isArray(accessGroups)) {
    throw new Error('Access groups was not an array');
  }

  for (let i = 0; i < accessGroups.length; i++) {
    const ag = accessGroups[i];
    accessGroups[i] = validateAndCleanAccessGroupName(ag);
  }
}

/**
 * - Role must be a string
 * - Must not be empty
 * - Must be one of `student`, `ra`, `maintenance`, `admin`
 *
 * @param {String} role The proposed user role
 * @return {string} The same role, trimmed, and in lowercase form
 */
function validateAndCleanRole(role) {
  if (typeof role !== 'string') throw new Error('Role was not a string');
  role = role.trim().toLowerCase();
  if (role.length === 0) {
    throw new Error('Role was empty or spaces');
  }
  if (!role.match(/(student|ra|maintenance|admin)/)) {
    throw new Error('Role did not match valid roles');
  }
  return role;
}

module.exports = {
  validateAndCleanEmail,
  validateAndCleanName,
  validatePassword,
  validateAndCleanAccessGroups,
  validateAndCleanRole,
};
