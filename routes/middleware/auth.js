const User = require("../../data/User");
const userModel = require("../../models/user");
const StatusCodes = require("http-status-codes");
const getStatusPhrase = StatusCodes.getStatusText;
const navbar = require("./navbar").renderNavbarToReq;

// {StatusCodes, ReasonPhrases, getReasonPhrase, getStatusPhrase}

/**
 * Determine if the user has a session cookie
 * @param {Object} req
 * @return {boolean}
 */
function userHasCookie(req) {
  return !!(req.session && req.session.userInfo && req.session.userInfo._id);
}

/**
 *
 * @param {Object} req
 * @return {String} Object Id
 */
function getUserId(req) {
  return req.session.userInfo._id.toString();
}

/**
 * Render an error message
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @param {Object} errCode From the http-status-codes library
 * @param {String} description A description of the error
 */
async function sendError(req, res, errCode, description) {
  await getInfoOnly(req, res, () => {});
  await navbar(req, res, () => {});
  res.status(errCode).render("error", {
    errCode: errCode,
    errMsg: getStatusPhrase(errCode),
    errMsgDescriptive: description,
    navbar: req.navbar,
  });
}

/**
 * Only allow logged in users through
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {Promise<void>}
 */
async function loggedInOnly(req, res, next) {
  await getInfoOnly(req, res, () => {});
  if (req.userValidated) await next();
  else if (req.loggedIn)
    await sendError(
      req,
      res,
      StatusCodes.UNAUTHORIZED,
      "You have an invalid login token. Please clear your cookies and try again."
    );
  else
    await sendError(
      req,
      res,
      StatusCodes.UNAUTHORIZED,
      `You need to be logged in to see this page (${req.originalUrl}).`
    );
}

/**
 * Only allow logged in users through
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {Promise<void>}
 */
async function apiLoggedInOnly(req, res, next) {
  await getInfoOnly(req, res, () => {});
  if (req.session && req.session.userInfo) {
    const userId = req.session.userInfo["_id"];
    req.loggedIn = true;
    if (await User.exists(userId)) {
      req.userValidated = true;
      await next();
    } else {
      res.status(403).json({ redirect: "/logout" });
      // Something funky is going on... let them logout and redirect back home
    }
  } else {
    res.status(401).json({ redirect: "/logout" }); // They can't access the page...
  }
}

/**
 * Don't allow users to interact with forms for new people.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {Promise<void>}
 */
async function apiAnonymousOnly(req, res, next) {
  if (req.session && req.session.userInfo) {
    const userId = req.session.userInfo["_id"];
    if (await User.exists(userId)) {
      res.json({ redirect: "/" });
    } else {
      res.status(401).json({ redirect: "/logout" });
      // Something funky is going on... let them logout and redirect back home
    }
  } else {
    await next();
  }
}

/**
 * Only allow users with the prescribed roles to continue. Others get the 403.
 * @param {String | String[]} role The allowed role(s)
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @returns {Promise<void>}
 */
async function onlyAllowRole(role, req, res, next) {
  if (typeof role === "string") {
    role = [role];
  }
  role = new Set(role);
  if (role.has(req.role)) {
    await next();
  } else {
    await sendError(
      req,
      res,
      StatusCodes.FORBIDDEN,
      `You are not allowed to view this page. Only people in {${Array.from(
        role
      ).toString()}} can see this page`
    );
  }
}

/**
 * Only allow logged in users through
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {Promise<void>}
 */
async function getInfoOnly(req, res, next) {
  if (userHasCookie(req)) {
    const userId = getUserId(req);
    req.loggedIn = true;
    if (await User.exists(userId)) {
      req.userValidated = true;
      req.userId = userId;
      req.userData = await userModel.findById(userId.toString());
      req.role = req.userData.role;
    }
  }
  await next();
}

module.exports = {
  loggedInOnly,
  apiLoggedInOnly,
  apiAnonymousOnly,
  getInfoOnly,
  sendError,
  onlyAllowRole,
};
