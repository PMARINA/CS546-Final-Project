const Building = require('../../models/building');
const User = require('../../models/user');
const ObjectId = require('mongoose').Types.ObjectId;
const validateAccess = require('./validateAccess');

/**
 * Validate & Clean the parameters
 * @param {String} buildingId
 * @param {String} parentCommentId
 * @param {String} posterId
 * @param {String} message
 * @return {Object} The params
 */
async function validateAndClean(
    buildingId,
    parentCommentId,
    posterId,
    message,
) {
  if (typeof buildingId !== 'string') {
    throw new Error('Building id must be a string');
  }
  if (typeof parentCommentId !== 'string') {
    throw new Error('Parent comment id must be a string');
  }
  if (typeof posterId !== 'string') {
    throw new Error('Poster id must be a string');
  }
  if (typeof message !== 'string') throw new Error('Message must be a string');

  let buildingIdAsObjectId;
  try {
    buildingIdAsObjectId = new ObjectId(buildingId);
  } catch (err) {
    throw new Error('Building id was an invalid object id');
  }

  let parentCommentIdAsObjectId;
  try {
    parentCommentIdAsObjectId = new ObjectId(parentCommentId);
  } catch (err) {
    throw new Error('Parent comment id was an invalid object id');
  }

  let posterIdAsObjectId;
  try {
    posterIdAsObjectId = new ObjectId(posterId);
  } catch (err) {
    throw new Error('Poster id was an invalid object id');
  }
  message = message.trim();
  if (message.length === 0) throw new Error('Message cannot be blank');

  if (!(await Building.exists({_id: buildingIdAsObjectId}))) {
    throw new Error('Building with specified id does not exist');
  }
  if (!(await User.exists({_id: posterIdAsObjectId}))) {
    throw new Error('User with specified id does not exist');
  }
  if (
    !(await Building.exists({
      '_id': buildingIdAsObjectId,
      'comments._id': parentCommentIdAsObjectId,
    }))
  ) {
    throw new Error(
        'Building with the specified comment and id does not exist',
    );
  }
  await validateAccess(posterIdAsObjectId, buildingIdAsObjectId);
  return {buildingId: buildingIdAsObjectId, parentCommentId: parentCommentIdAsObjectId, posterId: posterIdAsObjectId, message};
}

/**
 * Create a reply to a comment
 * @param {String} buildingId
 * @param {String} parentCommentId
 * @param {String} posterId
 * @param {String} message
 * @return {Object}
 */
async function reply(buildingId, parentCommentId, posterId, message) {
  ({buildingId, parentCommentId, posterId, message} = await validateAndClean(
      buildingId,
      parentCommentId,
      posterId,
      message,
  ));
  return await Building.updateOne(
      {'_id': buildingId, 'comments._id': parentCommentId},
      {
        $push: {
          'comments.$.replies': {
            posterId,
            message,
            timestamp: Date.now(),
          },
        },
      },
  ).exec();
}

module.exports = {reply};
