/* eslint-disable linebreak-style */
const User = require('../../models/user');
const Building = require('../../models/building');
const ObjectId = require('mongoose').Types.ObjectId;
const validateAccess = require('./validateAccess');
const Filter = require('bad-words');
/**
 * Validate inputs to comment
 * @param {string} buildingId The id of the building to take the comment
 * @param {String} posterId The poster's ID
 * @param {String} message The message being posted
 */
async function validateAndCleanComment(buildingId, posterId, message) {
  if (typeof buildingId !== 'string') {
    throw new Error('Expected BuildingId to be a string');
  }
  try {
    buildingId = new ObjectId(buildingId);
  } catch (e) {
    throw new Error('Building ID was not a valid ObjectId');
  }
  if (typeof posterId !== 'string') {
    throw new Error('Expected posterId to be a string');
  }
  try {
    posterId = new ObjectId(posterId);
  } catch (e) {
    throw new Error('Poster ID was not a valid ObjectId');
  }
  if (typeof message !== 'string') {
    throw new Error('Expected the message to be a string');
  }
  message = message.trim();
  if (message === '') throw new Error('Empty comments are not allowed');
  if (!(await Building.exists({_id: buildingId}))) {
    throw new Error('Cannot post review to nonexistent building');
  }

  // Filtering bad words with stars
  const filter = new Filter();
  filter.clean(message);

  if (!(await User.exists({_id: posterId}))) {
    throw new Error('Cannot post comment by nonexistent user');
  }
  await validateAccess(posterId, buildingId);
  return {buildingId, posterId, message};
}

/**
 * Post a comment
 * @param {string} buildingId The id of the building to take the comment
 * @param {String} posterId The poster's ID
 * @param {String} message The message being posted
 */
async function comment(buildingId, posterId, message) {
  ({buildingId, posterId, message} = await validateAndCleanComment(
      buildingId,
      posterId,
      message,
  ));

  const commentObj = {
    posterId,
    message,
    timestamp: Date.now(),
  };

  return await Building.updateOne(
      {_id: buildingId},
      {$push: {comments: commentObj}},
  ).exec();
}

/**
 * Modify a comment
 * @param {string} buildingId The id of the building to take the comment
 * @param {String} posterId The poster's ID
 * @param {String} oldMessage The old message to idenify which comment to change
 * @param {String} newMessage The new message replacing the old message
 */
async function modifyComment(buildingId, posterId, oldMessage, newMessage) {
  ({buildingId, posterId, newMessage} = await validateAndCleanComment(
      buildingId,
      posterId,
      newMessage,
  ));
  const commentObj = {
    posterId,
    newMessage,
    timestamp: Date.now(),
  };
  return await Building.updateOne(
      {_id: buildingId},
      {$set: {'comments.indexOf(oldMessage)': commentObj}},
  );
}

/**
 * Delete a comment
 * @param {string} buildingId The id of the building to take the comment
 * @param {String} posterId The poster's ID
 * @param {String} message The old message to idenify which comment to change
 */
async function deleteComment(buildingId, posterId, message) {
  ({buildingId, posterId, newMessage} = await validateAndCleanComment(
      buildingId,
      posterId,
      message,
  ));
  // May need to address pulling all instances of exact comment. It is an open issue in mongodb.
  return await Building.updateOne(
      {_id: buildingId},
      {$pull: {'comments': message}},
  );
}

module.exports = {
  comment,
  modifyComment,
  deleteComment,
};
