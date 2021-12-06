const appointments = require('./appointments');
const home = require('./home');
const signup = require('./signup');
const login = require('./login');
const logout = require('./logout');
const users = require('./users');
const buildings = require('./buildings');
const reports = require('./reports');
const machineModel = require('./machineModels');
const preferences = require('./preferences');
const StatusCodes = require('http-status-codes');
const getStatusPhrase = StatusCodes.getStatusText;
const authMiddleware = require('./middleware').auth;
const navMiddleware = require('./middleware').navbar;
const web = require('./web');
const constructorMethod = (app) => {
  // app.uses go here
  app.use(authMiddleware.getInfoOnly);
  app.use(navMiddleware.renderNavbarToReq);
  app.use('/', home);
  app.use('/signup', signup);
  app.use('/login', login);
  app.use('/logout', logout);
  app.use('/users', users);
  app.use('/buildings', buildings);
  app.use('/models', machineModel);
  app.use('/appointments', appointments);
  app.use('/reports', reports);
  app.use('/preferences', preferences);
  app.use('/web', web);
  app.all('*', authMiddleware.getInfoOnly, navMiddleware.renderNavbarToReq, (req, res) => {
    const url = req.protocol + '://' + req.get('host') + req.originalUrl; // from https://stackoverflow.com/a/10185427
    res.status(StatusCodes.NOT_FOUND).render('error', {
      navbar: req.navbar,
      errCode: StatusCodes.NOT_FOUND,
      errMsg: getStatusPhrase(StatusCodes.NOT_FOUND),
      errMsgDescriptive: `${req.method} @ ${url} is not valid on this server`,
    });
  });
};

module.exports = constructorMethod;
