const moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId;
const Maintenance = require('../../models/maintenance');
const Building = require('../../models/building');
/**
 * Check params for create
 * @param {String} startDate
 * @param {String} endDate
 * @param {String} machineId ObjectId in string form
 * @param {String} note The note re why maintenance is occurring
 * @return {Object} The modified params
 */
async function checkParams(startDate, endDate, machineId, note) {
  if (typeof startDate !== 'string') {
    throw new Error('startDate must be a string');
  }
  if (typeof endDate !== 'string') throw new Error('endDate must be a string');
  if (typeof machineId !== 'string') {
    throw new Error('machineId must be a string');
  }
  if (typeof note !== 'string') throw new Error('Note must be a string');
  startDate = moment(startDate.trim());
  endDate = moment(endDate.trim());
  machineId = machineId.trim();
  try {
    machineId = new ObjectId(machineId);
  } catch (e) {
    throw new Error('The provided machine id was not valid');
  }
  note = note.trim();
  if (note === '') throw new Error('Note must not be empty');
  if (
    !(await Building.exists({
      $or: [{'washers._id': machineId}, {'driers._id': machineId}],
    }))
  ) {
    throw new Error('Machine does not exist');
  }
  return {startDate, endDate, machineId, note};
}

/**
 * Create a period of planned maintenance
 * @param {String} startDate
 * @param {String} endDate
 * @param {String} machineId ObjectId in string form
 * @param {String} note The note re why maintenance is occurring
 * @return {Object}
 */
async function create(startDate, endDate, machineId, note) {
  ({startDate, endDate, machineId, note} = await checkParams(
      startDate,
      endDate,
      machineId,
      note,
  ));
  return await Maintenance.create({startDate, endDate, machineId, note});
}

module.exports = create;
