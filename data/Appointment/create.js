const moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId;
const Building = require('../../models/building');
const MachineModel = require('../../models/machineModel');
const User = require('../../models/user');
const validateUserAccessBuilding = require('../Building/validateAccess');
const Appointment = require('../../models/appointment');

/**
 *
 * @param {Object} doc The building document to search
 * @param {Object} machineId Machine object id
 * @return {Object} The machine entry
 */
function findMachine(doc, machineId) {
  const mId = machineId.toString();
  let found = undefined;
  doc['washers'].forEach((washer) => {
    console.log(washer);
    if (washer._id.toString() === mId) {
      found = washer;
    }
  });
  if (found) return found;

  doc['driers'].forEach((drier) => {
    if (drier._id.toString() === mId) {
      found = drier;
    }
  });
  if (found) return found;
  throw new Error('Found building with machine but unable to extract it');
}
/**
 *
 * @param {Object} doc MachineModel document to search
 * @param {Object} cycleId The cycle id to search for
 * @return {Object} The specific cycle
 */
function findCycle(doc, cycleId) {
  const cId = cycleId.toString();
  let found = undefined;
  doc['cycles'].forEach((c) => {
    if (c._id.toString() === cId) found = c;
  });
  if (found) return found;
  throw new Error('Found machine with cycle but unable to extract it');
}

/**
 *
 * @param {String|Date} ts the Timestamp to verify & clean
 * @param {String} tsName The name of the timestamp
 * @return {Date} The cleaned timestamp
 */
function cleanAndVerifyTimestamp(ts, tsName) {
  if (typeof ts !== 'string' && typeof ts !== 'object') {
    throw new Error(`${tsName} must be a string or a Date`);
  }
  if (typeof ts === 'object') {
    if (!ts instanceof Date) {
      throw new Error(`${tsName} must be a Date object`);
    }
  } else {
    ts = moment(ts.trim()).toDate();
  }

  if (isNaN(ts.valueOf())) {
    throw new Error(`${tsName} was an invalid date`);
  }
  return ts;
}

/**
 *
 * @param {String} oid ObjectId
 * @param {String} oidName The name of the object id
 * @return {ObjectId}
 */
function cleanAndVerifyObjectId(oid, oidName) {
  if (typeof oid !== 'string') {
    throw new Error(`Expected ObjectId (${oidName}) to be a string`);
  }
  let oidAsObject;
  try {
    oidAsObject = new ObjectId(oid);
  } catch (err) {
    throw new Error(`${oidName} was an invalid object id`);
  }
  return oidAsObject;
}

/**
 * Determine if a cycle can be completed in the requested appointment
 * @param {Date} startTimestamp When the appointment starts
 * @param {String} cycleDurationString hh:mm:ss duration of the cycle
 * @param {Date} endTimestamp When the appointment is supposed to end
 */
function verifyEnoughTime(startTimestamp, cycleDurationString, endTimestamp) {
  const durationMatches = cycleDurationString.match(/(\d{2}):(\d{2}):(\d{2})/);
  const hours = parseInt(durationMatches[1], 10);
  const minutes = parseInt(durationMatches[2], 10);
  const seconds = parseInt(durationMatches[3], 10);
  const earliestEndDate = moment(startTimestamp)
      .add(hours, 'hours')
      .add(minutes, 'minutes')
      .add(seconds, 'seconds')
      .toDate();
  if (earliestEndDate > endTimestamp) {
    throw new Error(
        'The cycle cannot possibly end before the requested end date',
    );
  }
}

/**
 *
 * @param {String} buildingId
 * @param {String} userId
 * @param {String} machineId
 * @param {String} cycleId
 * @param {String|Date} startTimestamp
 * @param {String|Date} endTimestamp
 * @return {Object}
 */
async function cleanAndVerify(
    buildingId,
    userId,
    machineId,
    cycleId,
    startTimestamp,
    endTimestamp,
) {
  startTimestamp = cleanAndVerifyTimestamp(
      startTimestamp,
      'Starting timestamp',
  );
  endTimestamp = cleanAndVerifyTimestamp(endTimestamp, 'Ending timestamp');
  const buildingIdAsObjectId = cleanAndVerifyObjectId(buildingId, 'Building id');
  const userIdAsObjectId = cleanAndVerifyObjectId(userId, 'User id');
  const machineIdAsObjectId = cleanAndVerifyObjectId(machineId, 'Machine id');
  const cycleIdAsObjectId = cleanAndVerifyObjectId(cycleId, 'Cycle id');

  if (
    !(await Building.exists({
      _id: buildingIdAsObjectId,
      $or: [{'washers._id': machineIdAsObjectId}, {'driers._id': machineIdAsObjectId}],
    }))
  ) {
    throw new Error('Building with specified machine does not exist');
  }
  const building = await Building.findById(buildingIdAsObjectId);
  console.log('Machine ID: ' + machineIdAsObjectId);
  const machine = findMachine(building, machineIdAsObjectId);
  const machineModelId = machine.modelId;
  if (!(await MachineModel.exists({_id: machineModelId}))) {
    throw new Error('Machine model does not exist. Was it removed?');
  }
  if (
    !(await MachineModel.exists({'_id': machineModelId, 'cycles._id': cycleIdAsObjectId}))
  ) {
    throw new Error('The specified machine does not have the requested cycle');
  }
  const machineModelDoc = await MachineModel.findById(machineModelId);
  const cycle = findCycle(machineModelDoc, cycleIdAsObjectId);
  const cycleDurationString = cycle.time;
  verifyEnoughTime(startTimestamp, cycleDurationString, endTimestamp);
  if (!(await User.exists({_id: userIdAsObjectId}))) {
    throw new Error('The user making the appointment does not exist');
  }
  await validateUserAccessBuilding(userIdAsObjectId, buildingIdAsObjectId);

  return {
    buildingId: buildingIdAsObjectId,
    userId: userIdAsObjectId,
    machineId: machineIdAsObjectId,
    cycleId: cycleIdAsObjectId,
    startTimestamp,
    endTimestamp,
  };
}

/**
 *
 * @param {String} buildingId
 * @param {String} userId
 * @param {String} machineId
 * @param {String} cycleId
 * @param {String|Date} startTimestamp
 * @param {String|Date} endTimestamp
 * @return {Object}
 */
async function create(
    buildingId,
    userId,
    machineId,
    cycleId,
    startTimestamp,
    endTimestamp,
) {
  const returned =
    await cleanAndVerify(
        buildingId,
        userId,
        machineId,
        cycleId,
        startTimestamp,
        endTimestamp,
    );
  return await Appointment.create({
    buildingId: returned.buildingId,
    userId: returned.userId,
    machineId: returned.machineId,
    cycleId: returned.cycleId,
    startTimestamp: returned.startTimestamp,
    endTimestamp: returned.endTimestamp,
  });
}

module.exports = create;
