const mongoose = require("mongoose");
// noinspection JSUnresolvedVariable
const SchemaObjectId = mongoose.ObjectId;
const Schema = mongoose.Schema;
const Building = require("./building");
const User = require("./user");
const MachineModel = require("./machineModel");

const appointmentSchema = new Schema(
  {
    buildingId: {
      type: SchemaObjectId,
      required: true,
      validate: [
        async function () {
          return await Building.exists({ _id: this.buildingId });
        },
        "Building ID was not found in the Buildings database",
      ],
    },
    userId: {
      type: SchemaObjectId,
      required: true,
      validate: [
        async function () {
          return await User.exists({ _id: this.userId });
        },
        "The user was not found in the users database",
      ],
    },
    machineId: {
      type: SchemaObjectId,
      required: true,
      validate: [
        async function () {
          return await Building.exists({
            $or: [
              { "washers._id": this.machineId },
              { "driers._id": this.machineId },
            ],
          });
        },
        "The machine was not found as a washer/drier in any of the buildings",
      ],
    },
    cycleId: {
      type: SchemaObjectId,
      required: true,
      validate: {
        validator: async function () {
          const b = await Building.findOne({
            $or: [
              { "washers._id": this.machineId },
              { "driers._id": this.machineId },
            ],
          }).exec();
          if (!b) return false;
          const m = getMachine(b, this.machineId);
          const modelId = m["modelId"];
          const model = await MachineModel.findById(modelId).exec();
          if (!model) return false;
          return modelContainsCycle(model, this.cycleId);
        },
        message: "The specified cycle does not exist for the washer specified",
      },
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
  }
);

const Appointment = mongoose.model("Appointments", appointmentSchema);
module.exports = Appointment;

/**
 * Get the machine from the building document with the id
 * @param {Object} b Building document
 * @param {ObjectId} mId The object ID of the machine to get
 * @return {Object|null} The machine with the given ID
 */
function getMachine(b, mId) {
  const fieldsToCheck = ["washers", "driers"];
  let res = null;
  fieldsToCheck.forEach((field) => {
    const listOfMachines = b[field];
    listOfMachines.forEach((machine) => {
      if (machine._id.toString() === mId.toString()) {
        res = machine;
      }
    });
  });
  return res;
}

/**
 * Check if the model document contains the cycle ID.
 * @param {Object} model The model document to search
 * @param {ObjectId} cycle The id to search the model document for
 * @return {Boolean} Whether the cycle exists in the model document
 */
function modelContainsCycle(model, cycle) {
  const arr = model["cycles"];
  let res = false;
  arr.forEach((cycleDoc) => {
    if (cycleDoc._id.toString() === cycle.toString()) res = true;
  });
  return res;
}
