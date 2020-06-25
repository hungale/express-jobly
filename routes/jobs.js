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

router.get('/', async (req, res, next) => {
  try {
    const jobs = await Job.all(req.query);
    console.log(jobs);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.getBy(id);
    return res.json({ job });

  } catch (err) {
    return next(err);
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.update(id, req.body);
    return res.json({ job })
  } catch (err) {
    
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.delete(id);
    return res.json({ Message: `${job.title} deleted` });
  } catch (err) {
    return next(err);
  }
})

module.exports = router;