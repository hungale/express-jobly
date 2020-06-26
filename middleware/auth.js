const { SECRET_KEY } = require('../config');
const jwt = require('jsonwebtoken');
const ExpressError = require('../expressError');

function authenticateJWT(req, res, next) {
  try {

    const payload = jwt.verify(req.body.token, SECRET_KEY)
    console.log(payload,'.....')
    req.user = payload;
    
    return next();
  } catch (err) {
    return next();
  };
};

function checkIfLoggedIn(req, res, next) {
  try {
    if (!req.user) throw new ExpressError('You must be logged in', 401);
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { authenticateJWT, checkIfLoggedIn };