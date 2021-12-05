const createUser = require('./createUser');
const modifyUser = require('./modifyUser');
const exists = require('./userExists');
const checkCredentials = require('./checkCredentials');

module.exports = {
  createUser,
  modifyUser,
  exists,
  checkCredentials,
};
