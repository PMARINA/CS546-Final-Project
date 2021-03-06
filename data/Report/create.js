ObjectId = require("mongoose").Types.ObjectId;
Report = require("../../models/report");
Building = require("../../models/building");
User = require("../../models/user");
validateUserHasAccess = require("../Building/validateAccess");

/**
 * Create a user report
 * @param {String} type building|machine
 * @param {String} reporterId ObjectId
 * @param {String} entityId ObjectId
 * @param {String} comment
 * @param {String} severity How bad is it?
 * @return {Object}
 */
async function validateAndClean(type, reporterId, entityId, comment, severity) {
  if (typeof type !== "string") {
    throw new Error("Report type was not a string");
  }
  type = type.trim().toLowerCase();
  if (type !== "machine" && type !== "building") {
    throw new Error("Report type was invalid (building|machine)");
  }

  if (typeof reporterId !== "string") {
    throw new Error("Expected reporter id to be a string");
  }
  reporterId = reporterId.trim();
  let reporterIdAsObjectId;
  try {
    reporterIdAsObjectId = new ObjectId(reporterId);
  } catch (err) {
    throw new Error("Reporter ID was not a valid ObjectId");
  }

  if (typeof entityId !== "string") {
    throw new Error("Expected Entity id to be a string");
  }
  entityId = entityId.trim();

  let entityIdAsObject;
  try {
    entityIdAsObject = new ObjectId(entityId);
  } catch (err) {
    throw new Error("Entity ID was not a valid ObjectId");
  }

  if (typeof comment !== "string") {
    throw new Error("Expected the comment to be a string");
  }
  comment = comment.trim();
  if (comment.length <= 0) throw new Error("Expected a non-empty comment");

  if (typeof severity !== "string") {
    throw new Error("Expected severity to be a string");
  }
  severity = severity.trim().toLowerCase();
  if (
    severity !== "inconvenient" &&
    severity !== "minor" &&
    severity !== "catastrophic"
  ) {
    throw new Error("Expected severity to be inconvenient|minor|catastrophic");
  }

  if (!(await User.exists({ _id: reporterIdAsObjectId }))) {
    throw new Error("The reporter does not exist in the users DB");
  }
  let buildingId = undefined;
  if (type === "building") {
    buildingId = entityIdAsObject;
    if (!(await Building.exists({ _id: buildingId }))) {
      throw new Error("The building does not exist");
    }
    await validateUserHasAccess(reporterIdAsObjectId, buildingId);
  } else if (type === "machine") {
    if (
      !(await Building.exists({
        $or: [
          { "washers._id": entityIdAsObject },
          { "driers._id": entityIdAsObject },
        ],
      }))
    ) {
      throw new Error("No building contains a machine with the specified id");
    }
    buildingId = await Building.findOne({
      $or: [
        { "washers._id": entityIdAsObject },
        { "driers._id": entityIdAsObject },
      ],
    }).exec();
    await validateUserHasAccess(reporterIdAsObjectId, buildingId);
  } else {
    throw new Error(
      `Type (${type}) has not been implemented in data/Report/create.js`
    );
  }

  return {
    type,
    reporterId: reporterIdAsObjectId,
    entityId: entityIdAsObject,
    comment,
    severity,
  };
}

/**
 * Create a user report
 * @param {String} type building|machine
 * @param {String} reporterId ObjectId
 * @param {String} entityId ObjectId
 * @param {String} comment
 * @param {String} severity How bad is it?
 */
async function create(type, reporterId, entityId, comment, severity) {
  ({ type, reporterId, entityId, comment, severity } = await validateAndClean(
    type,
    reporterId,
    entityId,
    comment,
    severity
  ));
  await Report.create({
    reportType: type,
    reporterId,
    entityId,
    comment,
    severity,
  });
}

module.exports = create;
