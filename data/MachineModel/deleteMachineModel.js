const Model = require('../../models/machineModel');

/**
 * Delete a MachineModel
 * @param {String} name
 */
async function deleteMachineModel(name) {
  await Model.remove({name:{$eq:name}},{justOne:true});
}

module.exports = deleteMachineModel;
