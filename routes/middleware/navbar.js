const User = require("../../data/User");
const expressHandlebars = require("express-handlebars").create();

/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {Promise<void>}
 */
async function renderNavbarToReq(req, res, next) {
  let navbarUserInfo = undefined;
  if (res.locals.userValidated) {
    navbarUserInfo = {};
    navbarUserInfo.buildings = await User.getAllBuildingsForUser(
      res.locals.userId
    );
    for (let i = 0; i < navbarUserInfo.buildings.length; i++) {
      navbarUserInfo.buildings[i] = navbarUserInfo.buildings[i];
    }
  }
  const currentPageIsHome = req.url === "/";
  const context = {
    userLoggedIn: res.locals.loggedIn,
    currentPageIsHome,
    navbarUserInfo,
  };
  res.locals.navbar = await expressHandlebars.render(
    "views/navbar/main.handlebars",
    context
  );
  await next();
}

module.exports = {
  renderNavbarToReq,
};
