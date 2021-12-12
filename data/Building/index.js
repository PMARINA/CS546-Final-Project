const create = require("./create").createBuilding;
const comment = require("./comment").comment;
const reply = require("./reply").reply;
const getAllAccessGroups = require("./getAllAccessGroups").getAllAccessGroups;

module.exports = {
  create,
  comment,
  reply,
  getAllAccessGroups,
};
