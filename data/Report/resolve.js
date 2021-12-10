const Report = require("../../models/report");
const ObjectId = require("mongoose").Types.ObjectId;

/**
 * Mark a report as resolved.
 * @param {String|ObjectId} reportId The ID of the report to resolve
 * @param {Boolean} reportStatus The end state of the report
 * @param {Boolean} strict Whether to error if existing state is already reportStatus
 */
async function resolveTo(reportId, reportStatus, strict = true) {
  if (typeof reportId != "string" && typeof reportId != "object") {
    throw new Error("Expected reportId to be a String or ObjectId");
  }

  if (typeof reportId == "object" && !(reportId instanceof ObjectId)) {
    throw new Error("Expected ObjectId to be an ObjectId");
  } else {
    try {
      reportId = new ObjectId(reportId);
    } catch (e) {
      throw new Error("The provided ObjectId String was invalid.");
    }
  }

  if (typeof reportStatus !== "boolean") {
    throw new Error("Report Status was not a Boolean");
  }

  if (typeof strict !== "boolean") {
    throw new Error("Strict was not a Boolean");
  }

  report = await Report.findOne(
    { _id: reportId },
    { _id: false, resolved: true }
  );
  if (!report) {
    throw new Error("Report with the given Id was not found");
  }
  if (strict && report.resolved === reportStatus) {
    const reportStatusMsg = reportStatus ? "resolved" : "unresolved";
    throw new Error(`Report was already marked ${reportStatusMsg}`);
  }

  await Report.updateOne(
    { _id: reportId },
    { $set: { resolved: reportStatus } }
  );
}

/**
 * Mark a report as resolved
 * @param {String|Object} reportId The id of the report to mark as resolved
 */
async function markResolved(reportId) {
  await resolveTo(reportId, true);
}

/**
 * Mark a report as not resolved
 * @param {String|Object} reportId The id of the report to mark as unresolved
 */
async function markUnresolved(reportId) {
  await resolveTo(reportId, false);
}

module.exports = {
  markResolved,
  markUnresolved,
};
