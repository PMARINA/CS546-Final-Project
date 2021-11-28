/* eslint-disable no-unused-vars */
const config = require('./config.json');
const User = require('./data/User');
const mongoose = require('mongoose');

/**
 * Test function to test creation of users
 */
async function createAdminUser() {
  const student = await User.createUser(
      config.APPLICATION.DEFAULTS.ADMIN_CREDENTIALS.Username,
      'Admin',
      'User',
      config.APPLICATION.DEFAULTS.ADMIN_CREDENTIALS.Password,
      [],
      'admin',
  );
  console.log(student);
}

const main = async function() {
  console.log('Connecting to DB...');
  await mongoose.connect(config.MONGO.ServerURL);
  console.log('Adding admin user to DB...');
  await createAdminUser();
  await mongoose.connection.close();
};
main().then(() => {
  const x = 1;
  x == x;
});
