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
  if (req.userValidated) {
    navbarUserInfo = {};
    navbarUserInfo.buildings = await User.getAllBuildingsForUser(userId);
    for (let i = 0; i < navbarUserInfo.buildings.length; i++) {
      navbarUserInfo.buildings[i] = navbarUserInfo.buildings[i].toJSON();
    }
  }
  const currentPageIsHome = req.url === "/";
  const context = {
    userLoggedIn: req.userValidated,
    currentPageIsHome,
    navbarUserInfo,
  };
  req.navbar = await expressHandlebars.render(
    "views/navbar/main.handlebars",
    context
  );
  await next();
}

module.exports = {
  renderNavbarToReq,
};
