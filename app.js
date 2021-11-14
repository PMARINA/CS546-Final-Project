/* eslint-disable no-unused-vars */
const config = require('./config.json');
const User = require('./data/User');
const MachineModel = require('./data/MachineModel');
const Building = require('./data/Building');
const Maintenance = require('./data/Maintenance');
const Report = require('./data/Report');
const mongoose = require('mongoose');
const Appointment = require('./data/Appointment');

/**
 * Test function to test creation of users
 */
async function createUser() {
  const student = await User.createUser(
      'pmyneni@test.com',
      'Pridhvi',
      'Myneni',
      'QWEqwe123+',
      'jacobus',
      'student',
  );
  console.log(student);
}

/**
 * Test function to test creation of washer/dryer models
 */
async function createModel() {
  await MachineModel.create('MainModel', [
    {name: 'Quick', time: '00:15:00'},
    {name: 'Normal', time: '00:45:00'},
  ]);
}

/**
 * Test function to test creation of a maintenace period
 */
async function createMaintenance() {
  await Maintenance.create(
      '2021-11-10',
      '2021-11-13',
      '6190489816cb7505b4e3c0dc',
      'Test',
  );
}

/**
 * Test function to test creation of a building
 */
async function createBuilding() {
  // name, location, washers, driers, accessGroups
  await Building.create(
      'Palmer New',
      {
        type: 'Point',
        coordinates: [50, 24.4],
      },
      [{name: 'A', modelId: '6190449e96e50f05403d12c5'}],
      undefined,
      undefined,
  );
}

/**
 * Test commenting on building
 */
async function comment() {
  await Building.comment(
      '6190489816cb7505b4e3c0db',
      '6190573a63c77d447a815c08',
      'COment',
  );
}

/**
 * Test the reply to the existing comment
 */
async function reply() {
  console.log(
      await Building.reply(
          '6190489816cb7505b4e3c0db',
          '61905bbd61948d77b2ff9482',
          '6190573a63c77d447a815c08',
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
      '6190573a63c77d447a815c08',
      '6190489816cb7505b4e3c0dc',
      'The washer makes a lot of noise',
      'inconvenient',
  );
}

/**
 * Test appointment creation
 */
async function createAppointment() {
  apt = await Appointment.create(
      '6190489816cb7505b4e3c0db',
      '61907efdf67267e472c6d8ed',
      '6190489816cb7505b4e3c0dc',
      '6190449e96e50f05403d12c8',
      '2021-11-15',
      '2021-11-16',
  );
  console.log(apt);
}

const main = async function() {
  console.log('Connecting to DB');
  await mongoose.connect(config.MONGO.ServerURL);
  console.log('Adding student to DB...');
  // await createUser();
  // await createModel();
  // await createBuilding();
  // await createMaintenance();
  // await comment();
  // await reply();
  // await createReport();
  await createAppointment();
  await mongoose.connection.close();
};
main().then(() => {
  const x = 1;
  x == x;
});
