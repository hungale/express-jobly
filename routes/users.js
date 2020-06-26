const express = require("express");
const User = require("../models/user");
const ExpressError = require('../expressError');
const router = new express.Router();
const { checkIfLoggedIn } = require('../middleware/auth');
const jsonSchema = require('jsonschema');
const userSchemaPost = require("../schemas/userSchemaPost.json");
const userSchemaPatch = require("../schemas/userSchemaPatch.json");
const { checkIfCorrectUser } = require("../middleware/auth");

/** POST / - add User to db
*
* => {user: [{username, first_name, last_name, email, photo_url, password, is_admin}]}
* */
router.post("/", async (req, res, next) => {
  try {
    const result = jsonSchema.validate(req.body, userSchemaPost);

    if(!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }

    const user = await User.create(req.body);
    const { _token: token } = user;

    return res.status(201).json({ token });
  } catch(err) {
    if(typeof err.constraint === "string") {
      if(err.constraint.match(/((users_pkey)|(users_email_key))/g)) {
        let error = new ExpressError("Username/email already in use.", 400);
        return next(error);
      }
    }
    return next(err);
  }
});

/** GET / - get list of all users
*
* => {users: [{username, first_name, last_name, email}, ...]}
* */
router.get("/", checkIfLoggedIn, async (req, res, next) => {
  try {
    const users = await User.all();

    return res.json({users});
  } catch(err) {
    return next(err);
  }
});


/** GET /:username - get a user matching the provided username
*
* => {user: {username, first_name, last_name, email, photo_url}}
* */
router.get("/:username", checkIfLoggedIn, async (req, res, next) => {
  try {
    const user = await User.get(req.params.username);

    return res.json({user});
  } catch(err) {
    return next(err);
  }
});

/** PATCH /:username - update a user matching the provided username
*
* => {user: {username, first_name, last_name, email, photo_url}}
* */
router.patch("/:username", checkIfCorrectUser, async (req, res, next) => {
  try {
    if ("username" in req.body || "password" in req.body || "email" in req.body) {
      return next({
        status: 400,
        message: "Not allowed to change username/password/email here."
      });
    }
    // don't let them change is_admin, if they aren't allowed to
    if(req.body.token) {
      delete req.body.token;
    }

    const result = jsonSchema.validate(req.body, userSchemaPatch);
    if(!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }

    const user = await User.update(req.params.username, req.body);

    return res.json({user});
  } catch(err) {
    return next(err);
  }
});

/** DELETE /:username - delete a user matching the provided username
*
* => { message: "User deleted" }
* */
router.delete("/:username", checkIfCorrectUser, async (req, res, next) => {
  try {
    const user = await User.delete(req.params.username);

    return res.json({ message: `User ${user.username} deleted` });
  } catch(err) {
    return next(err);
  }
});

module.exports = router;