const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validation = require('../inputVerification');

const maintenanceSchema = new Schema(
    {
      machineId: {
        type: mongoose.ObjectId,
        required: true,
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      note: {
        type: String,
        required: false,
        validate: (v) => {
          validation.general.verifyArg(v, 'Note', 'Maintenance Schema', 'string');
        },
      },
    },
    {
      timestamps: true,
    },
);

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
module.exports = Maintenance;
