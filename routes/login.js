const express = require("express");
const User = require("../models/user");
const ExpressError = require('../expressError');
const router = new express.Router();

/** POST / - authenticate user, return JWT
*
* => {token: token}
* */
router.post("/", async (req, res, next) => {
  try {
    const token = await User.login(req.body);

    return res.json({token});
  } catch(err) {
    return next(err);
  }
});

module.exports = router;