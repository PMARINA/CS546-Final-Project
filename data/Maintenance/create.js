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
  const startDateAsDate = moment(startDate.trim()).toDate();
  if (isNaN(startDateAsDate.valueOf())) throw new Error('Invalid start date');
  const endDateAsDate = moment(endDate.trim()).toDate();
  if (isNaN(endDateAsDate.valueOf())) throw new Error('Invalid end date');
  machineId = machineId.trim();
  let machineIdAsObjectId;
  try {
    machineIdAsObjectId = new ObjectId(machineId);
  } catch (e) {
    throw new Error('The provided machine id was not valid');
  }
  note = note.trim();
  if (note === '') throw new Error('Note must not be empty');
  if (
    !(await Building.exists({
      $or: [{'washers._id': machineIdAsObjectId}, {'driers._id': machineIdAsObjectId}],
    }))
  ) {
    throw new Error('Machine does not exist');
  }
  return {startDateAsDate, endDateAsDate, machineIdAsObjectId, machineId};
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
  const cleanedParams = await checkParams(
      startDate,
      endDate,
      machineId,
      note,
  );
  return await Maintenance.create({
    startDate: cleanedParams.startDate,
    endDate: cleanedParams.endDate,
    machineId: cleanedParams.machineId,
    note: cleanedParams.note,
  });
}

module.exports = create;
