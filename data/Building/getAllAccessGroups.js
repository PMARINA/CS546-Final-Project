const Building = require("../../models/building");

/**
 * Get a list of all access groups among buildings
 * @return {Promise<String[]>}
 */
async function getAllAccessGroups() {
  const allAccessGroups = new Set();
  for await (const doc of Building.find()) {
    const accessGroups = doc.accessGroups;
    accessGroups.forEach((a) => allAccessGroups.add(a));
  }
  const listOfAccessGroups = Array.from(allAccessGroups);
  listOfAccessGroups.sort();
  return listOfAccessGroups;
}

module.exports = {
  getAllAccessGroups,
};
