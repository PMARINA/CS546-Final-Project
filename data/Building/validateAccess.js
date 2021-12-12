const Building = require("../../models/building");
const User = require("../../models/user");

/**
 * Determine if the user has access to the building
 * @param {Object} posterId
 * @param {Object} buildingId
 */
async function validateAccess(posterId, buildingId) {
  const building = await Building.findOne({ _id: buildingId }).exec();
  const user = await User.findOne({ _id: posterId }).exec();
  const userAccessGroups = user.accessGroups;
  const buildingAccessGroups = building.accessGroups;
  if (
    !(
      (Array.isArray(buildingAccessGroups) &&
        buildingAccessGroups.length === 0) ||
      buildingAccessGroups === undefined
    )
  ) {
    const buildingAccessGroupsSet = new Set(buildingAccessGroups);
    let userHasAccess = false;
    for (let i = 0; i < userAccessGroups.length; i++) {
      if (buildingAccessGroupsSet.has(userAccessGroups[i]))
        userHasAccess = true;
    }
    if (!userHasAccess) {
      throw new Error("User does not have access to the building");
    }
  }
}
module.exports = validateAccess;
