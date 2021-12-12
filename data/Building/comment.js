const User = require("../../models/user");
const Building = require("../../models/building");
const ObjectId = require("mongoose").Types.ObjectId;
const validateAccess = require("./validateAccess");
/**
 * Validate inputs to comment
 * @param {string} buildingId The id of the building to take the comment
 * @param {String} posterId The poster's ID
 * @param {String} message The message being posted
 */
async function validateAndCleanComment(buildingId, posterId, message) {
  if (typeof buildingId !== "string") {
    throw new Error("Expected BuildingId to be a string");
  }
  let buildingIdAsObjectId;
  try {
    buildingIdAsObjectId = new ObjectId(buildingId.trim());
  } catch (e) {
    throw new Error("Building ID was not a valid ObjectId");
  }
  if (typeof posterId !== "string") {
    throw new Error("Expected posterId to be a string");
  }
  let posterIdAsObjectId;
  try {
    posterIdAsObjectId = new ObjectId(posterId.trim());
  } catch (e) {
    throw new Error("Poster ID was not a valid ObjectId");
  }
  if (typeof message !== "string") {
    throw new Error("Expected the message to be a string");
  }
  message = message.trim();
  if (message === "") throw new Error("Empty comments are not allowed");
  if (!(await Building.exists({ _id: buildingIdAsObjectId }))) {
    throw new Error("Cannot post review to nonexistent building");
  }
  if (!(await User.exists({ _id: posterIdAsObjectId }))) {
    throw new Error("Cannot post comment by nonexistent user");
  }
  await validateAccess(posterIdAsObjectId, buildingIdAsObjectId);
  return {
    buildingId: buildingIdAsObjectId,
    posterId: posterIdAsObjectId,
    message,
  };
}

/**
 * Post a comment
 * @param {string} buildingId The id of the building to take the comment
 * @param {String} posterId The poster's ID
 * @param {String} message The message being posted
 */
async function comment(buildingId, posterId, message) {
  ({ buildingId, posterId, message } = await validateAndCleanComment(
    buildingId,
    posterId,
    message
  ));

  const commentObj = {
    posterId,
    message,
    timestamp: Date.now(),
  };

  return await Building.updateOne(
    { _id: buildingId },
    { $push: { comments: commentObj } }
  ).exec();
}

module.exports = { comment };
