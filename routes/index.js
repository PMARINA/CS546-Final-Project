const appointments = require('./appointments');
const home = require('./home');
const signup = require('./signup');
const login = require('./login');
const logout = require('./logout');
const users = require('./users');
const buildings = require('./buildings');
const reports = require('./reports');
const machineModel = require('./machineModels');
const notification = require('./notification');
const constructorMethod = (app) => {
  // app.uses go here
  app.use('/', home);
  app.use('/signup', signup);
  app.use('/login', login);
  app.use('/logout', logout);
  app.use('/users', users);
  app.use('/buildings', buildings);
  app.use('/models', machineModel);
  app.use('/appointments', appointments);
  app.use('/reports', reports);
  app.use('/notification',notification)
  app.all('*', (req, res) => {
    res.status(404).json('Error 404: Site path not found');
  });
};

module.exports = constructorMethod;
