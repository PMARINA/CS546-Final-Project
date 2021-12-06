/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-vars */
const config = require('./config.json');
const User = require('./data/User');
const MachineModel = require('./data/MachineModel');
const Building = require('./data/Building');
const Maintenance = require('./data/Maintenance');
const Report = require('./data/Report');
const mongoose = require('mongoose');
const Appointment = require('./data/Appointment');
const express = require('express');
const configRoutes = require('./routes');
const expressHandlebars = require('express-handlebars');
const expressSession = require('express-session');
const app = express();
app.engine('handlebars', expressHandlebars.engine());
app.set('view engine', 'handlebars');
// TODO: Remove in production
app.use(express.json());
app.use(express.static('public/'));
app.use(express.urlencoded({extended: true}));
app.use(
  expressSession({
    name: config.APPLICATION.COOKIE.name,
    secret: config.APPLICATION.COOKIE.secret,
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: config.APPLICATION.COOKIE.maxAgeMillis},
  }),
);


userId = '61abc8a6d7ea6b4caa45b254';
modelId = '61ac0195cef4a3f35275f680';
reportId = '619119fa198f4826d19a6851';
machineId = '61ac01b03ea44e395876e757';
cycleId = '61ac0195cef4a3f35275f681';
buildingId = '61ac01b03ea44e395876e756';
parentCommentId = '61905bbd61948d77b2ff9482';

async function createUser(fname, lname, email, accessGroups, role, creatorId) {
  if (typeof accessGroups === 'string') {
    accessGroups = [accessGroups];
  }
  creatorId = creatorId ? creatorId : '';
  return await User.createUser(
    email,
    fname,
    lname,
    'QWEqwe123+',
    accessGroups,
    role,
    creatorId,
  );
}

/**
 * Test modification of a student
 * @return {Promise<void>}
 */
async function modifyUser() {
  await User.modifyUser('61a2a1c2570a2dd1354421fe', '61a29fe799cc42ca249e556b', {
    name: {first: 'notPridhvi'},
    role: 'ra'
  });
}

/**
 * Test function to test creation of washer/dryer models
 */
async function createModel() {
  console.log("Creating a model");
  return await MachineModel.create('MainModel', [
    {name: 'Quick', time: '00:15:00'},
    {name: 'Normal', time: '00:45:00'},
    {name: 'Heavy', time: '01:10:00'},
  ]);
}

/**
 * Test function to test creation of a maintenance period
 */
async function createMaintenance() {
  await Maintenance.create('2021-11-10', '2021-11-13', machineId, 'Test');
}

/**
 * Test function to test creation of a building
 */
async function createBuilding(name, washers, driers, accessGroups) {
  // name, location, washers, driers, accessGroups
  return await Building.create(
    name,
    {
      type: 'Point',
      coordinates: [50, 24.4],
    },
    washers,
    driers,
    accessGroups,
  );
}

/**
 *
 * @param {String} name The name of the building
 * @param {String} modelId The object id of the model
 * @returns {Promise<void>}
 */
async function createStevensBuilding(name, modelId) {
  name = name.trim();
  return await createBuilding(name, [{name: 'Washer A', modelId}], [{name: 'Drier A', modelId}], [name.toLowerCase()]);
}

/**
 * Test commenting on building
 */
async function comment() {
  await Building.comment(buildingId, userId, 'COment');
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
      'Learn to use spellcheck!',
    ),
  );
}

/**
 * Test report-creation
 */
async function createReport() {
  await Report.create(
    'machine',
    userId,
    machineId,
    'The washer makes a lot of noise',
    'inconvenient',
  );
}

/**
 * Test appointment creation
 */
async function createAppointment(buildingId, userId, machineId, cycleId) {
  const apt = await Appointment.create(
    buildingId,
    userId,
    machineId,
    cycleId,
    '2021-12-15T11:00:00Z',
    '2021-12-15T13:00:00Z',
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

/**
 * Test function to test creation of users
 */
async function createAdminUser() {
  return await User.createUser(
    config.APPLICATION.DEFAULTS.ADMIN_CREDENTIALS.Username,
    'Admin',
    'User',
    config.APPLICATION.DEFAULTS.ADMIN_CREDENTIALS.Password,
    [],
    'admin',
  );
}

const main = async function () {
  // configRoutes(app);
  console.log('Connecting to DB');
  await mongoose.connect(config.MONGO.ServerURL);

  const adminUser = await createAdminUser();
  const adminId = adminUser._id.toString();
  // create the only model of washer or drier in existence.
  const model = (await createModel());
  const modelId = model._id.toString();

  // create all the buildings;
  const palmer = await createStevensBuilding('Palmer', modelId);
  const jonas = await createStevensBuilding('Jonas', modelId);
  const cph = await createStevensBuilding('CPH', modelId);
  const riverTerrace = await createStevensBuilding('River Terrace', modelId);
  const davis = await createStevensBuilding('Davis', modelId);
  const humphreys = await createStevensBuilding('Humphreys', modelId);

  // create some sample users
  const studentUser = await createUser("Student", "User", "suser@test.edu", "palmer", "student", adminId);
  const raUser = await createUser('RA', 'User', 'rauser@test.edu', "palmer", "ra");
  const maintenanceUser = await createUser("Maintenance", "User", "muser@test.edu", "palmer", "maintenance");

  const userId = studentUser._id.toString();
  const buildingId = palmer._id.toString();
  const washerId = palmer.washers[0]._id.toString();
  const cycleId = model.cycles[0]._id.toString();
  const appointment = await createAppointment(buildingId, userId, washerId, cycleId);
  // app.listen(3000, () => {
  //   console.log('Server live @ http://localhost:3000');
  // });
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
  await mongoose.connection.close();
};
main().then(() => {
  const x = 1;
  return x === x;
});
