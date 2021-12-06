const moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId;
const Maintenance = require('../../models/maintenance');

/**
 * Delete a period of planned maintenance
 * @param {String} machineId
 */
async function deleteMaintenace(machineId) {
  await Maintenance.remove({machineId:{$eq:machineId}},{justOne:true});
}

module.exports = deleteMaintenace;
