/* eslint-disable no-unused-vars */
const config = require("./config.json");
const User = require("./data/User");
const MachineModel = require("./data/MachineModel");
const Building = require("./data/Building");
const Maintenance = require("./data/Maintenance");
const Report = require("./data/Report");
const mongoose = require("mongoose");
const Appointment = require("./data/Appointment");
const express = require("express");
const configRoutes = require("./routes");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const app = express();
app.engine("handlebars", expressHandlebars.engine());
app.set("view engine", "handlebars");
// TODO: Remove in production
app.use(express.json());
app.use(express.static("public/"));
app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    name: config.APPLICATION.COOKIE.name,
    secret: config.APPLICATION.COOKIE.secret,
    secure: false,
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: config.APPLICATION.COOKIE.maxAgeMillis },
  })
);

userId = "61abc8a6d7ea6b4caa45b254";
modelId = "61ac0195cef4a3f35275f680";
reportId = "619119fa198f4826d19a6851";
machineId = "61ac01b03ea44e395876e757";
cycleId = "61ac0195cef4a3f35275f681";
buildingId = "61ac01b03ea44e395876e756";
parentCommentId = "61905bbd61948d77b2ff9482";

/**
 * Test function to test creation of users
 */
async function createUser() {
  const student = await User.createUser(
    "pmyneni@test.edu",
    "Pridhvi",
    "Myneni",
    "QWEqwe123+",
    "group",
    "student",
    "61a29fe799cc42ca2949e556"
  );
}

/**
 * Test modification of a student
 * @return {Promise<void>}
 */
async function modifyUser() {
  await User.modifyUser(
    "61a2a1c2570a2dd1354421fe",
    "61a29fe799cc42ca249e556b",
    { name: { first: "notPridhvi" }, role: "ra" }
  );
}

/**
 * Test function to test creation of washer/dryer models
 */
async function createModel() {
  await MachineModel.create("MainModel", [
    { name: "Quick", time: "00:15:00" },
    { name: "Normal", time: "00:45:00" },
  ]);
}

/**
 * Test function to test creation of a maintenance period
 */
async function createMaintenance() {
  await Maintenance.create("2021-11-10", "2021-11-13", machineId, "Test");
}

/**
 * Test function to test creation of a building
 */
async function createBuilding() {
  // name, location, washers, driers, accessGroups
  await Building.create(
    "Palmer New",
    {
      type: "Point",
      coordinates: [50, 24.4],
    },
    [{ name: "A", modelId }],
    undefined,
    undefined
  );
}

/**
 * Test commenting on building
 */
async function comment() {
  await Building.comment(buildingId, userId, "COment");
}

/**
 * Test the reply to the existing comment
 */
async function reply() {
  console.log(
    await Building.reply(
      buildingId,
      parentCommentId,
      userId,
      "Learn to use spellcheck!"
    )
  );
}

/**
 * Test report-creation
 */
async function createReport() {
  await Report.create(
    "machine",
    userId,
    machineId,
    "The washer makes a lot of noise",
    "inconvenient"
  );
}

/**
 * Test appointment creation
 */
async function createAppointment() {
  const apt = await Appointment.create(
    buildingId,
    userId,
    machineId,
    cycleId,
    "2021-11-15",
    "2021-11-16"
  );
  console.log(apt);
}

/**
 * Test resolution
 */
async function markReportResolved() {
  await Report.markResolved(reportId);
}

/**
 * Test report re-opening
 */
async function markReportUnresolved() {
  await Report.markUnresolved(reportId);
}

const main = async function () {
  configRoutes(app);
  console.log("Connecting to DB");
  await mongoose.connect(config.MONGO.ServerURL);
  app.listen(3000, () => {
    console.log("Server live @ http://localhost:3000");
  });
  // await createUser();
  // console.log('Adding student to DB...');
  // await createUser();
  // await modifyUser();
  // await createModel();
  // await createBuilding();
  // await createMaintenance();
  // await comment();
  // await reply();
  // await createReport();
  // await createAppointment();
  // await markReportResolved();
  // await markReportUnresolved();
  // await mongoose.connection.close();
};
main().then(() => {
  const x = 1;
  return x === x;
});
