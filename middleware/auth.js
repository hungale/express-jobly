const { SECRET_KEY } = require('../config');
const jwt = require('jsonwebtoken');
const ExpressError = require('../expressError');

/** Verify that user's token is valid, and attatch user to req */
function authenticateJWT(req, res, next) {
  try {
    const payload = jwt.verify(req.body.token, SECRET_KEY)
    req.user = payload;
    
    return next();
  } catch (err) {
    return next();
  };
};

/** Verify that there is a user logged in */
function checkIfLoggedIn(req, res, next) {
  try {
    if (!req.user) throw new ExpressError('You must be logged in', 401);
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Verify that the current user is allowed to access the current resource */
function checkIfCorrectUser(req, res, next) {
  try {
    if(req.user) {
      if(req.user.username === req.params.username || req.user.is_admin) {
        return next();
      }
      else {
        throw new ExpressError("You don't have access to this page.", 403);
      }
    } else {
      throw new ExpressError("You must be logged in.", 401);
    }
  } catch(err) {
    return next(err);
  }
}

/** Verify that the current user is and admin */
function checkIfAdmin(req, res, next) {
  try {
    if(req.user) {
      if(req.user.is_admin) {
        return next();
      }
      else {
        throw new ExpressError("You don't have access to this page.", 403);
      }
    } else {
      throw new ExpressError("You must be logged in.", 401);
    }
  } catch(err) {
    return next(err);
  }
}

module.exports = { authenticateJWT, checkIfLoggedIn, 
                   checkIfCorrectUser, checkIfAdmin };