const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validation = require('../inputVerification').general;

const cycleSchema = new Schema({
  name: {
    type: String,
    required: true,
    validate: (v) => validation.verifyArg(v, 'Name', 'Cycle Schema', 'string'),
  },
  time: {
    type: String,
    required: true,
    validate: {
      validator: function(s) {
        if (typeof s !== 'string') return false;
        if (!s.match(/\d{2}:\d{2}:\d{2}/)) return false;
        if (s === '00:00:00') return false;
        return true;
      },
      message: 'The duration does not match the expected format',
    },
  },
});

const machineModelSchema = new Schema(
    {
    // "_id": "6176b2a01110c60213c6985f",
      name: {
        type: String,
        required: true,
      // "LG Smart Washer",
      },
      cycles: {
        type: [cycleSchema],
        required: true,
        validate: [
          (v) => Array.isArray(v) && v.length >= 1,
          'There must be at least one cycle for a model',
        ],
      },
    },
    {timestamps: true},
);

const MachineModel = mongoose.model('Models', machineModelSchema);
module.exports = MachineModel;
