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
  message = Filter.clean(message);

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
 * @param {String} commentId
 * @param {String} newMessage The new message replacing the old message
 */
async function modifyComment(buildingId, posterId, commentId, newMessage) {
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
      {$set: {'comments._id': commentObj}},
  );
}

/**
 * Delete a comment
 * @param {string} buildingId The id of the building to take the comment
 * @param {String} posterId The poster's ID
 * @param {String} commentId The old messages id
 */
async function deleteComment(buildingId, posterId, commentId) {
  if (!(await User.exists({_id: posterId}))) {
    throw new Error('Cannot delete comment by nonexistent user');
  }
  await validateAccess(posterId, buildingId);
  if (!(await Building.findOne({'comments._id': commentId}))) {
    throw new Error('Cannot delete nonexistent comment.');
  }
  // May need to address pulling all instances of exact comment. It is an open issue in mongodb.
  return await Building.updateOne(
      {_id: buildingId},
      {$pull: {'comments._id': commentId}},
  );
}

module.exports = {
  comment,
  modifyComment,
  deleteComment,
};
