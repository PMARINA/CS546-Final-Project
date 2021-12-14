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
  return !!req.session.userInfo;
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
  res.status(errCode).render("error", {
    errCode: errCode,
    errMsg: getStatusPhrase(errCode),
    errMsgDescriptive: description,
    navbar: res.locals.navbar,
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
  if (res.locals.userValidated) await next();
  else if (res.locals.loggedIn)
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
  if (res.locals && res.locals.loggedIn) {
    if (res.locals.userValidated) {
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
  if (res.locals && res.locals.loggedIn) {
    if (res.locals.userValidated) {
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
  const allowedRolesSet = new Set(role);
  if (allowedRolesSet.has(res.locals.role)) {
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
    res.locals.loggedIn = true;
    if (await User.exists(userId)) {
      res.locals.userValidated = true;
      res.locals.userId = userId;
      const userInfo = await userModel.findById(userId.toString()).lean();
      res.locals.userInfo = userInfo;
      res.locals.role = userInfo.role;
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
