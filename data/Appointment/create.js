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
    if (washer._id.toString() == mId) {
      found = washer;
    }
  });
  if (found) return found;

  doc['driers'].forEach((drier) => {
    if (drier._id.toString() == mId) {
      found = drier;
    }
  });
  if (found) return found;
  throw new Error('Found building with machine but unable to extract it');
  return null;
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
    if (c._id.toString() == cId) found = c;
  });
  if (found) return found;
  throw new Error('Found machine with cycle but unable to extract it');
  return null;
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

  try {
    oid = new ObjectId(oid);
  } catch (err) {
    throw new Error(`${oidName} was an invalid object id`);
  }
  return oid;
}

/**
 * Determine if a cycle can be completed in the requested appointment
 * @param {Date} startTimestamp When the appointment starts
 * @param {String} cycleDurationString hh:mm:ss duration of the cycle
 * @param {Date} endTimestamp When the appointment is supposed to end
 */
function verifyEnoughTime(startTimestamp, cycleDurationString, endTimestamp) {
  durationMatches = cycleDurationString.match(/(\d{2}):(\d{2}):(\d{2})/);
  hours = parseInt(durationMatches[1], 10);
  minutes = parseInt(durationMatches[2], 10);
  seconds = parseInt(durationMatches[3], 10);
  earliestEndDate = moment(startTimestamp)
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
  buildingId = cleanAndVerifyObjectId(buildingId, 'Building id');
  userId = cleanAndVerifyObjectId(userId, 'User id');
  machineId = cleanAndVerifyObjectId(machineId, 'Machine id');
  cycleId = cleanAndVerifyObjectId(cycleId, 'Cycle id');

  if (
    !(await Building.exists({
      _id: buildingId,
      $or: [{'washers._id': machineId}, {'driers._id': machineId}],
    }))
  ) {
    throw new Error('Building with specified machine does not exist');
  }
  const building = await Building.findById(buildingId);
  console.log('Machine ID: ' + machineId);
  machine = findMachine(building, machineId);
  machineModelId = machine.modelId;
  if (!(await MachineModel.exists({_id: machineModelId}))) {
    throw new Error('Machine model does not exist. Was it removed?');
  }
  if (
    !(await MachineModel.exists({'_id': machineModelId, 'cycles._id': cycleId}))
  ) {
    throw new Error('The specified machine does not have the requested cycle');
  }
  machineModelDoc = await MachineModel.findById(machineModelId);
  cycle = findCycle(machineModelDoc, cycleId);
  cycleDurationString = cycle.time;
  verifyEnoughTime(startTimestamp, cycleDurationString, endTimestamp);
  if (!(await User.exists({_id: userId}))) {
    throw new Error('The user making the appointment does not exist');
  }
  await validateUserAccessBuilding(userId, buildingId);

  return {
    buildingId,
    userId,
    machineId,
    cycleId,
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
  ({buildingId, userId, machineId, cycleId, startTimestamp, endTimestamp} =
    await cleanAndVerify(
        buildingId,
        userId,
        machineId,
        cycleId,
        startTimestamp,
        endTimestamp,
    ));
  return await Appointment.create({
    buildingId,
    userId,
    machineId,
    cycleId,
    startTimestamp,
    endTimestamp,
  });
}

module.exports = create;
