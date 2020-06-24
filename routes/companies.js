const express = require("express");
const Company = require("../models/company");

const router = new express.Router();

/** GET / - get list of handles and names for all company objects
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", async (req, res, next) =>  {
  try {
    console.log("GET query params", req.query);



    const companies = await Company.all(req.query);
    return res.json({companies})

  } catch(err) {
    return next(err);
  }
});


router.post("/", async (req, res, next) => {
  try {
    const company = await Company.create(req.body);

    return res.status(201).json({company});
  } catch(err) {
    return next(err);
  }
});

module.exports = router;