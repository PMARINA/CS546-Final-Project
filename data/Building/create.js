const ObjectId = require('mongoose').Types.ObjectId;
const Building = require('../../models/building');
const MachineModel = require('../../models/machineModel');

/**
 * Check if washers/driers is a valid list of objects
 * @param {Object[]} machines The list of washers/driers
 */
async function checkListOfMachines(machines) {
  if (machines === undefined) return;
  if (typeof machines !== 'object') {
    throw new Error('Expected an object for machines (driers/washers)');
  }
  if (!Array.isArray(machines)) {
    throw new Error(
        'Expected the list of machines (washers/driers) to be a list, not an object/other',
    );
  }
  if (machines.length === 0) {
    throw new Error('Got an empty list of machines -- not allowed');
  }
  const setOfMachines = new Set();
  for (let i = 0; i < machines.length; i++) {
    const m = machines[i];
    if (typeof m !== 'object') {
      throw new Error(`Expected machine to be an object, not a(n) ${typeof m}`);
    }
    if (typeof m.name !== 'string') {
      throw new Error(
          `Expected machine name to be a string, not a(n) ${typeof m.name}`,
      );
    }
    machines[i].name = machines[i].name.trim();
    if (machines[i].name.length === 0) {
      throw new Error('Expected non empty name for machine');
    }
    if (setOfMachines.has(machines[i].name)) {
      throw new Error(
          'Cannot have machines with the same name in the same building',
      );
    }
    setOfMachines.add(machines[i].name);
    if (typeof m.modelId !== 'string') {
      throw new Error('Expected a string modelId');
    }
    try {
      machines[i].modelId = new ObjectId(m.modelId);
    } catch (e) {
      throw new Error('Expected valid MongoDB ObjectId in string form');
    }
    if (!(await MachineModel.exists({_id: machines[i].modelId}))) {
      throw new Error('Model ID was not found in the database');
    }
  }
  return machines;
}

/**
 * Validate params for making a building
 * @param {String} name The name of the building
 * @param {Number[]} location Lat/Lon of building
 * @param {[Object[]]} washers Washer object
 * @param {[Object[]]} driers Drier object
 * @param {[String[]]} accessGroups Valid access groups
 */
async function validateAndCleanCreateBuilding(
    name,
    location,
    washers,
    driers,
    accessGroups,
) {
  if (typeof name !== 'string') throw new Error('Name was not a string');
  name = name.trim();
  if (name.length === 0) throw new Error('Empty name specified');

  if (await Building.exists({name})) {
    throw new Error('Refusing to create a duplicate building');
  }

  if (typeof location !== 'object') {
    throw new Error('Location was not an object');
  }
  if (location.type !== 'Point') {
    throw new Error('Location was not a valid GeoJSON object');
  }
  if (
    typeof location.coordinates !== 'object' ||
    !Array.isArray(location.coordinates)
  ) {
    throw new Error('Coordinates was not an array');
  }
  if (location.coordinates.length !== 2) {
    throw new Error('Expected coordinates of location to have 2 numbers only');
  }
  location.coordinates.forEach((n) => {
    if (typeof n !== 'number') throw new Error('Coordinate was not a number');
  });
  [lat, lon] = location.coordinates;
  if (lat > 90 || lat < -90) throw new Error('Lattitude out of range');
  if (lon > 180 || lon < -180) throw new Error('Longitude out of range');
  if (washers === []) washers = undefined;
  if (driers === []) driers = undefined;
  if (washers === undefined && driers === undefined) {
    throw new Error('No machines were specified for this building');
  }
  washers = await checkListOfMachines(washers);
  driers = await checkListOfMachines(driers);
  if (accessGroups !== undefined) {
    if (typeof accessGroups != 'object') {
      throw new Error('Expected access groups to be an object (list)');
    }
    if (!Array.isArray(accessGroups)) {
      throw new Error('Expected access groups to be a list of access groups');
    }
    for (let i = 0; i < accessGroups.length; i++) {
      if (typeof accessGroups[i] !== 'string') {
        throw new Error('Expected all access groups to be strings');
      }
      accessGroups[i] = accessGroups[i].trim().toLowerCase();
      if (accessGroups[i] === '') {
        throw new Error('Cannot have a blank access group');
      }
    }
  }
  return {name, location, washers, driers, accessGroups};
}
/**
 * Make a building
 * @param {String} name The name of the building
 * @param {Number[]} location Lat/Lon of building
 * @param {[Object[]]} washers Washer object
 * @param {[Object[]]} driers Drier object
 * @param {[String[]]} accessGroups Valid access groups
 *
 * @return {Object} The created object
 */
async function createBuilding(
    name,
    location,
    washers = undefined,
    driers = undefined,
    accessGroups = undefined,
) {
  ({name, location, washers, driers, accessGroups} =
    await validateAndCleanCreateBuilding(
        name,
        location,
        washers,
        driers,
        accessGroups,
    ));
  return await Building.create({
    name,
    location,
    washers,
    driers,
    accessGroups,
  });
}

module.exports = createBuilding;
