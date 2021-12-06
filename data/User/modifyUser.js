const User = require("../../models/user");
const ObjectId = require("mongoose").Types.ObjectId;

const validKeysForParams = new Set([
  "email",
  "password",
  "accessGroup",
  "role",
]);
const validNameKeys = new Set(["first", "last"]);

/**
 * Verify the user exists
 * @param {String} userId The Id of the user to check
 * @param {String} argName The name of the arg to refer to in the error
 * @return {Promise<void>}
 */
async function validateUser(userId, argName) {
  if (typeof userId !== "string")
    throw new Error(`The provided UserId (${argName}) was not a string`);
  let userObjectId;
  try {
    userObjectId = new ObjectId(userId);
  } catch (e) {
    throw new Error(
      `The provided UserId (${argName}) was not a valid ObjectId`
    );
  }
  if (userObjectId === null)
    throw new Error(`The provided UserId (${argName}) was null`);
  const userObject = await User.findById(userId).exec();
  if (userObject === null)
    throw new Error(
      `The provided UserId (${argName}) was not found in the database`
    );
}

/**
 * Validate that the modification is valid
 * @param {String} userIdToModify The string representation of the user id that should be modified
 * @param {String} userIdAttemptingModification The id of the user attempting the modification
 * @param {Object} params Contains the new values to put into the DB
 * @return {Promise<Object>}
 */
async function validateModification(
  userIdToModify,
  userIdAttemptingModification,
  params
) {
  // Validate the user IDs
  await validateUser(userIdToModify, "ID of User to Modify");
  await validateUser(
    userIdAttemptingModification,
    "ID of User Attempting Modification"
  );
  // Anyone can modify their own properties
  if (userIdToModify !== userIdAttemptingModification) {
    const roleOfUserToModify = (
      await User.findById(userIdToModify, { _id: 0, role: 1 }).exec()
    ).role;
    if (roleOfUserToModify === "admin")
      throw new Error("Only an admin can modify their own user properties.");
    const roleOfModifier = (
      await User.findById(userIdAttemptingModification, {
        _id: 0,
        role: 1,
      }).exec()
    ).role;
    if (roleOfModifier !== "admin")
      throw new Error("Only an admin can modify another user's params");
  } else {
    if (typeof params.role === "string") {
      const requestedRole = params.role;
      const roleOfUserToModify = (
        await User.findById(userIdToModify, { _id: 0, role: 1 }).exec()
      ).role;
      if (requestedRole !== roleOfUserToModify)
        throw new Error("You are not allowed to change your own role");
    } // the else case is taken care of by the validation of the params object
  }

  // Validate the params object
  if (typeof params !== "object") throw new Error("Params was not an object");
  if (params === null) throw new Error("Params was null");
  const validatedParams = {};
  for (let [key, value] of Object.entries(params)) {
    key = key.trim();
    if (validKeysForParams.has(key)) {
      if (typeof value === "string") {
        value = value.trim();
        if (value === "")
          throw new Error(
            `Not allowed to set an empty (or spaces) for key: ${key}`
          );
        validatedParams[key] = value.trim();
      } else {
        throw new Error(
          `The object containing modifications contains a non-string param for key ${key}`
        );
      }
    } else {
      if (key === "name") {
        if (typeof value !== "object")
          throw new Error("The value for name must be an object.");
        if (value === null) throw new Error("The name must be non-null");
        // name validation
        for (let [keyInner, valueInner] of Object.entries(value)) {
          // validate name components
          keyInner = keyInner.trim();
          if (!validNameKeys.has(keyInner))
            throw new Error(`name.${keyInner} is not a valid key`);
          if (typeof valueInner !== "string")
            throw new Error(
              `The component of name (name.${keyInner}) must be a string`
            );
          valueInner = valueInner.trim();
          if (valueInner === "")
            throw new Error(
              `The component of name (name.${keyInner}) was blank or spaces`
            );
          if (validatedParams[key] === undefined) validatedParams[key] = {};
          validatedParams[key][keyInner] = valueInner;
        }
      } else {
        throw new Error(
          `It is not possible to modify the value in the user's document for key (${key})`
        );
      }
    }
  }
  return validatedParams;
}

/**
 * Throw an error if the transaction is not allowed
 * @param {String} userIdToModify The userId of the object to be modified
 * @param {String} userAttemptingToModify The userId of the entity requesting the modification
 * @return {Promise<boolean>} Throw an error if invalid, otherwise return true
 */
async function checkUserAllowedToBeModified(
  userIdToModify,
  userAttemptingToModify
) {
  if (userIdToModify === userAttemptingToModify) return true;
  const objectToBeModified = await User.findById(userIdToModify).exec();
  if (objectToBeModified === null) {
    throw new Error("The user requesting the modify operation does not exist");
  }
  const roleOfObjectToModify = objectToBeModified.role;
  // console.log(`User: ${JSON.stringify(objectToBeModified, null, 2)}, Admin: ${userAttemptingToModify}`);
  if (roleOfObjectToModify === "admin")
    throw new Error("Only the admin who uses this account modify its params");
}

// Code taken from StackOverflow: https://stackoverflow.com/a/19101235
Object.flatten = function (data) {
  const result = {};

  /**
   * Recursively assign the properties in the object to result
   * @param {String|Object} cur The current thing we're traversing down to
   * @param {String} prop The property name, as we've traversed so far
   */
  function recurse(cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (var i = 0, l = cur.length; i < l; i++) {
        recurse(cur[i], prop + "[" + i + "]");
      }
      if (l == 0) {
        result[prop] = [];
      }
    } else {
      let isEmpty = true;
      for (const p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + "." + p : p);
      }
      if (isEmpty && prop) {
        result[prop] = {};
      }
    }
  }
  recurse(data, "");
  return result;
};

// End code from StackOverflow

/**
 * Modify a user given a list of params to modify
 * @param {String} userIdToModify The user object to modify
 * @param {String} userIdAttemptingModification The user who is attempting to modify the previous arg
 * @param {Object} params The parameters to change
 */
async function modifyUser(
  userIdToModify,
  userIdAttemptingModification,
  params
) {
  await validateModification(
    userIdToModify,
    userIdAttemptingModification,
    params
  );
  await checkUserAllowedToBeModified(
    userIdToModify,
    userIdAttemptingModification
  );
  await User.updateOne(
    { _id: new ObjectId(userIdToModify) },
    Object.flatten(params)
  );
}

module.exports = modifyUser;
