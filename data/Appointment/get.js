Appointment = require('../../models/appointment');
User = require('../User');
ObjectId = require('mongoose').Types.ObjectId;

/**
 *
 * @param {String} userId The user's ObjectId
 * @param {Date} [after] Return only appointments at/after this date
 * @return {Promise<Object[]>}
 */
async function get(userId, after = null) {
  if (typeof userId !== 'string') throw new Error('UserId was not a string');
  try {
    new ObjectId(userId);
  } catch (e) {
    throw new Error('UserId was not a valid Mongoose/MongoDB ObjectId');
  }
  if (isNaN(after.getTime())) throw new Error('Date was not a number (NaN)');
  const userExists = await User.exists(userId);
  if (!userExists) return [];
  let appointments;
  if (after) {
    appointments = await Appointment.find({startTimestamp: {$gte: after}, userId}).lean();
  } else {
    appointments = await Appointment.find({userId}).lean();
  }
  return appointments;
}

module.exports = {get};
