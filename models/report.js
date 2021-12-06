const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SchemaObjectId = mongoose.ObjectId;
const validation = require("../inputVerification");

const reportSchema = new Schema(
  {
    reportType: {
      type: String,
      required: true,
      enum: ["building", "machine"],
      validate: (v) => {
        validation.general.verifyArg(
          v,
          "ReportType",
          "Report Schema",
          "string"
        );
      },
    },
    reporterId: {
      type: SchemaObjectId,
      required: true,
    },
    entityId: {
      type: SchemaObjectId,
      required: true,
    },
    comment: {
      type: String,
      required: false,
      validate: (v) => {
        validation.general.verifyArg(v, "Comment", "Report Schema", "string");
      },
    },
    severity: {
      type: String,
      enum: ["inconvenient", "minor", "catastrophic"],
      required: true,
    },
    resolved: {
      type: Boolean,
      validate: (v) =>
        validation.general.verifyArg(v, "Resolved", "Report Schema", "boolean"),
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
