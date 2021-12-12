const createUser = require("./createUser");
const modifyUser = require("./modifyUser");
const exists = require("./userExists");
const checkCredentials = require("./checkCredentials");
const validate = require("./validate");
const getAllBuildingsForUser =
  require("./getAllBuildingsForUser").getAllBuildingsForUser;

module.exports = {
  createUser,
  modifyUser,
  exists,
  checkCredentials,
  validate,
  getAllBuildingsForUser,
};
