const express = require("express");
const Company = require("../models/company");
const Job = require("../models/job");
const ExpressError = require('../expressError');
const router = new express.Router();
const jsonSchema = require('jsonschema');
const companySchema = require("../schemas/companySchema.json");
const companySchemaUpdate = require("../schemas/companySchemaUpdate.json");

router.post("/", async (req, res, next) => {
  try {
    const job = await Job.create(req.body);

    return res.json({job});
  } catch(err) {
    return next(err);
  }
});

module.exports = router;