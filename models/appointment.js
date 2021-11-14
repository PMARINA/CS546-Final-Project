const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Building = require('./building');
const User = require('./user');
const MachineModel = require('./machineModel');

const appointmentSchema = new Schema(
    {
      buildingId: {
        type: mongoose.ObjectId,
        required: true,
        validate: [
          async function() {
            return await Building.exists({_id: this.buildingId}).exec();
          },
          'Building ID was not found in the Buildings database',
        ],
      },
      userId: {
        type: mongoose.ObjectId,
        required: true,
        validate: [
          async function() {
            return await User.exists({_id: this.userId}).exec();
          },
          'The user was not found in the users database',
        ],
      },
      machineId: {
        type: mongoose.ObjectId,
        required: true,
        validate: [
          async function() {
            return await Building.exists({
              $or: [
                {'washers._id': this.machineId},
                {'driers._id': this.machineId},
              ],
            }).exec();
          },
          'The machine was not found as a washer/drier in any of the buildings',
        ],
      },
      cycleId: {
        type: mongoose.ObjectId,
        required: true,
        validate: [
          async function() {
            const b = await Building.findOne({
              $or: [
                {'washers._id': this.machineId},
                {'driers._id': this.machineId},
              ],
            }).exec();
            if (!b) return false;
            const m = getMachine(b, this.machineId);
            const modelId = m['modelId'];
            const model = await MachineModel.findOneById(modelId).exec();
            if (!model) return false;
            return modelContainsCycle(model, this.cycleId);
          },
          'The specified cycle does not exist for the washer specified',
        ],
      },
      startTimestamp: {
        type: Date,
        required: true,
      },
      endTimestamp: {
        type: Date,
        required: true,
      },
      userHasCheckedIn: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    },
);

const Appointment = mongoose.model('Appointments', appointmentSchema);
module.exports = Appointment;

/**
 * Get the machine from the building document with the id
 * @param {Object} b Building document
 * @param {ObjectId} mId The object ID of the machine to get
 * @return {Object|null} The machine with the given ID
 */
function getMachine(b, mId) {
  const fieldsToCheck = ['washers', 'driers'];
  fieldsToCheck.forEach((field) => {
    const listOfMachines = b[field];
    listOfMachines.forEach((machine) => {
      if (machine._id === mId) {
        return machine;
      }
    });
  });
  return null;
}

/**
 * Check if the model document contains the cycle ID.
 * @param {Object} model The model document to search
 * @param {ObjectId} cycle The id to search the model document for
 * @return {Boolean} Whether the cycle exists in the model document
 */
function modelContainsCycle(model, cycle) {
  const arr = model['cycles'];
  arr.forEach((cycleDoc) => {
    if (cycleDoc._id === cycle) return true;
  });
  return false;
}
