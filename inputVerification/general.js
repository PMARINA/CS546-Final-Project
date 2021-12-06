const {ObjectId} = require('mongodb');

// When set to true; all errors will also print which function they come from
const DEBUG_MODE = false;

/**
 * verifies a defined arg is passed to the function
 * @param {*} arg the arg to verify exists
 * @param {string} argName the name of the arg to print in error (when applicable)
 * @param {string} funName the name of the function this argument is being called from
 */
const argExists = function argExists(arg, argName, funName) {
  let errStr = `${argName} is missing`;
  if (DEBUG_MODE) {
    errStr += ` (function: ${funName})`;
  }

  if (arg === undefined) throw new Error(errStr);
};

/** verifies arg is an array
 * @param {*} arg argument to test
 * @param {string} argName the name of the arg to print in error (when applicable)
 * @param {string} funName the name of the function this argument is being called from
 */
const isArray = function isArray(arg, argName, funName) {
  let errStr = `${argName} is not an array`;
  if (DEBUG_MODE) {
    errStr += ` (function: ${funName})`;
  }

  if (!Array.isArray(arg)) throw new Error(errStr);
};

/**
 * verifies arg is an object
 * @param {*} arg argument to test
 * @param {string} argName the name of the arg to print in error (when applicable)
 * @param {string} funName the name of the function this argument is being called from
 */
const isObj = function isObj(arg, argName, funName) {
  let errStr = `${argName} is not an object`;
  if (DEBUG_MODE) {
    errStr += ` (function: ${funName})`;
  }

  if (typeof arg !== 'object' || arg === null || Array.isArray(arg)) {
    throw new Error(errStr);
  }
};

/**
 * verifies the arg is of the desired type
 * @param {*} arg argument to test
 * @param {string} argName the name of the arg to print in error (when applicable)
 * @param {string} funName the name of the function this argument is being called from
 * @param {string} desiredType type to check against
 */
const isType = function isType(arg, argName, funName, desiredType) {
  let errStr = `${argName} is not of type ${desiredType}`;
  if (DEBUG_MODE) {
    errStr += ` (function: ${funName})`;
  }

  switch (desiredType) {
    case 'array':
      isArray(arg, argName, funName);
      break;
    case 'object':
      isObj(arg, argName, funName);
      break;
    case 'objectId':
      if (typeof arg !== 'string') throw new Error(errStr);
      isObjId(arg, argName, funName);
      break;
    case 'number':
      if (typeof arg !== desiredType) {
        if (typeof arg === 'string') {
          try {
            parseInt(arg);
          } catch (e) {
            throw new Error(errStr);
          }
        } else {
          throw new Error(errStr);
        }
      }
      break;
    default:
      if (typeof arg !== desiredType) throw new Error(errStr);
  }
};

/**
 * verified arg is proper mongodb ObjectId
 * @param {*} id arg to verify is proper ObjectId
 * @param {string} argName name of the argument to print in errors
 * @param {string} funName the name of the function this argument is being called from
 */
const isObjId = function isObjId(id, argName, funName) {
  let errStr = `${argName} is not a valid ObjectId`;
  if (DEBUG_MODE) {
    errStr += ` (function: ${funName})`;
  }

  try {
    new ObjectId(id);
  } catch (e) {
    throw new Error(errStr);
  }
};

/**
 * verifies str has at least 1 non-' ' character
 * @param {string} str string to verify has at least 1 non-' ' character
 * @param {string} argName the name of the arg to print in error (when applicable)
 * @param {string} funName the name of the function this argument is being called from
 */
const strNotBlanks = function strNotBlanks(str, argName, funName) {
  let errStr = `${argName} cannot be a blank string`;
  if (DEBUG_MODE) {
    errStr += ` (function: ${funName})`;
  }

  const newStr = str.trim();
  if (newStr.length === 0) {
    throw new Error(errStr);
  }
};

/**
 * verifies array is not empty
 * @param {*} arr array to test size of
 * @param {string} argName the name of the arg to print in error (when applicable)
 * @param {string} funName the name of the function this argument is being called from
 */
const arrNotEmpty = function arrNotEmpty(arr, argName, funName) {
  let errStr = `${argName} is empty`;
  if (DEBUG_MODE) {
    errStr += ` (function: ${funName})`;
  }

  if (arr.length === 0) throw new Error(errStr);
};

/**
 * verifies object is not empty
 * @param {*} obj object to test size of
 * @param {*} argName the name of the arg to print in error (when applicable)
 * @param {string} funName the name of the function this argument is being called from
 */
const objIsNotEmpty = function objIsNotEmpty(obj, argName, funName) {
  let errStr = `${argName} is empty`;
  if (DEBUG_MODE) {
    errStr += ` (function: ${funName})`;
  }

  if (Object.keys(obj).length === 0) throw new Error(errStr);
};

module.exports = {
  /**
   * generic function to perform basic validation checks
   * on a function's given arguments
   * @param {*} arg the argument to validate
   * @param {string} argName the name of the argument
   * @param {string} funName the function the argument is being passed to
   * @param {string} desiredType the desired data type of the argument: boolean, number, string, array, object, objectId
   */
  verifyArg(arg, argName, funName, desiredType) {
    argExists(arg, argName, funName);
    isType(arg, argName, funName, desiredType);

    switch (desiredType) {
      case 'string':
        strNotBlanks(arg, argName, funName);
        break;
      case 'array':
        arrNotEmpty(arg, argName, funName);
        break;
      case 'object':
        objIsNotEmpty(arg, argName, funName);
        break;
      default:
        return;
    }
  },

  /**
   * verifies an arg is NOT passed to the function
   * @param {*} arg dummy argument that your function shouldn't have
   * @param {string} funName the name of the function to print in error (when applicable)
   */
  argDNE(arg, funName) {
    if (typeof arg !== 'undefined') {
      throw new Error(`${funName} takes no arguments`);
    }
  },

  /**
   * verifies a numerical arg is within accepted range
   * @param {number} num number to verify the range of
   * @param {string} argName the name of the arg to print in error (when applicable)
   * @param {string} funName the name of the function this argument is being called from
   * @param {number} lower lower bound (inclusive)
   * @param {number} upper upper bound (inclusive)
   */
  numRange(num, argName, funName, lower, upper) {
    let errStr = `${argName} must between ${lower} and ${upper}, inclusive, not ${num}`;
    if (DEBUG_MODE) {
      errStr += ` (function: ${funName})`;
    }

    if (num < lower || num > upper) {
      throw new Error(errStr);
    }
  },
};
