const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validation = require('../inputVerification');

const reportSchema = new Schema(
    {
      reportType: {
        type: String,
        required: true,
        enum: ['building', 'machine'],
        validate: (v) => {
          validation.general.verifyArg(
              v,
              'ReportType',
              'Report Schema',
              'string',
          );
        },
      },
      reporterId: {
        type: mongoose.ObjectId,
        required: true,
      },
      entityId: {
        type: mongoose.ObjectId,
        required: true,
      },
      comment: {
        type: String,
        required: false,
        validate: (v) => {
          validation.general.verifyArg(v, 'Comment', 'Report Schema', 'string');
        },
      },
      severity: {
        type: String,
        enum: ['Inconvenient', 'Minor', 'Catastrophic'],
        required: true,
      },
      resolved: {
        type: Boolean,
        required: true,
        validate: (v) =>
          validation.general.verifyArg(v, 'Resolved', 'Report Schema', 'boolean'),
        default: false,
      },
    },
    {
      timestamps: true,
    },
);

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
