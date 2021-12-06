const Model = require('../../models/machineModel');

async function modifyMachineModel(name, cycles) {
  await Model.updateOne({name:{$eq:name}},{$set:{
    "cycles": cycles,
  }});
}

module.exports = modifyMachineModel;
