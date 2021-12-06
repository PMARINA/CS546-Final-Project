const Model = require('../../models/machineModel');

/**
 * Validate params to create
 * @param {String} name The name of the model
 * @param {Object[]} cycles A list of cycles available
 * @return {Object} The input but modified slightly
 */
async function validateAndCleanCreate(name, cycles) {
  if (typeof name !== 'string') throw new Error('Name was not a string');
  name = name.trim();
  if (await Model.exists({name})) {
    throw new Error('Cannot create a duplicate model');
  }
  if (typeof cycles !== 'object' || !Array.isArray(cycles)) {
    throw new Error('Cycles was not an array');
  }
  const names = new Set();
  const timeRegex = /\d{2}:\d{2}:\d{2}/;
  for (let i = 0; i < cycles.length; i++) {
    const c = cycles[i];
    if (typeof c !== 'object') {
      throw new Error(
          'Expected the cycle list to contain washer/drier cycle objects only',
      );
    }
    if (typeof c.name !== 'string') {
      throw new Error('Expected cycle name to be a string');
    }
    cycles[i].name = c.name.trim();
    if (cycles[i].name === '') throw new Error('Cycle name was empty');
    if (names.has(c.name)) {
      throw new Error(
          'Multiple cycles with the same name are not allowed for a single machine',
      );
    }
    names.add(c.name);
    if (!c.time.match(timeRegex)) {
      throw new Error(
          'The duration of the cycle does not match the required format (00:00:00)',
      );
    }
  }
  return {name, cycles};
}

/**
 * Create a model of washer/drier
 * @param {String} name The name of the model
 * @param {Object[]} cycles A list of cycles available
 * @return {Object}
 */
async function create(name, cycles) {
  ({name, cycles} = await validateAndCleanCreate(name, cycles));
  return await Model.create({name, cycles});
}

module.exports = create;
