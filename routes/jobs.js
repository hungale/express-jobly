const express = require("express");
const Company = require("../models/company");
const Job = require("../models/job");
const ExpressError = require('../expressError');
const router = new express.Router();
const jsonSchema = require('jsonschema');
const jobSchemaPost = require("../schemas/jobSchemaPost.json");
const companySchemaUpdate = require("../schemas/jobSchemaPatch.json");

/** POST / - add Job to db
*
* => {job: [{title, salary, equity, company_handle, date_posted}]}
* */

router.post("/", async (req, res, next) => {
  try {
    const result = jsonSchema.validate(req.body, jobSchemaPost);
    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    if (typeof err.message === 'string'){
      if (err.message.match(/foreign/g)) {
        return next(new ExpressError('Company does not exist in our records', 404));
  }
}
    return next(err);
  };
});

/** GET / - get jobs that match the query String parameters.
*
* => {job: [{id, title, salary, equity, company_handle, date_posted}, ...]}
* */

router.get('/', async (req, res, next) => {
  try {
    const jobs = await Job.all(req.query);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  };
});

/** GET / - get certain job by id
*
* => {job: [{id, title, salary, equity, company_handle, date_posted}]}
* */

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.getBy(id);
    return res.json({ job });

  } catch (err) {
    return next(err);
  };
});

/** PATCH / - adjust Job by id
*
* => {job: [{id, title, salary, equity, company_handle, date_posted}]}
* */

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.update(id, req.body);

    const result = jsonSchema.validate(req.body, jobSchemaPost);
    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }

    return res.json({ job });
  } catch (err) {
    return next(err);
  };
});

/** DELETE / - delete Job by id
*
* => {job: [{title}]}
* */

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.delete(id);
    return res.json({ message: `Job was deleted` });
  } catch (err) {
    return next(err);
  };
});

module.exports = router;